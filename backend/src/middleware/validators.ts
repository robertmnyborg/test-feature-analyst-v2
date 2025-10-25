/**
 * Validation Middleware
 * 
 * Request validation for API endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { validateSearchFilters, DEFAULT_LIMIT, MAX_LIMIT } from '@feature-analyst/shared';
import type { SearchFilters } from '@feature-analyst/shared';
import { createError } from './errorHandler';

/**
 * Validate pagination parameters
 */
export function validatePagination(req: Request, res: Response, next: NextFunction): void {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : DEFAULT_LIMIT;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

  if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw createError(`Invalid limit. Must be between 1 and ${MAX_LIMIT}`, 400);
  }

  if (isNaN(offset) || offset < 0) {
    throw createError('Invalid offset. Must be non-negative', 400);
  }

  req.query.limit = String(limit);
  req.query.offset = String(offset);

  next();
}

/**
 * Validate unit search filters
 */
export function validateUnitSearchFilters(req: Request, res: Response, next: NextFunction): void {
  const filters: SearchFilters = req.body;

  const errors = validateSearchFilters(filters);

  if (errors.length > 0) {
    throw createError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  next();
}

/**
 * Validate export request
 */
export function validateExportRequest(req: Request, res: Response, next: NextFunction): void {
  const { format, ...filters } = req.body;

  if (!format || !['csv', 'json'].includes(format)) {
    throw createError('Invalid export format. Must be csv or json', 400);
  }

  const errors = validateSearchFilters(filters);

  if (errors.length > 0) {
    throw createError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  const maxRecords = parseInt(process.env.EXPORT_MAX_RECORDS || '5000', 10);
  if (filters.limit && filters.limit > maxRecords) {
    throw createError(`Export limit exceeded. Maximum ${maxRecords} records allowed`, 400);
  }

  next();
}

/**
 * Validate UUID parameter
 */
export function validateUUID(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!value || !uuidRegex.test(value)) {
      throw createError(`Invalid ${paramName}. Must be a valid UUID`, 400);
    }

    next();
  };
}
