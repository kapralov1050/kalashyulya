interface PluralForms {
  one: string
  few: string
  many: string
}

// Словарь для разных слов
const pluralForms: Record<string, PluralForms> = {
  views: {
    one: 'просмотр',
    few: 'просмотра',
    many: 'просмотров',
  },
  products: {
    one: 'товар',
    few: 'товара',
    many: 'товаров',
  },
  users: {
    one: 'пользователь',
    few: 'пользователя',
    many: 'пользователей',
  },
  exhibitions: {
    one: 'выставка',
    few: 'выставки',
    many: 'выставок',
  },
}

export const pluralize = (
  count: number,
  word: keyof typeof pluralForms,
): string => {
  const forms = pluralForms[word]
  if (!forms) return String(count)

  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} ${forms.one}`
  } else if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 10 || lastTwoDigits >= 20)
  ) {
    return `${count} ${forms.few}`
  } else {
    return `${count} ${forms.many}`
  }
}

// Специализированная функция для просмотров
export const pluralizeViews = (count: number): string => {
  return pluralize(count, 'views')
}
