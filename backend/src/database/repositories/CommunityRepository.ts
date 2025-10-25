/**
 * Community Repository
 * 
 * Data access layer for communities (multifamily properties).
 * Handles deduplication and data retrieval from PostgreSQL.
 */

import { query } from '../connection';
import type { Community, GetCommunitiesRequest } from '@feature-analyst/shared';

export class CommunityRepository {
  /**
   * Get communities with optional MSA filter and pagination
   */
  async findAll(params: GetCommunitiesRequest): Promise<{ communities: Community[]; total: number }> {
    const { msaId, limit = 50, offset = 0 } = params;

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (msaId) {
      whereClause = `WHERE c.msa_id = $${paramIndex}`;
      queryParams.push(msaId);
      paramIndex++;
    }

    // Count total matching communities
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM communities c
      ${whereClause}
    `;
    
    const countResult = await query<{ total: string }>(countQuery, queryParams);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Fetch communities with deduplication
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT DISTINCT ON (c.id)
        c.id,
        c.name,
        c.msa_id as "msaId",
        m.name as "msaName",
        c.street,
        c.city,
        c.state,
        c.zip_code as "zipCode",
        c.latitude,
        c.longitude,
        c.total_units as "totalUnits",
        c.available_units as "availableUnits",
        c.amenities,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM communities c
      LEFT JOIN msas m ON c.msa_id = m.id
      ${whereClause}
      ORDER BY c.id, c.name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await query<any>(dataQuery, queryParams);

    const communities: Community[] = dataResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      msaId: row.msaId,
      msaName: row.msaName,
      address: {
        street: row.street,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
      },
      location: row.latitude && row.longitude ? {
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
      } : undefined,
      totalUnits: row.totalUnits,
      availableUnits: row.availableUnits,
      amenities: row.amenities || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return { communities, total };
  }

  /**
   * Get a single community by ID
   */
  async findById(id: string): Promise<Community | null> {
    const queryText = `
      SELECT DISTINCT ON (c.id)
        c.id,
        c.name,
        c.msa_id as "msaId",
        m.name as "msaName",
        c.street,
        c.city,
        c.state,
        c.zip_code as "zipCode",
        c.latitude,
        c.longitude,
        c.total_units as "totalUnits",
        c.available_units as "availableUnits",
        c.amenities,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        (
          SELECT COUNT(DISTINCT u.id)
          FROM units u
          WHERE u.community_id = c.id
        ) as actual_unit_count
      FROM communities c
      LEFT JOIN msas m ON c.msa_id = m.id
      WHERE c.id = $1
    `;

    const result = await query<any>(queryText, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    return {
      id: row.id,
      name: row.name,
      msaId: row.msaId,
      msaName: row.msaName,
      address: {
        street: row.street,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
      },
      location: row.latitude && row.longitude ? {
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
      } : undefined,
      totalUnits: row.totalUnits || row.actual_unit_count,
      availableUnits: row.availableUnits,
      amenities: row.amenities || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

export default new CommunityRepository();
