'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      if (response.ok) {
        const data = await response.json();
        setAdminUser(data);
      } else {
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAdminUser(data);
  };

  const logoutAdmin = () => {
    fetch('/api/admin/logout', { method: 'POST' });
    setAdminUser(null);
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
