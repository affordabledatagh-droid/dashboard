'use client'

import { useEffect } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from '@/lib/config/firebase'

const REFRESH_INTERVAL_MS = 55 * 60 * 1000 

async function persistToken(user: any) {
  // forceRefresh=true guarantees a fresh token regardless of cache
  const token = await user.getIdToken(true)
  localStorage.setItem('admin_token', token)
  document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Strict`
}

export function useAdminTokenRefresh() {
  useEffect(() => {
    // Listen for token changes (login, logout, auto-refresh by Firebase)
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem('admin_token')
        document.cookie = 'admin_token=; path=/; max-age=0'
        return
      }
      await persistToken(user)
    })

    // Also proactively force-refresh every 55 minutes so idle tabs don't go stale
    const interval = setInterval(async () => {
      const user = auth.currentUser
      if (user) {
        await persistToken(user)
      }
    }, REFRESH_INTERVAL_MS)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])
}