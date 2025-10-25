/**
 * Unit Service
 * 
 * Business logic for unit search and filtering operations.
 */

import unitRepository from '../database/repositories/UnitRepository';
import type { Unit, SearchFilters } from '@feature-analyst/shared';
import { validateSearchFilters } from '@feature-analyst/shared';

export class UnitService {
  async searchUnits(filters: SearchFilters): Promise<{ units: Unit[]; total: number; errors?: string[] }> {
    // Validate filters
    const validationErrors = validateSearchFilters(filters);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Apply defaults
    const filtersWithDefaults: SearchFilters = {
      ...filters,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      sortBy: filters.sortBy || 'communityName',
      sortOrder: filters.sortOrder || 'asc',
    };

    return await unitRepository.search(filtersWithDefaults);
  }
}

export default new UnitService();
