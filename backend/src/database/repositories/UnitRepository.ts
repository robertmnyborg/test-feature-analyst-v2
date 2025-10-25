/**
 * Unit Repository
 * 
 * Data access layer for units (individual apartments/spaces).
 * Implements complex filtering with AND feature logic and deduplication.
 */

import { query } from '../connection';
import type { Unit, SearchFilters } from '@feature-analyst/shared';

export class UnitRepository {
  /**
   * Search units with comprehensive filters
   * Implements AND feature logic: unit must have ALL selected features
   */
  async search(filters: SearchFilters): Promise<{ units: Unit[]; total: number }> {
    const {
      communityIds,
      features = [],
      bedroomRange,
      bathroomRange,
      priceRange,
      squareFeetRange,
      availability,
      sortBy = 'communityName',
      sortOrder = 'asc',
      limit = 50,
      offset = 0,
    } = filters;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause conditions
    const conditions: string[] = [];

    // Community filter (required)
    conditions.push(`u.community_id = ANY($${paramIndex}::uuid[])`);
    queryParams.push(communityIds);
    paramIndex++;

    // Bedroom range filter
    if (bedroomRange?.min !== undefined) {
      conditions.push(`u.bedrooms >= $${paramIndex}`);
      queryParams.push(bedroomRange.min);
      paramIndex++;
    }
    if (bedroomRange?.max !== undefined) {
      conditions.push(`u.bedrooms <= $${paramIndex}`);
      queryParams.push(bedroomRange.max);
      paramIndex++;
    }

    // Bathroom range filter
    if (bathroomRange?.min !== undefined) {
      conditions.push(`u.bathrooms >= $${paramIndex}`);
      queryParams.push(bathroomRange.min);
      paramIndex++;
    }
    if (bathroomRange?.max !== undefined) {
      conditions.push(`u.bathrooms <= $${paramIndex}`);
      queryParams.push(bathroomRange.max);
      paramIndex++;
    }

    // Price range filter
    if (priceRange?.min !== undefined) {
      conditions.push(`u.monthly_rent >= $${paramIndex}`);
      queryParams.push(priceRange.min);
      paramIndex++;
    }
    if (priceRange?.max !== undefined) {
      conditions.push(`u.monthly_rent <= $${paramIndex}`);
      queryParams.push(priceRange.max);
      paramIndex++;
    }

    // Square feet range filter
    if (squareFeetRange?.min !== undefined) {
      conditions.push(`u.square_feet >= $${paramIndex}`);
      queryParams.push(squareFeetRange.min);
      paramIndex++;
    }
    if (squareFeetRange?.max !== undefined) {
      conditions.push(`u.square_feet <= $${paramIndex}`);
      queryParams.push(squareFeetRange.max);
      paramIndex++;
    }

    // Availability filter
    if (availability && availability !== 'all') {
      conditions.push(`u.availability = $${paramIndex}`);
      queryParams.push(availability);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Feature filter with AND logic (unit must have ALL selected features)
    let featureJoin = '';
    
    if (features.length > 0) {
      const featureParamIndex = paramIndex;
      queryParams.push(features);
      paramIndex++;
      queryParams.push(features.length);
      paramIndex++;

      featureJoin = `
        INNER JOIN (
          SELECT uf.unit_id
          FROM unit_features uf
          INNER JOIN features f ON f.id = uf.feature_id
          WHERE f.name = ANY($${featureParamIndex}::text[])
          GROUP BY uf.unit_id
          HAVING COUNT(DISTINCT f.name) = $${featureParamIndex + 1}
        ) matching_features ON matching_features.unit_id = u.id
      `;
    }

    // Count total matching units (before pagination)
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM units u
      ${featureJoin}
      ${whereClause}
    `;

    // Use all parameters up to this point (before limit/offset are added)
    const countParams = queryParams.slice(0);
    const countResult = await query<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Build sort clause
    const sortMap: Record<string, string> = {
      communityName: 'c.name',
      unitNumber: 'u.unit_number',
      bedrooms: 'u.bedrooms',
      bathrooms: 'u.bathrooms',
      price: 'u.monthly_rent',
      squareFeet: 'u.square_feet',
    };

    const sortColumn = sortMap[sortBy] || 'c.name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Add pagination parameters
    queryParams.push(limit, offset);

    // Fetch units with all features aggregated
    const dataQuery = `
      SELECT DISTINCT ON (u.id)
        u.id,
        u.community_id as "communityId",
        c.name as "communityName",
        u.unit_number as "unitNumber",
        u.bedrooms,
        u.bathrooms,
        u.square_feet as "squareFeet",
        u.monthly_rent as "monthlyRent",
        u.availability,
        u.floor_plan as "floorPlan",
        u.photo_urls as "photoUrls",
        u.floor_plan_urls as "floorPlanUrls",
        u.virtual_tour_url as "virtualTourUrl",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        COALESCE(
          ARRAY_AGG(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL),
          ARRAY[]::text[]
        ) as features
      FROM units u
      INNER JOIN communities c ON u.community_id = c.id
      LEFT JOIN unit_features uf ON u.id = uf.unit_id
      LEFT JOIN features f ON uf.feature_id = f.id
      ${featureJoin}
      ${whereClause}
      GROUP BY u.id, c.name
      ORDER BY u.id, ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await query<any>(dataQuery, queryParams);

    const units: Unit[] = dataResult.rows.map(row => ({
      id: row.id,
      communityId: row.communityId,
      communityName: row.communityName,
      unitNumber: row.unitNumber,
      bedrooms: row.bedrooms,
      bathrooms: parseFloat(row.bathrooms),
      squareFeet: row.squareFeet,
      monthlyRent: parseFloat(row.monthlyRent),
      features: row.features || [],
      availability: row.availability,
      floorPlan: row.floorPlan,
      photoUrls: row.photoUrls || [],
      floorPlanUrls: row.floorPlanUrls || [],
      virtualTourUrl: row.virtualTourUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return { units, total };
  }
}

export default new UnitRepository();
