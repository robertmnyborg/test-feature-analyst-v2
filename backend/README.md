# Feature Analyst V2 - Backend API

Backend REST API for the Feature Analyst V2 application, providing endpoints for multifamily unit feature comparison and analysis.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest
- **Development**: tsx (TypeScript execution)

## Architecture

```
backend/src/
├── database/
│   ├── connection.ts           # PostgreSQL connection pool
│   └── repositories/           # Data access layer
│       ├── CommunityRepository.ts
│       ├── UnitRepository.ts
│       ├── FeatureRepository.ts
│       └── MSARepository.ts
├── services/                   # Business logic layer
│   ├── CommunityService.ts
│   ├── UnitService.ts
│   ├── FeatureService.ts
│   ├── MSAService.ts
│   └── ExportService.ts
├── routes/                     # API route handlers
│   ├── communities.ts         # 2 endpoints
│   ├── units.ts               # 1 endpoint
│   ├── features.ts            # 1 endpoint
│   ├── msa.ts                 # 2 endpoints
│   └── export.ts              # 1 endpoint
├── middleware/
│   ├── errorHandler.ts        # Centralized error handling
│   └── validators.ts          # Request validation
├── utils/
│   ├── census-api.ts          # US Census Bureau API integration
│   └── csv-generator.ts       # CSV export utility
├── __tests__/
│   └── validation.test.ts     # Unit tests
└── index.ts                   # Express app entry point
```

## API Endpoints

### 1. GET /api/communities
Retrieve communities with optional MSA filtering.

**Query Parameters:**
- `msaId` (optional): Filter by Metro Statistical Area
- `limit` (optional, default: 50): Number of results per page
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "communities": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### 2. GET /api/communities/:id
Get detailed information for a specific community.

**Path Parameters:**
- `id`: Community UUID

**Response:**
```json
{
  "community": {
    "id": "...",
    "name": "...",
    "totalUnits": 150,
    ...
  }
}
```

### 3. POST /api/units/search
Search units with comprehensive filters.

**Request Body:**
```json
{
  "communityIds": ["..."],
  "features": ["Granite Countertops", "Stainless Steel Appliances"],
  "bedroomRange": { "min": 1, "max": 3 },
  "bathroomRange": { "min": 1, "max": 2 },
  "priceRange": { "min": 1000, "max": 3000 },
  "squareFeetRange": { "min": 500, "max": 2000 },
  "availability": "available",
  "sortBy": "price",
  "sortOrder": "asc",
  "limit": 50,
  "offset": 0
}
```

**Feature Filtering Logic:**
- Uses **AND logic**: Unit must have ALL selected features
- Implements efficient SQL with subquery and HAVING clause
- Deduplication ensures each unit appears only once

**Response:**
```json
{
  "units": [...],
  "total": 42,
  "limit": 50,
  "offset": 0,
  "appliedFilters": {...}
}
```

### 4. GET /api/features
Get available features with usage counts.

**Query Parameters:**
- `communityId` (optional): Scope to specific community

**Response:**
```json
{
  "features": [
    {
      "id": "...",
      "name": "Granite Countertops",
      "category": "kitchen",
      "unitCount": 1234
    }
  ],
  "total": 50
}
```

### 5. GET /api/msa
Get list of Metro Statistical Areas.

**Response:**
```json
{
  "msas": [...],
  "total": 100
}
```

### 6. GET /api/msa/:code
Get MSA demographics (from US Census Bureau API).

**Path Parameters:**
- `code`: MSA code

**Query Parameters:**
- `refresh` (optional): Force refresh from Census API

**Response:**
```json
{
  "msa": {
    "code": "...",
    "name": "Denver-Aurora-Lakewood, CO",
    "population": 2963821,
    "medianIncome": 77843,
    "housingUnits": 1234567,
    "rentalVacancyRate": 5.2
  }
}
```

**Caching:**
- Demographics cached for 1 year
- Graceful degradation if Census API fails

### 7. POST /api/export
Export filtered units to CSV or JSON.

**Request Body:**
```json
{
  "communityIds": ["..."],
  "features": [...],
  "format": "csv",
  "fields": ["Community", "Unit Number", "Bedrooms", "Bathrooms", "Monthly Rent"]
}
```

**Response:**
- File download with appropriate headers
- CSV or JSON format
- Max 5,000 records per export

## Setup

### 1. Install Dependencies
```bash
cd backend
yarn install
```

### 2. Configure Environment
Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=feature_analyst
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# US Census Bureau API (optional)
CENSUS_API_KEY=your_api_key

# Export Configuration
EXPORT_MAX_RECORDS=5000
```

### 3. Database Setup
Ensure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE feature_analyst;

# Run schema migration
\i /path/to/database-schema.sql
```

## Development

### Run Development Server
```bash
yarn dev
```

The server will start on `http://localhost:3001` with hot reloading enabled.

### Build for Production
```bash
yarn build
```

Output will be in `dist/` directory.

### Start Production Server
```bash
yarn start
```

### Run Tests
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch
```

### Type Checking
```bash
yarn type-check
```

### Linting
```bash
yarn lint
```

## Performance Targets

- **Search Performance**: <3 seconds for up to 10,000 units
- **Export Performance**: <30 seconds for up to 5,000 units
- **Concurrent Users**: Support 20+ concurrent users

## Performance Optimizations

### Database Optimizations
1. **Connection Pooling**: Max 20 connections, 30s idle timeout
2. **Indexes**: Optimized indexes on frequently queried columns
3. **Query Optimization**: DISTINCT ON for deduplication
4. **Feature Filtering**: Efficient subquery with HAVING clause

### AND Feature Filtering Implementation
```sql
-- Unit must have ALL selected features
SELECT u.* FROM units u
INNER JOIN (
  SELECT uf.unit_id
  FROM unit_features uf
  INNER JOIN features f ON f.id = uf.feature_id
  WHERE f.name = ANY()
  GROUP BY uf.unit_id
  HAVING COUNT(DISTINCT f.name) = 
) matching_features ON matching_features.unit_id = u.id
```

### Deduplication Strategy
- DISTINCT ON (unit_id) for query-level deduplication
- Group by unique identifiers to prevent duplicates
- Efficient aggregation of features using ARRAY_AGG

### Export Optimization
- Streaming for large datasets
- Field selection to reduce payload size
- Proper CSV escaping and formatting

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Validation error
- `404`: Resource not found
- `500`: Server error

### Error Response Format
```json
{
  "error": "Validation failed",
  "message": "Bedroom min cannot exceed max"
}
```

### Validation Errors
All requests are validated before processing:
- Required fields
- Data types
- Range constraints
- Format validation

## US Census Bureau API Integration

### Features
- Fetch MSA demographics (population, median income, housing units, vacancy rate)
- 1-year cache TTL to minimize API calls
- Graceful degradation if API unavailable

### Getting an API Key
1. Visit https://api.census.gov/data/key_signup.html
2. Register for a free API key
3. Add to `.env` as `CENSUS_API_KEY`

### API Endpoint Used
```
https://api.census.gov/data/{year}/acs/acs5
```

Variables:
- `B01003_001E`: Total Population
- `B19013_001E`: Median Household Income
- `B25001_001E`: Housing Units
- `B25004_008E`: Rental Vacancy Rate

## Logging

### Development
- Morgan 'dev' format
- Console output with colors
- SQL query logging (if LOG_LEVEL=debug)

### Production
- Morgan 'combined' format
- Structured error logging
- Performance metrics logging

## Security

### Implemented Security Measures
1. **Helmet**: Security headers
2. **CORS**: Controlled origin access
3. **Input Validation**: All requests validated
4. **SQL Injection Prevention**: Parameterized queries
5. **Error Sanitization**: No stack traces in production

## Deployment

This backend is designed to be deployed alongside the frontend. See the main project README for deployment instructions.

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://unit-features.peek.us
POSTGRES_HOST=<rds-endpoint>
POSTGRES_DB=feature_analyst
POSTGRES_USER=<db-user>
POSTGRES_PASSWORD=<db-password>
CENSUS_API_KEY=<census-key>
LOG_LEVEL=info
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -U postgres -d feature_analyst -c "SELECT 1;"
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### TypeScript Compilation Errors
```bash
# Clean and rebuild
yarn clean
yarn build
```

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Ensure all tests pass before committing
4. Use meaningful commit messages
5. Update documentation for API changes

## License

Internal use only - Peek Analytics Team
