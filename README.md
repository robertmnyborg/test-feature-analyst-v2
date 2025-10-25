# Feature Analyst V2

Multifamily Unit Feature Comparison Tool for Investment and Acquisition Analysis.

## Overview

Feature Analyst V2 is a web-based application that helps investment and acquisition analysts identify rent premiums associated with specific property features across multifamily communities. Built as a Yarn Workspaces monorepo with TypeScript.

**Production URL**: TBD (will deploy to AWS)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TanStack Table v8
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (data warehouse)
- **Package Manager**: Yarn 3.5.1+ (workspaces)
- **Build Tool**: Vite (frontend), TSC (backend)

## Project Structure

```
feature-analyst-v2/
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API endpoints (7 routes)
│   │   ├── services/    # Business logic layer
│   │   ├── repositories/# Data access layer (PostgreSQL)
│   │   └── utils/       # Utilities (CSV export, Census API, etc.)
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/  # React components (6 main components)
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client
│   │   ├── types/       # Frontend-specific types
│   │   └── styles/      # CSS stylesheets
│   ├── package.json
│   └── vite.config.ts
├── shared/               # Shared TypeScript types and utilities
│   ├── src/
│   │   ├── types.ts     # Domain models, DTOs, API contracts
│   │   └── index.ts
│   └── package.json
├── package.json          # Root workspace config
└── tsconfig.json         # Root TypeScript config
```

## Getting Started

### Prerequisites

- **Node.js**: v22.0.0 or higher
- **Yarn**: v3.5.1 or higher
- **PostgreSQL**: v14+ (for data warehouse)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd test-apps-feature-analyst-v2
```

2. Install dependencies (all workspaces):
```bash
yarn install
```

3. Set up environment variables:
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials
```

4. Build all packages:
```bash
yarn build
```

### Development

Run both frontend and backend in development mode:

```bash
yarn dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

Or run them individually:

```bash
# Backend only
yarn workspace @feature-analyst/backend dev

# Frontend only
yarn workspace @feature-analyst/frontend dev
```

### Available Scripts

**Root-level scripts**:
- `yarn dev` - Run both frontend and backend in dev mode
- `yarn build` - Build all packages
- `yarn lint` - Lint all packages
- `yarn type-check` - TypeScript type checking across all packages
- `yarn test` - Run tests in all packages
- `yarn clean` - Remove all build artifacts and node_modules

**Package-specific scripts**:
```bash
# Shared package
yarn workspace @feature-analyst/shared build
yarn workspace @feature-analyst/shared type-check

# Backend package
yarn workspace @feature-analyst/backend dev
yarn workspace @feature-analyst/backend build
yarn workspace @feature-analyst/backend test

# Frontend package
yarn workspace @feature-analyst/frontend dev
yarn workspace @feature-analyst/frontend build
yarn workspace @feature-analyst/frontend preview
```

## Backend API Endpoints

The backend exposes 7 REST API endpoints:

### 1. GET /api/communities
Retrieve list of communities with optional MSA filter.

**Query Params**: `msaId`, `limit`, `offset`

### 2. GET /api/communities/:id
Get detailed information for a specific community.

### 3. POST /api/units/search
Search units with comprehensive filters (AND logic for features).

**Body**: `SearchFilters` (communityIds, features, bedrooms, bathrooms, price, sqft, etc.)

### 4. GET /api/features
List available features for filtering, sorted by popularity.

**Query Params**: `communityId` (optional)

### 5. GET /api/msa
List available metro statistical areas.

### 6. GET /api/msa/:code
Get MSA demographics from US Census Bureau API.

### 7. POST /api/export
Export filtered units to CSV or JSON.

**Body**: `ExportRequest` (filters + format)

## Frontend Components

The frontend includes 6 main components:

1. **CommunityBrowser** - Browse and select communities
2. **AdvancedFilterPanel** - Comprehensive filter controls
3. **UnitComparisonTable** - Sortable unit data table (TanStack Table)
4. **PhotoFloorPlanViewer** - Image viewer modal/lightbox
5. **ExportButton** - CSV/JSON export controls
6. **MSAStatisticsPanel** - Metro area demographics display

## Database Schema

See `database-schema.sql` for PostgreSQL schema.

**Key Tables**:
- `communities` - Community/property information
- `units` - Unit/apartment data
- `features` - Feature/amenity definitions
- `unit_features` - Many-to-many relationship
- `msas` - Metro statistical areas

## Environment Variables

### Backend (.env)

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

# US Census Bureau API
CENSUS_API_KEY=your_api_key

# Caching
CACHE_TTL_SECONDS=86400
CACHE_ENABLED=true
```

See `backend/.env.example` for full configuration.

## TypeScript Configuration

The project uses TypeScript 5+ with strict mode enabled across all packages:

- **Root tsconfig.json**: Base configuration with path aliases
- **Backend tsconfig.json**: CommonJS modules for Node.js
- **Frontend tsconfig.json**: ESNext modules for Vite bundler
- **Shared tsconfig.json**: Library build configuration

Path aliases are configured for clean imports:
- `@shared/*` - Shared package types
- `@backend/*` - Backend source files (backend only)
- `@frontend/*` or `@/*` - Frontend source files (frontend only)

## Development Workflow

### Adding a New Feature

1. **Define types** in `shared/src/types.ts`
2. **Create API endpoint** in `backend/src/routes/`
3. **Implement service** in `backend/src/services/`
4. **Create React component** in `frontend/src/components/`
5. **Add API call** to `frontend/src/services/api.ts`
6. **Create hook** in `frontend/src/hooks/` (optional)

### Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (auto-format on save)
- **Pre-commit hooks**: Husky + lint-staged
- **Type checking**: TypeScript strict mode

Pre-commit hooks will automatically:
- Lint and fix TypeScript files
- Format all code with Prettier
- Check for type errors

## Testing

```bash
# Run all tests
yarn test

# Backend tests
yarn workspace @feature-analyst/backend test

# Frontend tests
yarn workspace @feature-analyst/frontend test
```

## Deployment

### Backend Deployment
Backend will be deployed to AWS ECS (containerized Express app).

### Frontend Deployment
Frontend will be deployed to S3 + CloudFront (static site).

### Database
PostgreSQL database will be managed separately (existing data warehouse).

## Architecture Decisions

### Monorepo Structure
- **Yarn Workspaces**: Share dependencies, simplify versioning
- **Shared package**: Single source of truth for types
- **Independent deployments**: Backend and frontend deploy separately

### API Design
- **RESTful endpoints**: Standard HTTP methods and status codes
- **Relative paths** (`/api/*`): Works in both dev (proxy) and prod (CloudFront)
- **Validation**: Shared validation logic from `@shared/types`

### Data Layer
- **Repository pattern**: Encapsulate database queries
- **Service layer**: Business logic separate from HTTP routing
- **Deduplication**: Handle units appearing in multiple data sources

## Contributing

1. Create a feature branch
2. Make changes following code style guidelines
3. Ensure all tests pass: `yarn test`
4. Ensure types are correct: `yarn type-check`
5. Commit (pre-commit hooks will run automatically)
6. Create pull request

## License

Internal tool - proprietary.

## Support

For issues or questions, contact the Investment & Acquisition Analytics Team.
