import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '~/utils/motion'
import {
  createReachTable,
  fitTimelinePath,
  setupTimelineLine,
  smoothLengthAt,
} from '../scrollAnimation'

const killTrigger = vi.fn()

interface TriggerConfig {
  onUpdate: (self: unknown) => void
  onRefresh: (self: unknown) => void
}

vi.mock('gsap', () => {
  const gsap = { registerPlugin: vi.fn() }
  return { gsap, default: gsap }
})

vi.mock('gsap/ScrollTrigger', () => {
  const ScrollTrigger = {
    refresh: vi.fn(),
    create: vi.fn(() => ({
      kill: killTrigger,
      start: 0,
      scroll: () => 0,
    })),
  }
  return { ScrollTrigger, default: ScrollTrigger }
})

vi.mock('~/utils/motion', () => ({
  prefersReducedMotion: vi.fn(() => false),
}))

const points = (d: string) => {
  const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
  const result: [number, number][] = []
  for (let i = 0; i < numbers.length; i += 2) {
    result.push([numbers[i]!, numbers[i + 1]!])
  }
  return result
}

describe('fitTimelinePath', () => {
  it.each([
    [375, 84, 3900],
    [768, 84, 3500],
    [1280, 84, 3260],
  ])(
    'при ширине %ipx начинается на startY и заканчивается на endY',
    (width, startY, endY) => {
      const path = points(fitTimelinePath(width, startY, endY))

      expect(path[0]![1]).toBeCloseTo(startY, 0)
      expect(path.at(-1)![1]).toBeCloseTo(endY, 0)
    },
  )

  it.each([320, 375, 640, 768, 1024, 1280, 1440, 1920])(
    'при ширине %ipx концы кривой попадают в картинки (168px по центру)',
    width => {
      const path = points(fitTimelinePath(width, 84, 3000))
      const center = width / 2

      expect(Math.abs(path[0]![0] - center)).toBeLessThan(84)
      expect(Math.abs(path.at(-1)![0] - center)).toBeLessThan(84)
    },
  )

  it('на широком экране рисунок не шире 1080px и стоит по центру', () => {
    const width = 1920
    const anchors = points(fitTimelinePath(width, 84, 3000)).filter(
      (_, index) => index % 3 === 0,
    )
    const xs = anchors.map(([x]) => x)

    expect(Math.min(...xs)).toBeGreaterThanOrEqual((width - 1080) / 2)
    expect(Math.max(...xs)).toBeLessThanOrEqual((width + 1080) / 2)
  })
})

describe('createReachTable', () => {
  it('на прямом участке длина и высота взаимно обратны', () => {
    const table = createReachTable(1000, l => l)

    expect(table.reachAt(250)).toBeCloseTo(250)
    expect(table.lengthAt(250)).toBeCloseTo(250)
    expect(table.lengthAt(-10)).toBe(0)
    expect(table.lengthAt(5000)).toBe(1000)
  })

  it('петлю вверх линия проходит, не теряя достигнутой высоты', () => {
    const yAt = (l: number) => (l <= 100 ? l : l <= 150 ? 200 - l : l - 100)
    const table = createReachTable(300, yAt)

    expect(Math.abs(table.reachAt(150) - 100)).toBeLessThan(16)
    expect(Math.abs(table.lengthAt(90) - 90)).toBeLessThan(16)
    expect(table.lengthAt(110)).toBeGreaterThan(200)
  })
})

describe('smoothLengthAt', () => {
  const loop = createReachTable(300, l =>
    l <= 100 ? l : l <= 150 ? 200 - l : l - 100,
  )

  it('петлю рисует постепенно, без скачка длины', () => {
    const lengthFor = smoothLengthAt(loop.lengthAt, 0, 200, 40)
    let maxStep = 0
    for (let y = -50; y < 260; y++) {
      maxStep = Math.max(maxStep, lengthFor(y + 1) - lengthFor(y))
    }

    expect(maxStep).toBeLessThan(5)
  })

  it('не убывает и доходит от нуля до полной длины', () => {
    const lengthFor = smoothLengthAt(loop.lengthAt, 0, 200, 40)
    let previous = lengthFor(-100)
    for (let y = -99; y < 300; y++) {
      expect(lengthFor(y)).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = lengthFor(y)
    }

    expect(lengthFor(-100)).toBe(0)
    expect(lengthFor(300)).toBe(300)
  })

  it('на прямом участке перо остаётся на линии чтения', () => {
    const straight = createReachTable(1000, l => l)
    const lengthFor = smoothLengthAt(straight.lengthAt, 0, 1000, 160)

    expect(lengthFor(500)).toBeCloseTo(500, 0)
  })
})

describe('setupTimelineLine', () => {
  const observer = { observe: vi.fn(), disconnect: vi.fn() }
  const READING_OFFSET = 0.4 * window.innerHeight

  const box = (top: number, height: number) => ({ top, height }) as DOMRect

  const createElements = () => {
    const root = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const first = document.createElement('img')
    const last = document.createElement('img')
    const year = document.createElement('h3')

    Object.defineProperty(root, 'clientWidth', { value: 1200 })
    Object.defineProperty(root, 'clientHeight', { value: 3400 })
    root.getBoundingClientRect = () => box(100, 3400)
    first.getBoundingClientRect = () => box(100, 168)
    last.getBoundingClientRect = () => box(3216, 168)
    year.getBoundingClientRect = () => box(590, 20)
    path.getTotalLength = () => 1000
    path.getPointAtLength = (length: number) =>
      ({ x: 0, y: length }) as DOMPoint

    return {
      root,
      svg,
      path,
      icon,
      year,
      anchors: () => [first, last] as const,
      stations: () => [year],
    }
  }

  const scrollTo = (y: number, hook: keyof TriggerConfig = 'onUpdate') => {
    const [[config]] = vi.mocked(ScrollTrigger.create).mock
      .calls as unknown as [[TriggerConfig]]
    config[hook]({ start: 0, scroll: () => y + READING_OFFSET })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prefersReducedMotion).mockReturnValue(false)
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function () {
        return observer
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('строит кривую от центра первой картинки до центра последней', () => {
    const elements = createElements()

    setupTimelineLine(elements)

    const path = points(elements.path.getAttribute('d')!)
    expect(path[0]![1]).toBeCloseTo(84, 0)
    expect(path.at(-1)![1]).toBeCloseTo(3200, 0)
    expect(elements.svg.getAttribute('viewBox')).toBe('0 0 1200 3400')
    expect(elements.path.style.strokeDasharray).toBe('1000')
    expect(elements.path.style.strokeDashoffset).toBe('1000')
  })

  it('дорисовывает линию до линии чтения и ставит перо на кончик', () => {
    const elements = createElements()
    setupTimelineLine(elements)

    scrollTo(600)

    expect(elements.path.style.strokeDashoffset).toBe('400')
    expect(elements.icon.getAttribute('transform')).toBe('translate(0 600)')
  })

  it('метку только переносит, но не масштабирует', () => {
    const elements = createElements()
    setupTimelineLine(elements)

    scrollTo(300)

    expect(elements.icon.getAttribute('transform')).toMatch(
      /^translate\([\d.\- ]+\)$/,
    )
  })

  it('отмечает год, до которого дошло перо, и снимает отметку назад', () => {
    const elements = createElements()
    setupTimelineLine(elements)

    scrollTo(600)
    expect(elements.year.hasAttribute('data-reached')).toBe(true)

    scrollTo(400)
    expect(elements.year.hasAttribute('data-reached')).toBe(false)
  })

  it('когда линия дорисована, отмечает и год под последним фото', () => {
    const elements = createElements()
    elements.year.getBoundingClientRect = () => box(1500, 20)
    setupTimelineLine(elements)

    scrollTo(1300)

    expect(elements.path.style.strokeDashoffset).toBe('0')
    expect(elements.year.hasAttribute('data-reached')).toBe(true)
  })

  it('после пересчёта раскладки ставит перо по прокрутке', () => {
    const elements = createElements()
    setupTimelineLine(elements)

    scrollTo(700, 'onRefresh')

    expect(elements.path.style.strokeDashoffset).toBe('300')
  })

  it('следит за размерами колонки и страницы', () => {
    const elements = createElements()
    setupTimelineLine(elements)
    const [[callback]] = vi.mocked(ResizeObserver).mock.calls as unknown as [
      [ResizeObserverCallback],
    ]

    elements.anchors()[1].getBoundingClientRect = () => box(3516, 168)
    callback(
      [{ target: elements.root } as unknown as ResizeObserverEntry],
      observer as unknown as ResizeObserver,
    )

    const path = points(elements.path.getAttribute('d')!)
    expect(path.at(-1)![1]).toBeCloseTo(3500, 0)
    expect(observer.observe).toHaveBeenCalledWith(document.body)
    expect(ScrollTrigger.refresh).toHaveBeenCalled()
  })

  it('при reduced motion показывает линию и годы сразу, без прокрутки', () => {
    vi.mocked(prefersReducedMotion).mockReturnValue(true)
    const elements = createElements()

    setupTimelineLine(elements)

    expect(ScrollTrigger.create).not.toHaveBeenCalled()
    expect(elements.path.style.strokeDashoffset).toBe('0')
    expect(elements.year.hasAttribute('data-reached')).toBe(true)
  })

  it('cleanup снимает ScrollTrigger и наблюдатель', () => {
    const cleanup = setupTimelineLine(createElements())

    cleanup()

    expect(observer.disconnect).toHaveBeenCalled()
    expect(killTrigger).toHaveBeenCalled()
  })
})
