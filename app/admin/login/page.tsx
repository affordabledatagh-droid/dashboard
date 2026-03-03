'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import {auth} from "../../../lib/config/firebase"
import { COLORS } from '@/lib/constants/colors'
import { HiShieldCheck } from 'react-icons/hi2'
import { FcGoogle } from 'react-icons/fc'

export default function AdminLoginPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result   = await signInWithPopup(auth, provider)
      const idToken  = await result.user.getIdToken()

      // Verify with backend — checks role = 'admin' in Supabase
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      })

      const body = await res.json()

      if (!res.ok) {
        // Sign out of Firebase if they're not an admin
        await signOut(auth)
        throw new Error(body.error ?? 'Login failed')
      }

      // Store token for subsequent API calls
      localStorage.setItem('admin_token', idToken)
      document.cookie = `admin_token=${idToken}; path=/; max-age=86400; SameSite=Strict`

      router.push('/admin')
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: COLORS.bg, padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueLight} 100%)`,
            marginBottom: '20px',
          }}>
            <HiShieldCheck size={36} color={COLORS.white} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: COLORS.white, marginBottom: '8px' }}>
            Admin Portal
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            Sign in with your authorised Google account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: COLORS.surface, border: `1.5px solid ${COLORS.border}`,
          borderRadius: '16px', padding: '32px',
        }}>

          {error && (
            <div style={{
              padding: '12px 16px', marginBottom: '20px',
              background: COLORS.red + '18', border: `1px solid ${COLORS.red}40`,
              borderRadius: '8px',
            }}>
              <p style={{ fontSize: '13px', color: COLORS.red, margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '12px',
              padding: '14px 20px', borderRadius: '10px',
              border: `1.5px solid ${loading ? COLORS.border : COLORS.blue}`,
              background: loading ? COLORS.surface : COLORS.blue + '12',
              color: COLORS.white, fontSize: '15px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = COLORS.blue + '25' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = COLORS.blue + '12' }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%', display: 'inline-block',
                  border: `2px solid ${COLORS.blue}40`, borderTop: `2px solid ${COLORS.blue}`,
                  animation: 'spin 0.7s linear infinite',
                }} />
                Verifying...
              </>
            ) : (
              <>
                <FcGoogle size={22} />
                Continue with Google
              </>
            )}
          </button>

          <p style={{ fontSize: '12px', color: COLORS.muted, textAlign: 'center', marginTop: '20px' }}>
            Only authorised admin accounts can access this portal.
          </p>
        </div>

        <p style={{ fontSize: '12px', color: COLORS.muted, textAlign: 'center', marginTop: '24px' }}>
          © 2026 AffordableDataGH. All rights reserved.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}