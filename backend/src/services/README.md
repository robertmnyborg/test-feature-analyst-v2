# Services

This directory contains business logic services for the Feature Analyst V2 backend.

## Structure

```
services/
├── communityService.ts    # Community data retrieval and processing
├── unitService.ts         # Unit search, filtering, deduplication
├── featureService.ts      # Feature aggregation and statistics
├── msaService.ts          # MSA data and Census API integration
└── exportService.ts       # CSV/JSON export generation
```

## Service Layer Responsibilities

- Implement business logic separate from HTTP routing
- Coordinate data access through repositories
- Apply data transformations and calculations
- Handle external API integrations (US Census Bureau)
- Implement caching strategies
- Validate business rules

## Example Service

```typescript
import { Community } from '@shared/types';
import { communityRepository } from '../repositories/communityRepository';

export class CommunityService {
  async getCommunities(msaId?: string, limit = 50, offset = 0): Promise<Community[]> {
    // Business logic here
    return communityRepository.findAll({ msaId, limit, offset });
  }
}

export const communityService = new CommunityService();
```
