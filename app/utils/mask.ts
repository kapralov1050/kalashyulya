export function maskName(value?: string | null): string {
  if (!value) return ''
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return `${parts[0].charAt(0)}***`
  return `${parts[0]} ${parts[1].charAt(0)}.`
}

export function maskEmail(value?: string | null): string {
  if (!value || !value.includes('@')) return ''
  const trimmed = value.trim()
  const [localPart, domain = ''] = trimmed.split('@')
  if (!localPart || !domain) return ''

  const domainParts = domain.split('.')
  const suffix = domainParts.length > 1 ? `.${domainParts.at(-1)}` : ''
  const maskedDomain =
    suffix && domainParts.at(-1)!.length >= 2 ? `***${suffix}` : '***'

  return `${localPart.charAt(0)}***@${maskedDomain}`
}

export function maskPhone(value?: string | null): string {
  if (!value) return ''
  const digits = value.match(/\d/g) || []
  let digitIndex = 0

  return value.replace(/\d/g, digit => {
    const currentIndex = digitIndex++
    return digits.length < 4 || currentIndex < digits.length - 2 ? '*' : digit
  })
}

export function maskStreet(value?: string | null): string {
  if (!value) return ''
  const street = value.trim()
  return street ? `${street.charAt(0)}***` : ''
}

export function maskRecipient(value?: string | null): string {
  if (!value) return ''
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  return parts.map(p => `${p.charAt(0)}***`).join(' ')
}

export function maskNickname(value?: string | null): string {
  if (!value) return ''
  const nickname = value.trim().replace(/^@/, '')
  return nickname ? `@${nickname.charAt(0)}***` : ''
}
