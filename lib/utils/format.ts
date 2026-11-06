export const money = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `GH₵ ${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const shortDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })

export const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export const ago = (iso: string | null) => {
  if (!iso) return 'Never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`
}

/** "Mon 3" style label for chart axes: weekday matters now that weeks are Monday to Sunday. */
export const weekdayLabel = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
