'use client';

import { AdminProvider } from '@/lib/context/AdminContext';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { COLORS } from '@/lib/constants/colors';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div style={{ minHeight: '100vh', background: COLORS.bg }}>
        <AdminNavbar />
        <main>{children}</main>
      </div>
    </AdminProvider>
  );
}
