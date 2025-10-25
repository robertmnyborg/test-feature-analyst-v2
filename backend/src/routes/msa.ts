/**
 * MSA Routes
 *
 * Endpoints:
 * - GET /api/msa - List metro statistical areas
 * - GET /api/msa/:code - Get MSA demographics
 */

import { Router, Request, Response } from 'express';
import msaService from '../services/MSAService';
import { asyncHandler, createError } from '../middleware/errorHandler';
import type { GetMSAsResponse, GetMSADemographicsResponse } from '@feature-analyst/shared';

const router = Router();

/**
 * GET /api/msa
 * Retrieve list of metro statistical areas
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const msas = await msaService.getAllMSAs();

  const response: GetMSAsResponse = {
    msas,
    total: msas.length,
  };

  res.json(response);
}));

/**
 * GET /api/msa/:code
 * Retrieve demographics for a specific MSA
 */
router.get('/:code', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  const forceRefresh = req.query.refresh === 'true';

  const msa = await msaService.getMSAByCode(code, forceRefresh);

  if (!msa) {
    throw createError('MSA not found', 404);
  }

  const response: GetMSADemographicsResponse = {
    msa,
  };

  res.json(response);
}));

export default router;
