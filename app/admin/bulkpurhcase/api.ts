// app/admin/bulk-purchase/api.ts
export const API_BASE = 'https://api.datamartgh.shop/api/developer';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = process.env.NEXT_PUBLIC_DATAMART_TOKEN || '';
  const url = `${API_BASE}${path}`;

  console.log('[apiFetch] →', options?.method || 'GET', url, '| token:', token.slice(0, 8) + '...');

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-api-key': token,          // ← add this, some endpoints use this instead
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();
  console.log('[apiFetch] ←', url, data);
  return data;
}