import { describe, expect, it } from 'vitest'
import { canDeleteOrder, DELETABLE_SQL_STATUSES } from '../orderPermissions'

describe('canDeleteOrder', () => {
  it('new — удаляемо', () => {
    expect(canDeleteOrder('new')).toBe(true)
  })

  it('cancelled — удаляемо', () => {
    expect(canDeleteOrder('cancelled')).toBe(true)
  })

  it('paid — НЕ удаляемо (защита финансового audit-trail)', () => {
    expect(canDeleteOrder('paid')).toBe(false)
  })

  it('shipped — НЕ удаляемо', () => {
    expect(canDeleteOrder('shipped')).toBe(false)
  })

  it('unknown статус — НЕ удаляемо', () => {
    expect(canDeleteOrder('archived')).toBe(false)
  })

  it('null/undefined/пустая строка — НЕ удаляемо', () => {
    expect(canDeleteOrder(null)).toBe(false)
    expect(canDeleteOrder(undefined)).toBe(false)
    expect(canDeleteOrder('')).toBe(false)
  })

  it('DELETABLE_SQL_STATUSES содержит ровно new и cancelled', () => {
    expect([...DELETABLE_SQL_STATUSES].sort()).toEqual(['cancelled', 'new'])
  })
})
