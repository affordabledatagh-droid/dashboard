'use client';

import { COLORS } from '@/lib/constants/colors';
import { HiArrowDownTray } from 'react-icons/hi2';

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  columns: { key: keyof T; label: string }[];
}

export default function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  columns,
}: ExportButtonProps<T>) {
  const convertToCSV = () => {
    const headers = columns.map((col) => col.label).join(',');
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = item[col.key];
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        
        // Keep numbers as pure numbers (no formatting)
        if (typeof value === 'number') {
          return value;
        }
        
        // Convert to string and escape commas
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const handleExport = () => {
    const csv = convertToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: COLORS.blue,
        border: 'none',
        borderRadius: '8px',
        color: COLORS.white,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.blueLight)}
      onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.blue)}
    >
      <HiArrowDownTray size={16} />
      Export CSV
    </button>
  );
}
