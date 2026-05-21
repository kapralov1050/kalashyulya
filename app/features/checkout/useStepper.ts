import { toValue, type MaybeRefOrGetter } from 'vue'

export function useStepper(count: MaybeRefOrGetter<number>) {
  const current = ref(0)
  const totalCount = computed(() => toValue(count))
  const isFirst = computed(() => current.value === 0)
  const isLast = computed(() => current.value === totalCount.value - 1)

  function next() {
    if (!isLast.value) current.value++
  }

  function prev() {
    if (!isFirst.value) current.value--
  }

  function goTo(i: number) {
    if (i >= 0 && i < totalCount.value) current.value = i
  }

  return { current, isFirst, isLast, next, prev, goTo }
}
