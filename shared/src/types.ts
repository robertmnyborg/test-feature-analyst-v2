/**
 * Feature Analyst V2 - Shared Types and Interfaces
 *
 * This module contains all domain models, DTOs, and API contracts
 * shared between frontend and backend packages.
 */

// ============================================================================
// Domain Models
// ============================================================================

/**
 * Metro Statistical Area (US Census Bureau designation)
 */
export interface MSA {
  id: string;
  code: string;
  name: string;
  state: string;
  population?: number;
  medianIncome?: number;
  housingUnits?: number;
  rentalVacancyRate?: number;
  lastUpdated?: Date;
}

/**
 * Multifamily Community (property/complex)
 */
export interface Community {
  id: string;
  name: string;
  msaId: string;
  msaName?: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  totalUnits: number;
  availableUnits?: number;
  amenities?: string[];
  features?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Individual unit/apartment within a community
 */
export interface Unit {
  id: string;
  communityId: string;
  communityName: string;
  unitNumber?: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  monthlyRent: number;
  features: string[];
  availability: 'available' | 'occupied' | 'offline';
  floorPlan?: string;
  photoUrls?: string[];
  floorPlanUrls?: string[];
  virtualTourUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Feature/Amenity definition
 */
export interface Feature {
  id: string;
  name: string;
  category?: 'kitchen' | 'flooring' | 'appliances' | 'technology' | 'bathroom' | 'other';
  description?: string;
  unitCount?: number; // How many units have this feature
  isPopular?: boolean; // Top features by usage
}

// ============================================================================
// Search and Filter Models
// ============================================================================

/**
 * Comprehensive search filters for unit queries
 */
export interface SearchFilters {
  communityIds: string[]; // Required: at least one community
  msaId?: string; // Optional: pre-filter communities by MSA
  features?: string[]; // Optional: AND logic (unit must have ALL selected features)
  bedroomRange?: {
    min?: number;
    max?: number;
  };
  bathroomRange?: {
    min?: number;
    max?: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  squareFeetRange?: {
    min?: number;
    max?: number;
  };
  availability?: 'available' | 'occupied' | 'all';
  sortBy?: 'communityName' | 'unitNumber' | 'bedrooms' | 'bathrooms' | 'price' | 'squareFeet';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Request/Response DTOs
// ============================================================================

/**
 * GET /api/communities - List communities with optional MSA filter
 */
export interface GetCommunitiesRequest {
  msaId?: string;
  limit?: number;
  offset?: number;
}

export interface GetCommunitiesResponse {
  communities: Community[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * GET /api/communities/:id - Get community details
 */
export interface GetCommunityResponse {
  community: Community;
}

/**
 * POST /api/units/search - Search units with filters
 */
export interface SearchUnitsRequest extends SearchFilters {}

export interface SearchUnitsResponse {
  units: Unit[];
  total: number;
  limit: number;
  offset: number;
  appliedFilters: SearchFilters;
}

/**
 * GET /api/features - List available features
 */
export interface GetFeaturesRequest {
  communityId?: string; // Optional: scope to specific community
}

export interface GetFeaturesResponse {
  features: Feature[];
  total: number;
}

/**
 * GET /api/msa - List metro statistical areas
 */
export interface GetMSAsResponse {
  msas: MSA[];
  total: number;
}

/**
 * GET /api/msa/:code - Get MSA demographics
 */
export interface GetMSADemographicsResponse {
  msa: MSA;
}

/**
 * POST /api/export - Export filtered units
 */
export interface ExportRequest extends SearchFilters {
  format: 'csv' | 'json';
  fields?: string[]; // Optional: which fields to include
}

export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  expiresAt: Date;
}

// ============================================================================
// Validation Schemas (for runtime validation)
// ============================================================================

export const BEDROOM_RANGE = { min: 0, max: 5 } as const;
export const BATHROOM_RANGE = { min: 0, max: 4 } as const;
export const DEFAULT_LIMIT = 50 as const;
export const MAX_LIMIT = 1000 as const;

/**
 * Validate search filters
 */
export function validateSearchFilters(filters: SearchFilters): string[] {
  const errors: string[] = [];

  if (!filters.communityIds || filters.communityIds.length === 0) {
    errors.push('At least one community must be selected');
  }

  if (filters.bedroomRange) {
    const { min, max } = filters.bedroomRange;
    if (min !== undefined && (min < BEDROOM_RANGE.min || min > BEDROOM_RANGE.max)) {
      errors.push(`Bedroom min must be between ${BEDROOM_RANGE.min} and ${BEDROOM_RANGE.max}`);
    }
    if (max !== undefined && (max < BEDROOM_RANGE.min || max > BEDROOM_RANGE.max)) {
      errors.push(`Bedroom max must be between ${BEDROOM_RANGE.min} and ${BEDROOM_RANGE.max}`);
    }
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Bedroom min cannot exceed max');
    }
  }

  if (filters.bathroomRange) {
    const { min, max } = filters.bathroomRange;
    if (min !== undefined && (min < BATHROOM_RANGE.min || min > BATHROOM_RANGE.max)) {
      errors.push(`Bathroom min must be between ${BATHROOM_RANGE.min} and ${BATHROOM_RANGE.max}`);
    }
    if (max !== undefined && (max < BATHROOM_RANGE.min || max > BATHROOM_RANGE.max)) {
      errors.push(`Bathroom max must be between ${BATHROOM_RANGE.min} and ${BATHROOM_RANGE.max}`);
    }
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Bathroom min cannot exceed max');
    }
  }

  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    if (min !== undefined && min < 0) {
      errors.push('Price min must be positive');
    }
    if (max !== undefined && max < 0) {
      errors.push('Price max must be positive');
    }
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Price min cannot exceed max');
    }
  }

  if (filters.squareFeetRange) {
    const { min, max } = filters.squareFeetRange;
    if (min !== undefined && min < 0) {
      errors.push('Square feet min must be positive');
    }
    if (max !== undefined && max < 0) {
      errors.push('Square feet max must be positive');
    }
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Square feet min cannot exceed max');
    }
  }

  if (filters.limit !== undefined && (filters.limit < 1 || filters.limit > MAX_LIMIT)) {
    errors.push(`Limit must be between 1 and ${MAX_LIMIT}`);
  }

  if (filters.offset !== undefined && filters.offset < 0) {
    errors.push('Offset must be non-negative');
  }

  return errors;
}

// ============================================================================
// Common Utilities
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Calculate rent premium percentage
 */
export function calculateRentPremium(baseRent: number, premiumRent: number): number {
  if (baseRent === 0) return 0;
  return ((premiumRent - baseRent) / baseRent) * 100;
}
