// Поле содержит хотя бы одну букву или цифру (не просто тире/пробелы)
export const hasContent = (value: string) => /[a-zA-Zа-яёА-ЯЁ0-9]/.test(value.trim())

// ФИО — минимум два слова с буквами
export const hasFullName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(w => /[a-zA-Zа-яёА-ЯЁ]/.test(w)).length >= 2
