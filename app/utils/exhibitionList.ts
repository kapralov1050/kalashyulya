import type { Exhibition, ExhibitionStatus } from '~/types'

const toSingleLine = (text: string) =>
  text.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()

const shortWords = /(?<=^|[\s«(])(в|во|на|и|а|с|со|к|о|у|по|за|из|от|до|не)\s+/giu
const initials = /(?<=^|[\s.«])([А-ЯЁ]\.)\s+(?=[А-ЯЁ])/gu

export function bindShortWords(text: string): string {
  return text.replace(shortWords, '$1\u00A0').replace(initials, '$1\u00A0')
}

export function getExhibitionName(title: string): string {
  const line = toSingleLine(title)
  const quoteIndex = line.indexOf('«')
  return bindShortWords(quoteIndex > 0 ? line.slice(quoteIndex) : line)
}

export function formatExhibitionDates(dateRange: string): string {
  return dateRange.trim().replace(/\s+-\s+/g, ' – ')
}

const statusOrder: Record<ExhibitionStatus, number> = {
  ongoing: 0,
  planned: 1,
  finished: 2,
}

const compareDates = (a = '', b = '') => {
  if (!a || !b) return Number(!a) - Number(!b)
  return a.localeCompare(b)
}

export function sortExhibitionsForList(list: Exhibition[]): Exhibition[] {
  return [...list].sort((a, b) => {
    const byStatus = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
    if (byStatus) return byStatus

    if (a.status === 'ongoing') return compareDates(a.dateEnd, b.dateEnd)
    if (a.status === 'planned') return compareDates(a.dateStart, b.dateStart)

    const aEnd = a.dateEnd || a.dateStart
    const bEnd = b.dateEnd || b.dateStart
    if (!aEnd || !bEnd) return compareDates(aEnd, bEnd)
    return bEnd.localeCompare(aEnd)
  })
}
