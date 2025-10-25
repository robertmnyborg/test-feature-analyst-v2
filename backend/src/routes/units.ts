/**
 * Unit Routes
 *
 * Endpoints:
 * - POST /api/units/search - Search units with filters
 */

import { Router, Request, Response } from 'express';
import unitService from '../services/UnitService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateUnitSearchFilters } from '../middleware/validators';
import type { SearchFilters, SearchUnitsResponse } from '@feature-analyst/shared';

const router = Router();

/**
 * POST /api/units/search
 * Search units with comprehensive filters
 */
router.post('/search', validateUnitSearchFilters, asyncHandler(async (req: Request, res: Response) => {
  const filters: SearchFilters = req.body;

  const { units, total } = await unitService.searchUnits(filters);

  const response: SearchUnitsResponse = {
    units,
    total,
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    appliedFilters: filters,
  };

  res.json(response);
}));

export default router;
