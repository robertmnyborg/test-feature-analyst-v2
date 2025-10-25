/**
 * Feature Repository
 * 
 * Data access layer for features/amenities.
 * Retrieves available features with usage statistics.
 */

import { query } from '../connection';
import type { Feature } from '@feature-analyst/shared';

export class FeatureRepository {
  /**
   * Get all features with usage counts, optionally scoped to a community
   */
  async findAll(communityId?: string): Promise<Feature[]> {
    let queryText = `
      SELECT
        f.id,
        f.name,
        f.category,
        f.description,
        f.is_popular as "isPopular",
        COUNT(DISTINCT uf.unit_id) as "unitCount"
      FROM features f
      LEFT JOIN unit_features uf ON f.id = uf.feature_id
    `;

    const queryParams: any[] = [];

    if (communityId) {
      queryText += `
        LEFT JOIN units u ON uf.unit_id = u.id
        WHERE u.community_id =       `;
      queryParams.push(communityId);
    }

    queryText += `
      GROUP BY f.id, f.name, f.category, f.description, f.is_popular
      ORDER BY "unitCount" DESC, f.name ASC
    `;

    const result = await query<any>(queryText, queryParams);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      unitCount: parseInt(row.unitCount || '0', 10),
      isPopular: row.isPopular,
    }));
  }
}

export default new FeatureRepository();
