export function useToggle(initialValue: boolean) {
  const value = ref(initialValue)

  function setValue(newVal: boolean) {
    value.value = newVal
  }

  function toggle() {
    value.value = !value.value
  }

  return [value, setValue, toggle] as const
}
