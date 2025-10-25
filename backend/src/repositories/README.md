# Repositories

This directory contains data access layer implementations for PostgreSQL.

## Structure

```
repositories/
├── database.ts            # PostgreSQL connection pool and configuration
├── communityRepository.ts # Community data access
├── unitRepository.ts      # Unit data access and search queries
├── featureRepository.ts   # Feature data access
└── msaRepository.ts       # MSA data access
```

## Repository Layer Responsibilities

- Encapsulate database queries and connections
- Implement PostgreSQL-specific logic
- Handle query parameterization and SQL injection prevention
- Manage connection pooling
- Implement deduplication logic
- Provide clean interface for service layer

## Database Connection

```typescript
// database.ts example
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

## Example Repository

```typescript
import pool from './database';
import { Community } from '@shared/types';

export class CommunityRepository {
  async findAll(filters: { msaId?: string; limit: number; offset: number }): Promise<Community[]> {
    const query = `
      SELECT * FROM communities
      WHERE ($1::text IS NULL OR msa_id = $1)
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await pool.query(query, [filters.msaId, filters.limit, filters.offset]);
    return rows;
  }
}

export const communityRepository = new CommunityRepository();
```
