/**
 * Export Service
 * 
 * Business logic for exporting filtered unit data to CSV/JSON.
 */

import unitRepository from '../database/repositories/UnitRepository';
import { generateCSV } from '../utils/csv-generator';
import type { SearchFilters, Unit } from '@feature-analyst/shared';
import { validateSearchFilters } from '@feature-analyst/shared';

export class ExportService {
  async exportUnits(
    filters: SearchFilters,
    format: 'csv' | 'json',
    fields?: string[]
  ): Promise<{ data: string; fileName: string; mimeType: string }> {
    // Validate filters
    const validationErrors = validateSearchFilters(filters);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check export limit
    const maxRecords = parseInt(process.env.EXPORT_MAX_RECORDS || '5000', 10);
    if (filters.limit && filters.limit > maxRecords) {
      throw new Error(`Export limit exceeded. Maximum ${maxRecords} records allowed.`);
    }

    // Set high limit for export (up to max)
    const exportFilters: SearchFilters = {
      ...filters,
      limit: Math.min(filters.limit || maxRecords, maxRecords),
      offset: 0,
    };

    const { units } = await unitRepository.search(exportFilters);

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csv = generateCSV(units, fields);
      return {
        data: csv,
        fileName: `units-export-${timestamp}.csv`,
        mimeType: 'text/csv',
      };
    } else {
      const json = JSON.stringify(units, null, 2);
      return {
        data: json,
        fileName: `units-export-${timestamp}.json`,
        mimeType: 'application/json',
      };
    }
  }
}

export default new ExportService();
