# Backend API - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install & Configure
```bash
cd backend
yarn install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 2. Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE feature_analyst;"

# Run schema
psql -U postgres -d feature_analyst -f ../database-schema.sql
```

### 3. Start Development Server
```bash
yarn dev
```

Server runs on **http://localhost:3001**

---

## 📋 All 7 API Endpoints

### Communities
```bash
# List communities
GET /api/communities?msaId=<optional>&limit=50&offset=0

# Get community details
GET /api/communities/:id
```

### Units
```bash
# Search units (with AND feature filtering)
POST /api/units/search
{
  "communityIds": ["uuid1", "uuid2"],
  "features": ["Granite Countertops", "Stainless Steel Appliances"],
  "bedroomRange": {"min": 1, "max": 3},
  "bathroomRange": {"min": 1, "max": 2},
  "priceRange": {"min": 1000, "max": 3000},
  "squareFeetRange": {"min": 500, "max": 2000},
  "availability": "available",
  "limit": 50,
  "offset": 0
}
```

### Features
```bash
# Get all features with usage counts
GET /api/features?communityId=<optional>
```

### Metro Statistical Areas
```bash
# List MSAs
GET /api/msa

# Get MSA demographics (from US Census Bureau)
GET /api/msa/:code?refresh=true
```

### Export
```bash
# Export to CSV or JSON
POST /api/export
{
  "communityIds": ["uuid1"],
  "features": ["Granite Countertops"],
  "format": "csv",  // or "json"
  "fields": ["Community", "Unit Number", "Bedrooms", "Monthly Rent"]
}
```

---

## 🧪 Testing

```bash
# Run tests
yarn test

# Type checking
yarn type-check

# Build for production
yarn build

# Start production server
yarn start
```

---

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Compile TypeScript to JavaScript |
| `yarn start` | Start production server |
| `yarn test` | Run Jest tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn type-check` | TypeScript type checking |
| `yarn lint` | ESLint code linting |

---

## 📊 Key Features

✅ **AND Feature Filtering** - Units must have ALL selected features
✅ **Deduplication** - Each unit appears only once
✅ **US Census API** - Automatic MSA demographics (cached 1 year)
✅ **Performance** - <3s for 10k units, <30s for 5k unit exports
✅ **Validation** - All inputs validated with clear error messages
✅ **Error Handling** - Centralized error handler with proper HTTP codes
✅ **CORS** - Configured for separated frontend deployment
✅ **Logging** - Morgan HTTP logs + custom query logging

---

## 🗄️ Database Schema

**Tables:**
- `msas` - Metro Statistical Areas
- `communities` - Multifamily properties
- `units` - Individual apartments
- `features` - Amenities/attributes
- `unit_features` - Many-to-many relationship

**Key Indexes:**
- `idx_units_community_id`
- `idx_units_filters` (composite)
- `idx_unit_features_lookup`

---

## 🌐 Environment Variables

**Required:**
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=feature_analyst
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

**Optional:**
```bash
PORT=3001
CORS_ORIGIN=http://localhost:5173
CENSUS_API_KEY=your_census_key
LOG_LEVEL=debug
EXPORT_MAX_RECORDS=5000
```

---

## 📁 Project Structure

```
backend/src/
├── database/
│   ├── connection.ts              # PostgreSQL pool
│   └── repositories/              # Data access layer
├── services/                      # Business logic
├── routes/                        # API endpoints (7 total)
├── middleware/                    # Validation & errors
├── utils/                         # Census API & CSV
└── __tests__/                     # Jest tests
```

---

## 🐛 Troubleshooting

**Database connection failed:**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -U postgres -d feature_analyst -c "SELECT 1;"
```

**Port 3001 already in use:**
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>
```

**TypeScript errors:**
```bash
yarn clean
yarn install
yarn build
```

---

## 📚 Documentation

- **Full API Docs:** `README.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Specification:** `../NEWSPEC.md` (apps-feature-analyst)
- **Database Schema:** `../database-schema.sql`

---

## ✅ Implementation Status

- [x] All 7 REST endpoints implemented
- [x] AND feature filtering logic
- [x] Data deduplication
- [x] US Census API integration
- [x] CSV/JSON export
- [x] Request validation
- [x] Error handling
- [x] Unit tests passing
- [x] TypeScript compilation clean
- [x] CORS configuration
- [x] Logging with Morgan

**Status:** ✅ Production Ready

---

**Version:** 2.0.0  
**Last Updated:** 2025-10-24  
**Tech Stack:** Node.js 20+ | Express | TypeScript | PostgreSQL
