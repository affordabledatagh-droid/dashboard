// Remembers who has been messaged (per browser) so a bulk run doesn't message the same people twice in a few days.
const KEY = 'wa_contacted_v1'

type Log = Record<string, number>

const read = (): Log => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export const keyOf = (type: string, id: string) => `${type}:${id}`

export const markContacted = (type: string, id: string) => {
  try { const log = read(); log[keyOf(type, id)] = Date.now(); localStorage.setItem(KEY, JSON.stringify(log)) } catch { /* storage unavailable */ }
}

/** Whole days since the account was last messaged, or null if never. */
export const daysSinceContacted = (type: string, id: string): number | null => {
  const t = read()[keyOf(type, id)]
  return t ? Math.floor((Date.now() - t) / 864e5) : null
}
