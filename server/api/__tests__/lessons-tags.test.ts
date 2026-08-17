import { describe, expect, it } from 'vitest'
import handler from '../lessons-tags.get'

describe('GET /api/lessons-tags', () => {
  it('возвращает массив (пустой на текущий момент, TODO: наполнить из Firebase/БД)', async () => {
    const fakeEvent = { context: {} } as unknown as Parameters<typeof handler>[0]
    const result = await handler(fakeEvent)
    expect(Array.isArray(result)).toBe(true)
  })
})