// app/admin/bulk-purchase/api.ts
export const API_BASE = '/api/datamart';  // ← your Next.js proxy, not the external URL

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  console.log('[apiFetch] →', options?.method || 'GET', url);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
      // No token here — the server-side proxy adds it
    },
  });

  const data = await res.json();
  console.log('[apiFetch] ←', url, data);
  return data;
}