/**
 * useMSADemographics Hook
 * Get MSA demographics from Census API
 */

import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { MSA } from '@feature-analyst/shared';

export interface UseMSADemographicsOptions {
  code?: string;
  autoFetch?: boolean;
}

export interface UseMSADemographicsResult {
  msa: MSA | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMSADemographics = (
  options: UseMSADemographicsOptions = {}
): UseMSADemographicsResult => {
  const { code, autoFetch = true } = options;
  const [msa, setMsa] = useState<MSA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMSADemographics = async () => {
    if (!code) {
      setMsa(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMSADemographics(code);
      setMsa(response.msa);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Census API temporarily unavailable';
      setError(errorMessage);
      console.error('Error fetching MSA demographics:', err);
      setMsa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && code) {
      fetchMSADemographics();
    }
  }, [code, autoFetch]);

  return {
    msa,
    loading,
    error,
    refetch: fetchMSADemographics,
  };
};
