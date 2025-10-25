/**
 * MSA Repository
 * 
 * Data access layer for Metro Statistical Areas.
 * Manages MSA data and demographics from US Census Bureau.
 */

import { query } from '../connection';
import type { MSA } from '@feature-analyst/shared';

export class MSARepository {
  /**
   * Get all MSAs with community counts
   */
  async findAll(): Promise<MSA[]> {
    const queryText = `
      SELECT
        m.id,
        m.code,
        m.name,
        m.state,
        m.population,
        m.median_income as "medianIncome",
        m.housing_units as "housingUnits",
        m.rental_vacancy_rate as "rentalVacancyRate",
        m.last_updated as "lastUpdated",
        COUNT(DISTINCT c.id) as "communityCount"
      FROM msas m
      LEFT JOIN communities c ON m.id = c.msa_id
      GROUP BY m.id, m.code, m.name, m.state, m.population, m.median_income, m.housing_units, m.rental_vacancy_rate, m.last_updated
      ORDER BY m.name ASC
    `;

    const result = await query<any>(queryText);

    return result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      state: row.state,
      population: row.population,
      medianIncome: row.medianIncome,
      housingUnits: row.housingUnits,
      rentalVacancyRate: row.rentalVacancyRate ? parseFloat(row.rentalVacancyRate) : undefined,
      lastUpdated: row.lastUpdated,
    }));
  }

  /**
   * Get MSA by code
   */
  async findByCode(code: string): Promise<MSA | null> {
    const queryText = `
      SELECT
        id,
        code,
        name,
        state,
        population,
        median_income as "medianIncome",
        housing_units as "housingUnits",
        rental_vacancy_rate as "rentalVacancyRate",
        last_updated as "lastUpdated"
      FROM msas
      WHERE code =     `;

    const result = await query<any>(queryText, [code]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      state: row.state,
      population: row.population,
      medianIncome: row.medianIncome,
      housingUnits: row.housingUnits,
      rentalVacancyRate: row.rentalVacancyRate ? parseFloat(row.rentalVacancyRate) : undefined,
      lastUpdated: row.lastUpdated,
    };
  }

  /**
   * Update MSA demographics (from Census API)
   */
  async updateDemographics(code: string, demographics: Partial<MSA>): Promise<void> {
    const queryText = `
      UPDATE msas
      SET
        population = ,
        median_income = ,
        housing_units = ,
        rental_vacancy_rate = ,
        last_updated = CURRENT_TIMESTAMP
      WHERE code =     `;

    await query(queryText, [
      code,
      demographics.population,
      demographics.medianIncome,
      demographics.housingUnits,
      demographics.rentalVacancyRate,
    ]);
  }
}

export default new MSARepository();
