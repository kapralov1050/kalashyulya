import { defineStore } from 'pinia'

export type LocaleOptions = {
  breakLn?: boolean
  capitalize?: boolean
  lowercase?: boolean
  uppercase?: boolean
  defaultValue?: string
  params?: Record<string, string | number>
}

export function useLocales() {
  const { locales } = storeToRefs(useLocalesStore())

  function printLocale(key: string, options?: LocaleOptions): string {
    const {
      breakLn = false,
      capitalize = false,
      lowercase = false,
      uppercase = false,
      defaultValue = '',
      params = {},
    } = options || {}

    if (!locales.value) {
      return ''
    }

    const value = locales.value[key] || defaultValue
    if (!value) {
      console.warn(`Locale key "${key}" not found`)
      return defaultValue
    }

    let result = value

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
      }
    }

    if (breakLn) {
      result = result.replace(/\n/g, '<br/>')
    }

    if (capitalize) {
      result = result.charAt(0).toUpperCase() + result.slice(1)
    }

    if (lowercase) {
      result = result.toLowerCase()
    }

    if (uppercase) {
      result = result.toUpperCase()
    }

    return result
  }

  function hasLocale(key: string): boolean {
    if (!locales.value) {
      return false
    }

    return Boolean(locales.value[key])
  }

  function getAvailableKeys(): string[] {
    if (!locales.value) {
      return []
    }

    return Object.keys(locales.value)
  }

  return {
    printLocale,
    hasLocale,
    getAvailableKeys,
  }
}
