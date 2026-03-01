'use client';

import { useEffect } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { HiCheckCircle, HiXCircle, HiInformationCircle } from 'react-icons/hi2';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: { icon: HiCheckCircle, color: '#22c55e', bg: '#22c55e20' },
    error: { icon: HiXCircle, color: COLORS.red, bg: '#f5323220' },
    info: { icon: HiInformationCircle, color: COLORS.blue, bg: '#0066ff20' },
  };

  const { icon: Icon, color, bg } = config[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: bg,
        border: `1.5px solid ${color}`,
        borderRadius: '8px',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <Icon size={20} color={color} />
      <span style={{ fontSize: '14px', fontWeight: 600, color, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color,
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        ×
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
