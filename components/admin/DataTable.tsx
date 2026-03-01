'use client';

import { useState, ReactNode } from 'react';
import { COLORS } from '@/lib/constants/colors';
import { HiMagnifyingGlass, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPageOptions?: number[];
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  itemsPerPageOptions = [10, 25, 50],
  onRowClick,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data based on search
  const filteredData = searchQuery
    ? data.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div>
      {/* Search Bar */}
      {searchable && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <HiMagnifyingGlass size={18} color={COLORS.muted} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: COLORS.white,
                fontSize: '14px',
              }}
            />
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div style={{ display: 'none', overflowX: 'auto' }} className="desktop-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: COLORS.surface, borderBottom: `1.5px solid ${COLORS.border}` }}>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: COLORS.muted,
                    textTransform: 'uppercase',
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                >
                  {column.label}
                  {sortKey === column.key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                style={{
                  borderBottom: `1px solid ${COLORS.border}`,
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.faint)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: COLORS.white,
                    }}
                  >
                    {column.render ? column.render(item) : item[column.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="mobile-cards">
        {paginatedData.map((item, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(item)}
            style={{
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: onRowClick ? 'pointer' : 'default',
            }}
          >
            {columns.map((column) => (
              <div key={String(column.key)} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '4px' }}>
                  {column.label}
                </div>
                <div style={{ fontSize: '13px', color: COLORS.white, fontWeight: 600 }}>
                  {column.render ? column.render(item) : item[column.key as keyof T]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: COLORS.muted }}>Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '6px',
              padding: '6px 10px',
              color: COLORS.white,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: COLORS.muted }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 10px',
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '6px',
              color: COLORS.white,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <HiChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 10px',
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: '6px',
              color: COLORS.white,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <HiChevronRight size={16} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-table {
            display: block !important;
          }
          .mobile-cards {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
