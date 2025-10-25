/**
 * Feature Routes
 *
 * Endpoints:
 * - GET /api/features - Retrieve available features for filtering
 */

import { Router, Request, Response } from 'express';
import type { GetFeaturesRequest, GetFeaturesResponse } from '@shared/types';

const router = Router();

/**
 * GET /api/features
 * Retrieve available features for multi-select filter
 * Optional: scope to specific community
 * Returns features sorted by popularity (most common first)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.query as GetFeaturesRequest;

    // TODO: Implement feature retrieval logic
    // - Query unique features from database
    // - Include usage counts (how many units have each feature)
    // - Sort by popularity
    // - Optionally filter by community

    const response: GetFeaturesResponse = {
      features: [],
      total: 0,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

export default router;
