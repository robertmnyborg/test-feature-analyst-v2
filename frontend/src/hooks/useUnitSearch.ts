/**
 * useUnitSearch Hook
 * Search units with filters
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { SearchFilters, Unit } from '@feature-analyst/shared';

export interface UseUnitSearchResult {
  units: Unit[];
  total: number;
  loading: boolean;
  error: string | null;
  search: (filters: SearchFilters) => Promise<void>;
  clear: () => void;
}

export const useUnitSearch = (): UseUnitSearchResult => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.searchUnits(filters);
      setUnits(response.units);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search units';
      setError(errorMessage);
      console.error('Error searching units:', err);
      setUnits([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setUnits([]);
    setTotal(0);
    setError(null);
  }, []);

  return {
    units,
    total,
    loading,
    error,
    search,
    clear,
  };
};
