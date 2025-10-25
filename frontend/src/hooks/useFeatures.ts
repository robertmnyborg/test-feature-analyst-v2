/**
 * useFeatures Hook
 * Get available features with optional community filter
 */

import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { Feature } from '@feature-analyst/shared';

export interface UseFeaturesOptions {
  communityId?: string;
  autoFetch?: boolean;
}

export interface UseFeaturesResult {
  features: Feature[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFeatures = (options: UseFeaturesOptions = {}): UseFeaturesResult => {
  const { communityId, autoFetch = true } = options;
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getFeatures({ communityId });
      setFeatures(response.features);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch features';
      setError(errorMessage);
      console.error('Error fetching features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchFeatures();
    }
  }, [communityId, autoFetch]);

  return {
    features,
    loading,
    error,
    refetch: fetchFeatures,
  };
};
