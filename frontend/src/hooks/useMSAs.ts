/**
 * useMSAs Hook
 * Get list of all Metro Statistical Areas
 */

import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { MSA } from '@feature-analyst/shared';

export interface UseMSAsResult {
  msas: MSA[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMSAs = (): UseMSAsResult => {
  const [msas, setMsas] = useState<MSA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMSAs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMSAs();
      setMsas(response.msas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch MSAs';
      setError(errorMessage);
      console.error('Error fetching MSAs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMSAs();
  }, []);

  return {
    msas,
    loading,
    error,
    refetch: fetchMSAs,
  };
};
