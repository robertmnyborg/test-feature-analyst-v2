/**
 * CSV Generator Utility
 * 
 * Generates CSV files from unit data for export.
 */

import type { Unit } from '@feature-analyst/shared';

/**
 * Generate CSV from units array
 */
export function generateCSV(units: Unit[], fields?: string[]): string {
  if (units.length === 0) {
    return '';
  }

  // Define available fields and their CSV headers
  const fieldMap: Record<string, { key: keyof Unit; formatter?: (val: any) => string }> = {
    'Community': { key: 'communityName' },
    'Unit Number': { key: 'unitNumber' },
    'Bedrooms': { key: 'bedrooms' },
    'Bathrooms': { key: 'bathrooms' },
    'Square Feet': { key: 'squareFeet' },
    'Monthly Rent': { key: 'monthlyRent', formatter: (val) => `$${val.toFixed(2)}` },
    'Availability': { key: 'availability' },
    'Features': { key: 'features', formatter: (val) => Array.isArray(val) ? val.join('; ') : '' },
    'Floor Plan': { key: 'floorPlan' },
    'Virtual Tour': { key: 'virtualTourUrl' },
  };

  // Use all fields if not specified
  const selectedFields = fields && fields.length > 0 ? fields : Object.keys(fieldMap);

  // Build CSV header
  const headers = selectedFields.join(',');

  // Build CSV rows
  const rows = units.map(unit => {
    return selectedFields.map(field => {
      const fieldConfig = fieldMap[field];
      if (!fieldConfig) return '';

      const value = unit[fieldConfig.key];
      
      if (value === null || value === undefined) return '';

      // Apply formatter if available
      const formatted = fieldConfig.formatter ? fieldConfig.formatter(value) : String(value);

      // Escape commas and quotes for CSV
      return escapeCSVField(formatted);
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(value: string): string {
  if (!value) return '';

  const stringValue = String(value);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  return stringValue;
}
