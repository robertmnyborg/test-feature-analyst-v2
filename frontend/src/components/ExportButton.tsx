/**
 * Component 5: Export Controls
 * Export CSV/JSON button with field selection
 * States: Ready, exporting (progress), complete (flash teal), error
 */

import React, { useState } from 'react';
import { Button, Card } from './common';
import { useExport } from '../hooks';
import type { SearchFilters } from '@feature-analyst/shared';

export interface ExportButtonProps {
  filters: SearchFilters;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ filters, disabled = false }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [showOptions, setShowOptions] = useState(false);
  const { exporting, error, success, exportData, reset } = useExport();

  const handleExport = async () => {
    await exportData({
      ...filters,
      format,
    });
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const formatSelectorStyles: React.CSSProperties = {
    display: 'flex',
    gap: '5px',
    backgroundColor: '#F8F8F8',
    padding: '4px',
    borderRadius: '8px',
  };

  const formatButtonStyles = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: isActive ? '#04D2C6' : 'transparent',
    color: isActive ? '#FFFFFF' : '#666',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  });

  const statusMessageStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '6px',
  };

  const successStyles: React.CSSProperties = {
    ...statusMessageStyles,
    backgroundColor: 'rgba(4, 210, 198, 0.1)',
    color: '#04D2C6',
  };

  const errorStyles: React.CSSProperties = {
    ...statusMessageStyles,
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
  };

  return (
    <div style={containerStyles}>
      <div style={formatSelectorStyles}>
        <button
          style={formatButtonStyles(format === 'csv')}
          onClick={() => setFormat('csv')}
          disabled={exporting}
        >
          CSV
        </button>
        <button
          style={formatButtonStyles(format === 'json')}
          onClick={() => setFormat('json')}
          disabled={exporting}
        >
          JSON
        </button>
      </div>

      <Button
        variant="primary"
        onClick={handleExport}
        disabled={disabled || exporting || filters.communityIds.length === 0}
        isLoading={exporting}
      >
        {exporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
      </Button>

      {success && (
        <div style={successStyles}>
          Export complete! Download should start automatically.
        </div>
      )}

      {error && (
        <div style={errorStyles}>
          {error}
          <button
            onClick={reset}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              backgroundColor: '#D32F2F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
