/**
 * Feature Service
 * 
 * Business logic for feature/amenity operations.
 */

import featureRepository from '../database/repositories/FeatureRepository';
import type { Feature } from '@feature-analyst/shared';

export class FeatureService {
  async getFeatures(communityId?: string): Promise<Feature[]> {
    return await featureRepository.findAll(communityId);
  }
}

export default new FeatureService();
