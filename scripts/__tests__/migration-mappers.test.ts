import { describe, expect, it } from 'vitest'
import {
  buildExhibitionDescription,
  buildExhibitionLocation,
  mapExhibitionStatus,
  mapOrderItems,
  mapOrderStatus,
  mapProductStatus,
  resolveOrderItemProductId,
} from '../migration-mappers'

describe('mapOrderStatus', () => {
  it('маппит русские Firebase-статусы', () => {
    expect(mapOrderStatus('Новый заказ')).toBe('new')
    expect(mapOrderStatus('В работе')).toBe('new')
    expect(mapOrderStatus('Оплачен')).toBe('paid')
    expect(mapOrderStatus('Отправлен')).toBe('shipped')
  })

  it('пропускает английские как есть', () => {
    expect(mapOrderStatus('new')).toBe('new')
    expect(mapOrderStatus('paid')).toBe('paid')
    expect(mapOrderStatus('shipped')).toBe('shipped')
    expect(mapOrderStatus('cancelled')).toBe('cancelled')
  })

  it('неизвестное → new', () => {
    expect(mapOrderStatus(undefined)).toBe('new')
    expect(mapOrderStatus('BOGUS')).toBe('new')
  })
})

describe('mapProductStatus', () => {
  it('isReserved → reserved', () => {
    expect(mapProductStatus({ isReserved: true })).toBe('reserved')
  })

  it('stock === 0 → sold', () => {
    expect(mapProductStatus({ stock: 0 })).toBe('sold')
    expect(mapProductStatus({ stock: -1 })).toBe('sold')
  })

  it('stock > 0 → available', () => {
    expect(mapProductStatus({ stock: 5 })).toBe('available')
  })

  it('дефолт → available', () => {
    expect(mapProductStatus({})).toBe('available')
  })

  it('isReserved приоритетнее stock', () => {
    expect(mapProductStatus({ isReserved: true, stock: 0 })).toBe('reserved')
  })
})

describe('mapOrderItems', () => {
  it('нормализует поля', () => {
    const out = mapOrderItems([
      { id: 42, title: 'Snow', price: 1000, amount: 2 },
      { title: 'Rain', price: 500, quantity: 3 },
      { title: 'Sun', price: 200 },
    ])
    expect(out).toEqual([
      { productId: '42', title: 'Snow', price: 1000, qty: 2 },
      { productId: 'Rain', title: 'Rain', price: 500, qty: 3 },
      { productId: 'Sun', title: 'Sun', price: 200, qty: 1 },
    ])
  })

  it('пустой массив → пустой массив', () => {
    expect(mapOrderItems([])).toEqual([])
    expect(mapOrderItems()).toEqual([])
  })
})

describe('buildExhibitionLocation', () => {
  it('склеивает venue, city, address', () => {
    expect(
      buildExhibitionLocation({
        venue: 'Галерея',
        city: 'Москва',
        addressLine: 'ул. Тверская, 1',
      }),
    ).toBe('Галерея, Москва, ул. Тверская, 1')
  })

  it('fallback address ← addressLine', () => {
    expect(
      buildExhibitionLocation({ address: 'fallback', addressLine: 'main' }),
    ).toBe('main')
  })

  it('null если ничего', () => {
    expect(buildExhibitionLocation(undefined)).toBeNull()
    expect(buildExhibitionLocation({})).toBeNull()
  })
})

describe('mapExhibitionStatus', () => {
  it('published и ongoing → published', () => {
    expect(mapExhibitionStatus('published')).toBe('published')
    expect(mapExhibitionStatus('ongoing')).toBe('published')
  })

  it('остальное → draft', () => {
    expect(mapExhibitionStatus('draft')).toBe('draft')
    expect(mapExhibitionStatus('planned')).toBe('draft')
    expect(mapExhibitionStatus(undefined)).toBe('draft')
  })
})

describe('resolveOrderItemProductId', () => {
  const titleMap = new Map([
    ['Snow', 'product_100'],
    ['Тихий свет зимы', 'product_107'],
  ])

  it('берёт id если есть', () => {
    expect(resolveOrderItemProductId({ id: 42, title: 'Snow' }, titleMap)).toBe('42')
  })

  it('резолвит по title из map', () => {
    expect(resolveOrderItemProductId({ title: 'Snow' }, titleMap)).toBe('product_100')
  })

  it('тримит пробелы в title при поиске', () => {
    expect(resolveOrderItemProductId({ title: ' Тихий свет зимы ' }, titleMap)).toBe('product_107')
  })

  it('fallback на title если не нашли', () => {
    expect(resolveOrderItemProductId({ title: 'Unknown' }, titleMap)).toBe('Unknown')
  })

  it('пустой результат если нет ни id ни title', () => {
    expect(resolveOrderItemProductId({}, titleMap)).toBe('')
  })
})

describe('buildExhibitionDescription', () => {
  it('склеивает intro + body через перенос', () => {
    expect(
      buildExhibitionDescription({
        descriptionIntro: 'Intro',
        descriptionBody: 'Body',
      }),
    ).toBe('Intro\n\nBody')
  })

  it('null если оба пустые', () => {
    expect(buildExhibitionDescription({})).toBeNull()
  })

  it('только intro', () => {
    expect(buildExhibitionDescription({ descriptionIntro: 'X' })).toBe('X')
  })
})