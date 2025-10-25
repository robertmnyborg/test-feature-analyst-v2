/**
 * MSA (Metro Statistical Area) Routes
 *
 * Endpoints:
 * - GET /api/msa - List available metro statistical areas
 * - GET /api/msa/:code - Get MSA demographics from US Census Bureau API
 */

import { Router, Request, Response } from 'express';
import type { GetMSAsResponse, GetMSADemographicsResponse } from '@shared/types';

const router = Router();

/**
 * GET /api/msa
 * Retrieve available metro statistical areas
 * Returns MSA codes and names with community counts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Implement MSA list retrieval
    // - Query distinct MSAs from communities
    // - Include community count per MSA
    // - Sort alphabetically by MSA name

    const response: GetMSAsResponse = {
      msas: [],
      total: 0,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching MSAs:', error);
    res.status(500).json({ error: 'Failed to fetch MSAs' });
  }
});

/**
 * GET /api/msa/:code
 * Retrieve demographic statistics for specified MSA
 * Integrates with US Census Bureau API
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // TODO: Implement MSA demographics retrieval
    // - Check cache first
    // - Call US Census Bureau API if needed
    // - Cache result for performance
    // - Return 404 if MSA not found
    // - Handle API failures gracefully

    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    console.error('Error fetching MSA demographics:', error);
    res.status(500).json({ error: 'Failed to fetch MSA demographics' });
  }
});

export default router;
