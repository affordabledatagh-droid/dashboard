// lib/utils/adminApi.ts
const BASE = process.env.NEXT_PUBLIC_API_URL

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_token') ?? ''
}

/** Parse a response as JSON, with a readable error when the server sent HTML (wrong API URL, crashed server...). */
export async function readJson(res: Response): Promise<any> {
  const text = await res.text()
  try { return JSON.parse(text) } catch {
    throw new Error(
      !BASE
        ? 'NEXT_PUBLIC_API_URL is not set. Add it to dashboard/.env.local and restart the dashboard.'
        : `The API at ${BASE} did not return JSON (HTTP ${res.status}). Check the backend is running and the URL is right.`
    )
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BASE) throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to dashboard/.env.local and restart the dashboard.')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers ?? {}),
    },
  })
  const body = await readJson(res)
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
  return body
}

const json = (method: string, body?: object): RequestInit => ({ method, body: body ? JSON.stringify(body) : undefined })

// ── Types ─────────────────────────────────────────────────────────

export type PriceStatus = 'below' | 'equal' | 'above' | 'unavailable' | 'unknown'

export interface PricingRow {
  id: string; name: string; network: string; data_size: string; validity: string; size_mb: number | null
  admin_price: number; is_active: boolean
  mhany: { bundleId: string; price: number; network: string; size: string } | null
  markup: number | null
  status: PriceStatus
  alert: boolean
}
export interface UnlistedBundle { bundleId: string; network: string; size: string; size_mb: number; price: number }
export interface Pricing {
  mhanyOnline: boolean
  packages: PricingRow[]
  unlisted: UnlistedBundle[]
  summary: { total: number; active: number; below: number; unavailable: number; alerts: number; unlisted: number }
}

export type Period = 'today' | 'yesterday' | 'week' | 'lastweek' | 'month' | 'lastmonth'
export type Metric = 'profit' | 'sales' | 'orders'

export interface RangeInfo { period: Period; from: string; to: string; label: string; daysLabel: string; isFinished: boolean }
export interface DailyPoint { date: string; orders: number; delivered: number; revenue: number; agentProfit: number; platformSales: number }
export interface Summary {
  range: RangeInfo
  totals: { orders: number; revenue: number; agentProfit: number; platformSales: number; estimatedMargin: number | null; avgOrder: number }
  daily: DailyPoint[]
}
export interface LeaderCard { type: 'agent' | 'sub_agent'; id: string; shopName: string; agentCode: string; orders: number; sales: number; profit: number; trend?: { date: string; value: number }[] }
export interface Leaders {
  range: Omit<RangeInfo, 'isFinished'>; metric: Metric
  top: LeaderCard[]; totalPeople: number
  byDay: { date: string; top: LeaderCard[] }[]
}
export interface Breakdown {
  range: { period: Period; label: string }
  byNetwork: { network: string; orders: number; revenue: number }[]
  topPackages: { name: string; orders: number; revenue: number }[]
  byMethod: Record<string, number>
  byStatus: Record<string, number>
}
export interface Attention {
  placed: number; processing: number; rejected: number
  pendingWithdrawals: number; pendingWithdrawalAmount: number
  fulfilmentErrors: number; pricingAlerts: number; belowMhany: number
  mhanyBalance: { username: string; balance: number; currency: string; status: string } | null
}

export interface AgentRow {
  type: 'agent' | 'sub_agent'; id: string; name: string | null; shopName: string; agentCode: string
  whatsapp: string | null; walletBalance: number; joined: string
  orders: number; sales: number; profit: number; lastOrderAt: string | null
  customers: number; pendingWithdrawal: number; withdrawn: number
  subAgents?: number; parentId?: string; parentShop?: string | null
  inactiveDays?: number | null; lowBalance?: boolean
}
export interface AgentsQuery { scope: string; q: string; activity: string; sort: string; dir: string; page: number; pageSize: number }
export interface AgentContacts { rows: AgentRow[]; matching: number; withNumber: number; capped: boolean }
export interface AgentsPage {
  rows: AgentRow[]; total: number; page: number; pageSize: number; pages: number
  totals: { agents: number; subAgents: number; walletBalance: number; profit: number; pendingWithdrawal: number; activeLast30: number; lowBalance: number }
}
export interface WithdrawalRow {
  id: string; status: 'pending' | 'success' | 'failed'; type: 'agent' | 'sub_agent'
  amount: number; fee: number; total: number; phone: string | null; network: string | null
  initiatedByAdmin: boolean; createdAt: string; updatedAt: string | null
  accountId?: string; shopName?: string; agentCode?: string; whatsapp?: string | null
}
export interface AgentDetail {
  profile: AgentRow
  daily: { date: string; orders: number; profit: number }[]
  recentOrders: { id: string; createdAt: string; phone: string; paid: number; profit: number; status: string; method: string; selfOrder: boolean; viaSubAgent: boolean; pkg: string }[]
  withdrawals: WithdrawalRow[]
  deposits: { count: number; total: number }
  subAgents: AgentRow[]
}

export interface MhanyBundle { bundleId: string; network: string; size: string; label: string; size_mb: number; price: number }
export interface BulkResult { number: string; bundleId: string; ok: boolean; orderId?: string | null; price?: number | null; status?: string; error?: string }
export interface MhanyOrder { id: string; bundleSize: string; pricePaid: number; recipientNumber: string; status: string; createdAt: string }

// ── API ───────────────────────────────────────────────────────────

export const adminApi = {
  // Packages
  getPackages:   ()                         => request<{ data: any[] }>('/packages/admin'),
  createPackage: (body: object)             => request<{ data: any }>('/packages/admin', json('POST', body)),
  updatePackage: (id: string, body: object) => request<{ data: any }>(`/packages/admin/${id}`, json('PATCH', body)),
  deletePackage: (id: string)               => request<{ message: string }>(`/packages/admin/${id}`, { method: 'DELETE' }),

  // Pricing vs Mhany
  getPricing:   ()                                                  => request<{ data: Pricing }>('/admin/pricing'),
  savePrices:   (updates: { id: string; admin_price: number }[])    => request<{ data: { id: string; admin_price: number }[] }>('/admin/pricing', json('PATCH', { updates })),

  // Analytics
  getSummary:   (period: Period)                  => request<{ data: Summary }>(`/admin/analytics/summary?period=${period}`),
  getLeaders:   (period: Period, metric: Metric)  => request<{ data: Leaders }>(`/admin/analytics/leaders?period=${period}&metric=${metric}`),
  getBreakdown: (period: Period)                  => request<{ data: Breakdown }>(`/admin/analytics/breakdown?period=${period}`),
  getAttention: ()                                => request<{ data: Attention }>('/admin/attention'),

  // Agents
  getAgents:       (q: AgentsQuery)                => request<{ data: AgentsPage }>(`/admin/agents?${new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)]))}`),
  getAgentContacts: (q: Omit<AgentsQuery, 'page' | 'pageSize'>) => request<{ data: AgentContacts }>(`/admin/agents/contacts?${new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)]))}`),
  getAgentDetail:  (type: string, id: string)      => request<{ data: AgentDetail }>(`/admin/agents/${type}/${id}`),
  initiateWithdrawal: (type: string, id: string, body: { amount: number; phone: string; network: string }) =>
    request<{ data: WithdrawalRow }>(`/admin/agents/${type}/${id}/withdrawals`, json('POST', body)),

  // Withdrawals
  getWithdrawals:     ()           => request<{ data: WithdrawalRow[] }>('/admin/withdrawals'),
  completeWithdrawal: (id: string) => request<{ data: unknown }>(`/admin/withdrawals/${id}/complete`, json('PATCH')),
  rejectWithdrawal:   (id: string) => request<{ data: unknown }>(`/admin/withdrawals/${id}/reject`, json('PATCH')),

  // Transactions
  getTransactions: (orderStatus?: string) =>
    request<{ data: any[] }>(`/orders/admin/transactions${orderStatus ? `?order_status=${orderStatus}` : ''}`),
  bulkUpdateStatus: (ids: string[], orderStatus: string) =>
    request<{ message: string; data: any[] }>('/orders/admin/bulk-status', json('PATCH', { ids, orderStatus })),

  // Mhany (bulk purchase follows Mhany's catalogue)
  mhanyBundles: (refresh = false) => request<{ data: MhanyBundle[] }>(`/admin/mhany/bundles${refresh ? '?refresh=1' : ''}`),
  mhanyBalance: ()                => request<{ data: { username: string; balance: number; currency: string; status: string } }>('/admin/mhany/balance'),
  mhanyOrders:  ()                => request<{ data: MhanyOrder[] | MhanyOrder }>('/admin/mhany/orders'),
  mhanyVerify:  (number: string)  => request<{ data: { success: boolean; status: string; message: string } }>(`/admin/mhany/verify?number=${encodeURIComponent(number)}`),
  mhanyBulkPurchase: (items: { bundleId: string; number: string }[]) =>
    request<{ data: { requested: number; sent: number; failed: number; notAttempted: number; results: BulkResult[] } }>('/admin/mhany/bulk-purchase', json('POST', { items })),
  reconcile: () => request<{ data: { checked: number; updated: number } }>('/admin/mhany/reconcile', json('POST')),
}
