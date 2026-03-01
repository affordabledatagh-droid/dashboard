'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // TODO: Verify token with backend
      // const response = await fetch('/api/admin/verify', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For now, just check if token exists
      setIsAuthenticated(true);
      
      // If on login page and authenticated, redirect to dashboard
      if (pathname === '/admin/login') {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  return { isAuthenticated, isLoading, logout, checkAuth };
}
