'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/lib/types/admin';

interface AdminContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
  checkAdminAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setAdminUser(null);
        setLoading(false);
        return;
      }

      // TEMPORARY: Mock user data for development
      // TODO: Replace with actual API endpoint when ready
      if (token.startsWith('dev_token_')) {
        // Mock admin user
        setAdminUser({
          id: '1',
          fullName: 'Admin User',
          email: 'admin@affordabledatahub.com',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      /* 
      // PRODUCTION CODE - Uncomment when API is ready:
      const response = await fetch('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUser(data);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('admin_token');
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setAdminUser(null);
      }
      */
    } catch (error) {
      console.error('Auth check failed:', error);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store token
    localStorage.setItem('admin_token', data.token);
    
    // Set user data
    setAdminUser(data.user);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setAdminUser(null);
    router.push('/admin/login');
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  return (
    <AdminContext.Provider value={{ adminUser, loading, loginAdmin, logoutAdmin, checkAdminAuth }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
