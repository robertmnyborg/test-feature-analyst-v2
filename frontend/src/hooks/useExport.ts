/**
 * useExport Hook
 * Handle CSV/JSON export functionality
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { ExportRequest } from '@feature-analyst/shared';

export interface UseExportResult {
  exporting: boolean;
  error: string | null;
  success: boolean;
  exportData: (request: ExportRequest) => Promise<void>;
  reset: () => void;
}

export const useExport = (): UseExportResult => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const exportData = useCallback(async (request: ExportRequest) => {
    setExporting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient.exportData(request);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(true);

      // Auto-reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed. Please try again.';
      setError(errorMessage);
      console.error('Error exporting data:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    exporting,
    error,
    success,
    exportData,
    reset,
  };
};
