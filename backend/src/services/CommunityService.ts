/**
 * Community Service
 * 
 * Business logic for community operations.
 */

import communityRepository from '../database/repositories/CommunityRepository';
import type { Community, GetCommunitiesRequest } from '@feature-analyst/shared';

export class CommunityService {
  async getCommunities(params: GetCommunitiesRequest): Promise<{ communities: Community[]; total: number }> {
    return await communityRepository.findAll(params);
  }

  async getCommunityById(id: string): Promise<Community | null> {
    return await communityRepository.findById(id);
  }
}

export default new CommunityService();
