/**
 * useCommunities Hook
 * Fetch communities with optional MSA filter
 */

import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { Community } from '@feature-analyst/shared';

export interface UseCommunitiesOptions {
  msaId?: string;
  autoFetch?: boolean;
}

export interface UseCommunitiesResult {
  communities: Community[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCommunities = (options: UseCommunitiesOptions = {}): UseCommunitiesResult => {
  const { msaId, autoFetch = true } = options;
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getCommunities({ msaId });
      setCommunities(response.communities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch communities';
      setError(errorMessage);
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCommunities();
    }
  }, [msaId, autoFetch]);

  return {
    communities,
    loading,
    error,
    refetch: fetchCommunities,
  };
};
