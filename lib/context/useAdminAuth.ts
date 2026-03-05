'use client'

import { useEffect } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from '@/lib/config/firebase'

export function useAdminTokenRefresh() {

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        localStorage.removeItem('admin_token')
        document.cookie = 'admin_token=; path=/; max-age=0'
        return
      }

      const token = await user.getIdToken()

      // update storage
      localStorage.setItem('admin_token', token)
      document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Strict`
    })

    return () => unsubscribe()
  }, [])
}