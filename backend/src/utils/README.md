# Utils

This directory contains utility functions and helpers for the backend.

## Structure

```
utils/
├── csvExporter.ts         # CSV file generation utilities
├── jsonExporter.ts        # JSON file generation utilities
├── censusApi.ts           # US Census Bureau API client
├── cache.ts               # Caching utilities for external API responses
└── validators.ts          # Additional validation helpers
```

## Utility Responsibilities

- Provide reusable helper functions
- Implement third-party API clients
- Handle file generation and streaming
- Implement caching mechanisms
- Provide common validation and transformation utilities

## Example Utilities

```typescript
// csvExporter.ts
import { Unit } from '@shared/types';

export function generateCSV(units: Unit[], fields?: string[]): string {
  // Implementation here
  return csv;
}

// censusApi.ts
export class CensusApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMSADemographics(msaCode: string) {
    // Implementation here
  }
}
```
