/**
 * Component 3: Unit Comparison Table
 * TanStack Table v8 for data grid with sortable columns
 * States: Loading, empty (no results), populated, sorted
 */

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Card, Loading } from './common';
import type { Unit } from '@feature-analyst/shared';
import { formatCurrency, formatNumber } from '@feature-analyst/shared';

export interface UnitComparisonTableProps {
  units: Unit[];
  loading: boolean;
  onRowClick?: (unit: Unit) => void;
}

const columnHelper = createColumnHelper<Unit>();

export const UnitComparisonTable: React.FC<UnitComparisonTableProps> = ({
  units,
  loading,
  onRowClick,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('communityName', {
        header: 'Community',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('unitNumber', {
        header: 'Unit',
        cell: (info) => info.getValue() || 'N/A',
      }),
      columnHelper.accessor('bedrooms', {
        header: 'Beds',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('bathrooms', {
        header: 'Baths',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('monthlyRent', {
        header: 'Rent',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('squareFeet', {
        header: 'Sq Ft',
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.accessor('features', {
        header: 'Features',
        cell: (info) => {
          const features = info.getValue();
          return (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '4px',
              maxWidth: '300px' 
            }}>
              {features.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: '#04D2C6',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {feature}
                </span>
              ))}
              {features.length > 3 && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: '#E0E0E0',
                    color: '#666',
                    borderRadius: '4px',
                  }}
                >
                  +{features.length - 3} more
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('availability', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const statusColors = {
            available: { bg: 'rgba(4, 210, 198, 0.1)', text: '#04D2C6' },
            occupied: { bg: '#F8F8F8', text: '#666' },
            offline: { bg: '#FFEBEE', text: '#D32F2F' },
          };
          const colors = statusColors[status] || statusColors.offline;
          return (
            <span
              style={{
                padding: '4px 8px',
                backgroundColor: colors.bg,
                color: colors.text,
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'capitalize',
              }}
            >
              {status}
            </span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: units,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  };

  const countStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  };

  const tableContainerStyles: React.CSSProperties = {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #E0E0E0',
  };

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  };

  const thStyles: React.CSSProperties = {
    backgroundColor: '#F8F8F8',
    color: '#555',
    fontWeight: '600',
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #E0E0E0',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  };

  const tdStyles: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #E0E0E0',
    color: '#333',
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  };

  const emptyTitleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '10px',
  };

  const suggestionStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px',
  };

  if (loading) {
    return (
      <Card>
        <Loading text="Searching units..." />
      </Card>
    );
  }

  if (units.length === 0) {
    return (
      <Card>
        <div style={emptyStateStyles}>
          <div style={emptyTitleStyles}>No units found</div>
          <p>No units match your selected criteria.</p>
          <div style={suggestionStyles}>
            Try:
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '10px auto' }}>
              <li>Removing some feature filters</li>
              <li>Expanding bedroom or bathroom ranges</li>
              <li>Adjusting price or square footage ranges</li>
              <li>Selecting additional communities</li>
            </ul>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={containerStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>Unit Comparison</h2>
          <span style={countStyles}>{units.length} units found</span>
        </div>

        <div style={tableContainerStyles}>
          <table style={tableStyles}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        style={{
                          ...thStyles,
                          cursor: canSort ? 'pointer' : 'default',
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span style={{ fontSize: '12px', color: '#04D2C6' }}>
                              {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '⇅'}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => onRowClick?.(row.original)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(4, 210, 198, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={tdStyles}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
