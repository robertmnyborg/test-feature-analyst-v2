/**
 * Export Routes
 *
 * Endpoints:
 * - POST /api/export - Export filtered units to CSV or JSON
 */

import { Router, Request, Response } from 'express';
import exportService from '../services/ExportService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateExportRequest } from '../middleware/validators';
import type { ExportRequest, SearchFilters } from '@feature-analyst/shared';

const router = Router();

/**
 * POST /api/export
 * Export filtered units to CSV or JSON format
 */
router.post('/', validateExportRequest, asyncHandler(async (req: Request, res: Response) => {
  const { format, fields, ...filters }: ExportRequest = req.body;

  const { data, fileName, mimeType } = await exportService.exportUnits(
    filters as SearchFilters,
    format,
    fields
  );

  // Set response headers for file download
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', Buffer.byteLength(data));

  res.send(data);
}));

export default router;
