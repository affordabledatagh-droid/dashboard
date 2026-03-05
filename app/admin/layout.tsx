'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { COLORS } from '@/lib/constants/colors';
import { usePathname } from 'next/navigation';
import { useAdminTokenRefresh } from '@/lib/context/useAdminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    useAdminTokenRefresh()
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
      <ProtectedRoute>
        <div style={{ minHeight: '100vh', background: COLORS.bg }}>
          <AdminNavbar />
          <main>{children}</main>
        </div>
      </ProtectedRoute>
  );
}
