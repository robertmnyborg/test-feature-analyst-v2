/**
 * MSA Service
 * 
 * Business logic for Metro Statistical Area operations.
 * Integrates with US Census Bureau API for demographics.
 */

import msaRepository from '../database/repositories/MSARepository';
import { fetchMSADemographics } from '../utils/census-api';
import type { MSA } from '@feature-analyst/shared';

export class MSAService {
  async getAllMSAs(): Promise<MSA[]> {
    return await msaRepository.findAll();
  }

  async getMSAByCode(code: string, forceRefresh = false): Promise<MSA | null> {
    let msa = await msaRepository.findByCode(code);

    if (!msa) {
      return null;
    }

    // Check if demographics need refresh (older than 1 year or force refresh)
    const needsRefresh = forceRefresh || !msa.lastUpdated || 
      (new Date().getTime() - new Date(msa.lastUpdated).getTime()) > 365 * 24 * 60 * 60 * 1000;

    if (needsRefresh) {
      try {
        const demographics = await fetchMSADemographics(code);
        await msaRepository.updateDemographics(code, demographics);
        
        // Refetch updated data
        msa = await msaRepository.findByCode(code);
      } catch (error) {
        console.warn(`Failed to fetch demographics for MSA ${code}:`, error);
        // Graceful degradation: return cached data
      }
    }

    return msa;
  }
}

export default new MSAService();
