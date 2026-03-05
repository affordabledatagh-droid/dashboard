'use client';

import AdminNavbar from '@/components/admin/AdminNavbar';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { COLORS } from '@/lib/constants/colors';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
