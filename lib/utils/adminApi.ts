// lib/adminApi.ts
const BASE = process.env.NEXT_PUBLIC_API_URL

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_token') ?? ''
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return res.json()
}

export const adminApi = {
  // Packages
  getPackages:   ()                         => request<{ data: any[] }>('/packages/admin'),
  createPackage: (body: object)             => request<{ data: any }>('/packages/admin', { method: 'POST', body: JSON.stringify(body) }),
  updatePackage: (id: string, body: object) => request<{ data: any }>(`/packages/admin/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePackage: (id: string)               => request<{ message: string }>(`/packages/admin/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (orderStatus?: string) =>
    request<{ data: any[] }>(`/orders/admin/transactions${orderStatus ? `?order_status=${orderStatus}` : ''}`),
  bulkUpdateStatus: (ids: string[], orderStatus: string) =>
    request<{ message: string; data: any[] }>('/orders/admin/bulk-status', {
      method: 'PATCH',
      body: JSON.stringify({ ids, orderStatus }),
    }),
}