/**
 * Community Routes
 *
 * Endpoints:
 * - GET /api/communities - List communities with optional MSA filter
 * - GET /api/communities/:id - Get community details
 */

import { Router, Request, Response } from 'express';
import communityService from '../services/CommunityService';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validatePagination, validateUUID } from '../middleware/validators';
import type { GetCommunitiesRequest, GetCommunitiesResponse, GetCommunityResponse } from '@feature-analyst/shared';

const router = Router();

/**
 * GET /api/communities
 * Retrieve list of communities with optional filtering by metro area
 */
router.get('/', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const { msaId, limit, offset } = req.query;

  const params: GetCommunitiesRequest = {
    msaId: msaId as string | undefined,
    limit: parseInt(limit as string, 10),
    offset: parseInt(offset as string, 10),
  };

  const { communities, total } = await communityService.getCommunities(params);

  const response: GetCommunitiesResponse = {
    communities,
    total,
    limit: params.limit || 50,
    offset: params.offset || 0,
  };

  res.json(response);
}));

/**
 * GET /api/communities/:id
 * Retrieve detailed information for a specific community
 */
router.get('/:id', validateUUID('id'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const community = await communityService.getCommunityById(id);

  if (!community) {
    throw createError('Community not found', 404);
  }

  const response: GetCommunityResponse = {
    community,
  };

  res.json(response);
}));

export default router;
