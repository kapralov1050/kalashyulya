import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '~/utils/motion'

gsap.registerPlugin(ScrollTrigger)

type Point = readonly [x: number, y: number]
type Segment = readonly [
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  x: number,
  y: number,
]

const FRAME_LEFT = 15
const FRAME_WIDTH = 1050
const MAX_WIDTH = 1080
const START: Point = [494.874, 2.44315]
const SEGMENTS: readonly Segment[] = [
  [494.874, 2.44315, -444.907, 201.943, 354.874, 331.741],
  [500.208, 355.328, 1040.15, 363.563, 1051.59, 541.531],
  [1060.87, 685.943, 16.6203, 982.943, 16.6203, 848.68],
  [16.6203, 702.527, 1089.16, 951.713, 1004.45, 1115],
  [953.374, 1213.44, 90.3735, 1258.94, 16.6203, 1347.94],
  [-132.833, 1528.29, 953.374, 1914.94, 953.374, 1702.94],
  [953.374, 1532.5, 29.6304, 1760.57, 39.8735, 1945.44],
  [48.96, 2109.45, 818.873, 2138.44, 867.373, 2252.44],
  [973.874, 2411.94, 746.374, 2401.94, 462.374, 2536.44],
  [178.374, 2670.94, 49.8735, 2669.59, 49.8735, 2845.44],
  [49.8735, 3044.44, 606.374, 3026.44, 606.374, 3026.44],
]
const END_Y = SEGMENTS[SEGMENTS.length - 1]![5]

const round = (value: number) => Math.round(value * 10) / 10

export function fitTimelinePath(width: number, startY: number, endY: number) {
  const drawWidth = Math.min(width, MAX_WIDTH)
  const offsetX = (width - drawWidth) / 2
  const scaleX = drawWidth / FRAME_WIDTH
  const scaleY = (endY - startY) / (END_Y - START[1])

  const point = (x: number, y: number) =>
    `${round(offsetX + (x - FRAME_LEFT) * scaleX)} ${round(startY + (y - START[1]) * scaleY)}`

  const curves = SEGMENTS.map(
    ([c1x, c1y, c2x, c2y, x, y]) =>
      `C${point(c1x, c1y)} ${point(c2x, c2y)} ${point(x, y)}`,
  )

  return `M${point(...START)}${curves.join('')}`
}

const READING_LINE = 0.6
const SAMPLE_STEP = 16
const SMOOTH_RADIUS = 160
const SMOOTH_GRID = 4

interface ReachTable {
  reachAt: (length: number) => number
  lengthAt: (y: number) => number
}

export function createReachTable(
  length: number,
  yAt: (length: number) => number,
): ReachTable {
  const count = Math.max(1, Math.ceil(length / SAMPLE_STEP))
  const lengths: number[] = []
  const reach: number[] = []
  for (let i = 0; i <= count; i++) {
    const l = (length * i) / count
    lengths.push(l)
    reach.push(Math.max(reach[i - 1] ?? -Infinity, yAt(l)))
  }

  const reachAt = (l: number) => {
    if (l <= 0) return reach[0]!
    if (l >= length) return reach[count]!
    const position = (l / length) * count
    const i = Math.floor(position)
    return reach[i]! + (reach[i + 1]! - reach[i]!) * (position - i)
  }

  const lengthAt = (y: number) => {
    if (y <= reach[0]!) return 0
    if (y >= reach[count]!) return length
    let low = 0
    let high = count
    while (low < high) {
      const middle = (low + high) >> 1
      if (reach[middle]! >= y) high = middle
      else low = middle + 1
    }
    const before = low - 1
    const share = (y - reach[before]!) / (reach[low]! - reach[before]!)
    return lengths[before]! + (lengths[low]! - lengths[before]!) * share
  }

  return { reachAt, lengthAt }
}

export function smoothLengthAt(
  lengthAt: (y: number) => number,
  from: number,
  to: number,
  radius = SMOOTH_RADIUS,
) {
  const start = from - radius
  const count = Math.max(1, Math.ceil((to + radius - start) / SMOOTH_GRID))
  const raw: number[] = []
  const prefix = [0]
  for (let i = 0; i <= count; i++) {
    raw.push(lengthAt(start + i * SMOOTH_GRID))
    prefix.push(prefix[i]! + raw[i]!)
  }
  const half = Math.round(radius / SMOOTH_GRID)
  const smooth = raw.map((_, i) => {
    const low = Math.max(0, i - half)
    const high = Math.min(count, i + half)
    return (prefix[high + 1]! - prefix[low]!) / (high - low + 1)
  })

  return (y: number) => {
    const position = (y - start) / SMOOTH_GRID
    if (position <= 0) return smooth[0]!
    if (position >= count) return smooth[count]!
    const i = Math.floor(position)
    return smooth[i]! + (smooth[i + 1]! - smooth[i]!) * (position - i)
  }
}

interface TimelineLineElements {
  root: HTMLElement
  svg: SVGSVGElement
  path: SVGPathElement
  icon: SVGGElement
  anchors: () => readonly [HTMLElement, HTMLElement] | null
  stations?: () => readonly HTMLElement[]
}

export function setupTimelineLine({
  root,
  svg,
  path,
  icon,
  anchors,
  stations = () => [],
}: TimelineLineElements) {
  const reduceMotion = prefersReducedMotion()
  const state = { length: 0 }
  let total = 0
  let table: ReachTable | undefined
  let lengthFor: ((y: number) => number) | undefined
  let stationYs: { el: HTMLElement; y: number }[] = []

  const render = () => {
    const drawn = reduceMotion ? total : state.length
    path.style.strokeDashoffset = String(total - drawn)
    const { x, y } = path.getPointAtLength(drawn)
    icon.setAttribute('transform', `translate(${round(x)} ${round(y)})`)

    const reach =
      drawn >= total ? Infinity : (table?.reachAt(drawn) ?? -Infinity)
    for (const station of stationYs) {
      station.el.toggleAttribute('data-reached', reach >= station.y)
    }
  }

  const layout = () => {
    const pair = anchors()
    if (!pair) return

    const top = root.getBoundingClientRect().top
    const centerY = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      return rect.top + rect.height / 2 - top
    }
    const width = root.clientWidth
    const height = root.clientHeight

    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    path.setAttribute(
      'd',
      fitTimelinePath(width, centerY(pair[0]), centerY(pair[1])),
    )

    total = path.getTotalLength()
    path.style.strokeDasharray = String(total)
    table = createReachTable(total, l => path.getPointAtLength(l).y)
    lengthFor = smoothLengthAt(
      table.lengthAt,
      table.reachAt(0),
      table.reachAt(total),
    )
    stationYs = stations().map(el => ({ el, y: centerY(el) }))
    state.length = Math.min(state.length, total)
    render()
  }

  layout()

  if (reduceMotion) {
    const observer = new ResizeObserver(entries => {
      if (entries.some(entry => entry.target === root)) layout()
    })
    observer.observe(root)
    return () => observer.disconnect()
  }

  const follow = (self: ScrollTrigger) => {
    if (!lengthFor) return
    const readingY =
      self.scroll() - self.start - (1 - READING_LINE) * window.innerHeight
    state.length = lengthFor(readingY)
    render()
  }

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: follow,
    onRefresh: follow,
  })
  follow(trigger)

  const observer = new ResizeObserver(entries => {
    if (entries.some(entry => entry.target === root)) layout()
    ScrollTrigger.refresh()
  })
  observer.observe(root)
  observer.observe(document.body)

  return () => {
    observer.disconnect()
    trigger.kill()
  }
}
