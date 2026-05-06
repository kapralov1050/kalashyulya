import type { VueWrapper } from '@vue/test-utils'

export function getVm<T>(wrapper: VueWrapper): T {
  return wrapper.vm as unknown as T
}
