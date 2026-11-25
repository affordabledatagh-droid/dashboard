import { MhanyBundle } from '@/lib/utils/adminApi'

/** Mhany lists "MTN", "MTN (Unverified Num)", "TELECEL", "AirtelTigo"… group them for display. */
export const networkGroup = (n: string) => {
  const s = n.toLowerCase()
  if (s.includes('mtn')) return s.includes('unverified') ? 'MTN (Unverified)' : 'MTN'
  if (s.includes('telecel') || s.includes('vodafone')) return 'Telecel'
  if (s.includes('airtel') || s.includes('tigo') || /\bat\b/.test(s)) return 'AirtelTigo'
  return n
}
export function groupBundles(bundles: MhanyBundle[]) {
  const groups: Record<string, MhanyBundle[]> = {}
  for (const b of bundles) (groups[networkGroup(b.network)] ??= []).push(b)
  for (const g of Object.values(groups)) g.sort((a, b) => a.size_mb - b.size_mb)
  return groups
}
