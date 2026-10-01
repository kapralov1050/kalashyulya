import { describe, expect, it } from 'vitest'
import type { Exhibition, ExhibitionStatus } from '~/types'
import {
  bindShortWords,
  formatExhibitionDates,
  getExhibitionName,
  sortExhibitionsForList,
} from '../exhibitionList'

const makeExhibition = (
  id: string,
  status: ExhibitionStatus,
  dateStart?: string,
  dateEnd?: string,
) =>
  ({
    id,
    slug: id,
    title: id,
    status,
    dateStart,
    dateEnd,
  }) as Exhibition

describe('getExhibitionName', () => {
  it('убирает слово «Выставка» перед кавычками', () => {
    expect(getExhibitionName('Выставка \\n «Тихий свет зимы»')).toBe(
      '«Тихий свет зимы»',
    )
  })

  it('убирает многословный префикс и лишние пробелы', () => {
    expect(
      getExhibitionName(
        'Межрегиональная выставка \\n  «Современная акварель на родине П.И. Чайковского» ',
      ),
    ).toBe('«Современная акварель на\u00A0родине П.И.\u00A0Чайковского»')
  })

  it('оставляет название без кавычек как есть, в одну строку', () => {
    expect(getExhibitionName('Арктика\nИзвестная и неизвестная')).toBe(
      'Арктика Известная и\u00A0неизвестная',
    )
  })

  it('не трогает название, которое начинается с кавычек', () => {
    expect(getExhibitionName('«Окна» в Петербурге')).toBe(
      '«Окна» в\u00A0Петербурге',
    )
  })
})

describe('bindShortWords', () => {
  it('привязывает короткие слова к следующему, в том числе подряд и после кавычки', () => {
    expect(bindShortWords('«В лесу и в поле»')).toBe(
      '«В\u00A0лесу и\u00A0в\u00A0поле»',
    )
  })

  it('не трогает короткие сочетания внутри слов', () => {
    expect(bindShortWords('Калининский: через призму времени')).toBe(
      'Калининский: через призму времени',
    )
  })

  it('привязывает инициалы к фамилии, но не конец предложения', () => {
    expect(bindShortWords('Библиотека К.А. Тимирязева')).toBe(
      'Библиотека К.А.\u00A0Тимирязева',
    )
    expect(bindShortWords('Арктика. Известная')).toBe('Арктика. Известная')
  })
})

describe('formatExhibitionDates', () => {
  it('меняет дефис между датами на тире и обрезает пробелы', () => {
    expect(formatExhibitionDates('1 мая - 14 июня 2026 ')).toBe(
      '1 мая – 14 июня 2026',
    )
  })

  it('не трогает диапазон без пробелов', () => {
    expect(formatExhibitionDates('1–28 февраля 2026')).toBe('1–28 февраля 2026')
  })
})

describe('sortExhibitionsForList', () => {
  it('ставит идущие, затем запланированные, затем завершённые от новых к старым', () => {
    const list = [
      makeExhibition('old', 'finished', '2026-02-01', '2026-02-28'),
      makeExhibition('soon', 'planned', '2026-11-01', '2026-11-30'),
      makeExhibition('recent', 'finished', '2026-05-01', '2026-06-14'),
      makeExhibition('now', 'ongoing', '2026-09-01', '2026-10-15'),
      makeExhibition('later', 'planned', '2027-01-10', '2027-02-10'),
    ]

    expect(sortExhibitionsForList(list).map(e => e.id)).toEqual([
      'now',
      'soon',
      'later',
      'recent',
      'old',
    ])
  })

  it('среди идущих выше та, что закрывается раньше', () => {
    const list = [
      makeExhibition('long', 'ongoing', '2026-09-01', '2026-12-01'),
      makeExhibition('closing', 'ongoing', '2026-08-01', '2026-10-05'),
    ]

    expect(sortExhibitionsForList(list).map(e => e.id)).toEqual([
      'closing',
      'long',
    ])
  })

  it('выставки без дат уходят в конец своей группы', () => {
    const list = [
      makeExhibition('undated', 'finished'),
      makeExhibition('dated', 'finished', '2026-02-01', '2026-02-28'),
    ]

    expect(sortExhibitionsForList(list).map(e => e.id)).toEqual([
      'dated',
      'undated',
    ])
  })

  it('не меняет исходный массив', () => {
    const list = [
      makeExhibition('a', 'finished', '2026-01-01', '2026-01-31'),
      makeExhibition('b', 'ongoing', '2026-09-01', '2026-10-15'),
    ]

    sortExhibitionsForList(list)
    expect(list.map(e => e.id)).toEqual(['a', 'b'])
  })
})
