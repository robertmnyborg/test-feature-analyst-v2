/**
 * Feature Routes
 *
 * Endpoints:
 * - GET /api/features - Get available features with usage counts
 */

import { Router, Request, Response } from 'express';
import featureService from '../services/FeatureService';
import { asyncHandler } from '../middleware/errorHandler';
import type { GetFeaturesRequest, GetFeaturesResponse } from '@feature-analyst/shared';

const router = Router();

/**
 * GET /api/features
 * Retrieve available features/amenities with usage counts
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { communityId } = req.query;

  const features = await featureService.getFeatures(communityId as string | undefined);

  const response: GetFeaturesResponse = {
    features,
    total: features.length,
  };

  res.json(response);
}));

export default router;
