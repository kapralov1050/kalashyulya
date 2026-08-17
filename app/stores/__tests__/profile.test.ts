import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useProfileStore } from '../profile'

const mockLoadOrders = vi.fn(async () => {})
const mockCurrentUser = ref<{ id: number, email: string, name: string | null } | null>(null)

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    orders: ref([]),
    currentUser: mockCurrentUser,
    loadOrders: mockLoadOrders,
  }),
}))

describe('useProfileStore (регрессия после миграции Firebase→SQLite)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLoadOrders.mockClear()
    mockCurrentUser.value = null
  })

  it('loadUserOrders вызывает api.loadOrders если пользователь залогинен', async () => {
    mockCurrentUser.value = { id: 1, email: 'admin@x.ru', name: 'Admin' }
    const store = useProfileStore()
    await store.loadUserOrders()
    expect(mockLoadOrders).toHaveBeenCalledTimes(1)
  })

  it('loadUserOrders пропускает вызов если пользователь НЕ залогинен', async () => {
    mockCurrentUser.value = null
    const store = useProfileStore()
    await store.loadUserOrders()
    expect(mockLoadOrders).not.toHaveBeenCalled()
  })

  it('НЕ ссылается на api.currentUser.value?.uid (такого поля нет в ApiUser)', async () => {
    // Защита от регрессии: ApiUser имеет {id, email, name}, но НЕ uid.
    // Если кто-то вернёт uid-check, тест должен сломаться, потому что
    // uid будет undefined и loadOrders не вызовется.
    mockCurrentUser.value = { id: 1, email: 'x@x.ru', name: 'X' }
    const store = useProfileStore()
    await store.loadUserOrders()
    expect(mockLoadOrders).toHaveBeenCalledTimes(1)
  })
})