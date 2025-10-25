/**
 * Validation Tests
 * 
 * Tests for search filter validation logic.
 */

import { validateSearchFilters } from '@feature-analyst/shared';
import type { SearchFilters } from '@feature-analyst/shared';

describe('Search Filter Validation', () => {
  describe('validateSearchFilters', () => {
    it('should pass with valid filters', () => {
      const filters: SearchFilters = {
        communityIds: ['123e4567-e89b-12d3-a456-426614174000'],
        bedroomRange: { min: 1, max: 3 },
        bathroomRange: { min: 1, max: 2 },
        priceRange: { min: 1000, max: 3000 },
        squareFeetRange: { min: 500, max: 2000 },
        limit: 50,
        offset: 0,
      };

      const errors = validateSearchFilters(filters);
      expect(errors).toHaveLength(0);
    });

    it('should fail without community IDs', () => {
      const filters: SearchFilters = {
        communityIds: [],
      };

      const errors = validateSearchFilters(filters);
      expect(errors).toContain('At least one community must be selected');
    });

    it('should fail with invalid bedroom range', () => {
      const filters: SearchFilters = {
        communityIds: ['123e4567-e89b-12d3-a456-426614174000'],
        bedroomRange: { min: 3, max: 1 },
      };

      const errors = validateSearchFilters(filters);
      expect(errors).toContain('Bedroom min cannot exceed max');
    });

    it('should fail with negative price', () => {
      const filters: SearchFilters = {
        communityIds: ['123e4567-e89b-12d3-a456-426614174000'],
        priceRange: { min: -100, max: 2000 },
      };

      const errors = validateSearchFilters(filters);
      expect(errors).toContain('Price min must be positive');
    });

    it('should fail with limit exceeding max', () => {
      const filters: SearchFilters = {
        communityIds: ['123e4567-e89b-12d3-a456-426614174000'],
        limit: 2000,
      };

      const errors = validateSearchFilters(filters);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Limit must be between');
    });

    it('should fail with negative offset', () => {
      const filters: SearchFilters = {
        communityIds: ['123e4567-e89b-12d3-a456-426614174000'],
        offset: -10,
      };

      const errors = validateSearchFilters(filters);
      expect(errors).toContain('Offset must be non-negative');
    });
  });
});
