'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/lib/constants/colors';
import { HiEye, HiEyeSlash, HiShieldCheck } from 'react-icons/hi2';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TEMPORARY: Mock authentication for development
      // TODO: Replace with actual API endpoint when ready
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // For now, accept any email/password combination
      if (formData.email && formData.password) {
        // Generate a mock token
        const mockToken = 'dev_token_' + Date.now();
        
        // Store auth token
        localStorage.setItem('admin_token', mockToken);
        
        // Set cookie for middleware
        document.cookie = `admin_token=${mockToken}; path=/; max-age=86400`;
        
        // Redirect to dashboard
        router.push('/admin');
      } else {
        throw new Error('Please enter email and password');
      }

      /* 
      // PRODUCTION CODE - Uncomment when API is ready:
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store auth token
      localStorage.setItem('admin_token', data.token);
      document.cookie = `admin_token=${data.token}; path=/; max-age=86400`;
      
      // Redirect to dashboard
      router.push('/admin');
      */
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.bg,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueLight} 100%)`,
              marginBottom: '20px',
            }}
          >
            <HiShieldCheck size={36} color={COLORS.white} />
          </div>
          <h1
            style={{
              fontSize: 'clamp(24px, 4vw, 28px)',
              fontWeight: 800,
              color: COLORS.white,
              marginBottom: '8px',
            }}
          >
            Affordabledatahub Admin
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div
          style={{
            background: COLORS.surface,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: '16px',
            padding: 'clamp(24px, 4vw, 32px)',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f5323220',
                  border: `1.5px solid ${COLORS.red}`,
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <p style={{ fontSize: '13px', color: COLORS.red, margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: COLORS.muted,
                  marginBottom: '8px',
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@affordabledatahub.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: COLORS.bg,
                  border: `1.5px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.white,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.blue)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: COLORS.muted,
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '48px',
                    background: COLORS.bg,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.white,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = COLORS.blue)}
                  onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: COLORS.muted,
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? COLORS.faint : COLORS.blue,
                border: 'none',
                borderRadius: '8px',
                color: COLORS.white,
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = COLORS.blueLight;
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = COLORS.blue;
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: COLORS.muted }}>
              Protected by enterprise-grade security
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: COLORS.muted }}>
            © 2026 Affordabledatahub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
