'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COLORS } from '@/lib/constants/colors';
import { useAdmin } from '@/lib/context/AdminContext';
import {
  HiChartBarSquare,
  HiUsers,
  HiShoppingCart,
  HiCube,
  HiCurrencyDollar,
  HiChartPie,
  HiBars3,
  HiXMark,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: HiChartBarSquare },
  { label: 'Agents', href: '/admin/agents', icon: HiUsers },
  { label: 'Purchases', href: '/admin/purchases', icon: HiShoppingCart },
  { label: 'Packages', href: '/admin/packages', icon: HiCube },
  { label: 'Withdrawals', href: '/admin/withdrawals', icon: HiCurrencyDollar },
  { label: 'Analytics', href: '/admin/analytics', icon: HiChartPie },
];

export default function AdminNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { adminUser, logoutAdmin } = useAdmin();

  return (
    <nav
      style={{
        background: COLORS.surface,
        borderBottom: `1.5px solid ${COLORS.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Link href="/admin" style={{ fontSize: 'clamp(18px, 3vw, 20px)', fontWeight: 800, color: COLORS.blue }}>
          Affordabledatahub Admin
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'none', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isActive ? COLORS.blue : COLORS.muted,
                  background: isActive ? COLORS.faint : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Admin Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'none' }} className="desktop-profile">
            <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.white, textAlign: 'right' }}>
              {adminUser?.fullName}
            </div>
            <div style={{ fontSize: '11px', color: COLORS.muted, textAlign: 'right' }}>
              {adminUser?.role.replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={logoutAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: COLORS.red,
              background: 'transparent',
              border: `1.5px solid ${COLORS.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <HiArrowRightOnRectangle size={16} />
            <span style={{ display: 'none' }} className="desktop-text">Logout</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              color: COLORS.white,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: COLORS.bg,
            borderTop: `1.5px solid ${COLORS.border}`,
            padding: '16px',
          }}
          className="mobile-menu"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isActive ? COLORS.blue : COLORS.white,
                  background: isActive ? COLORS.faint : 'transparent',
                  marginBottom: '4px',
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-profile {
            display: block !important;
          }
          .desktop-text {
            display: inline !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
