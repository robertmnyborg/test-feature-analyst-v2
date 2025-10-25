-- Feature Analyst V2 - PostgreSQL Database Schema
-- This is a placeholder schema based on the NEWSPEC.md requirements
-- Actual schema should be adapted to match existing data warehouse structure

-- ============================================================================
-- Metro Statistical Areas (MSA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS msas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,

    -- Demographics (from US Census Bureau API)
    population INTEGER,
    median_income INTEGER,
    housing_units INTEGER,
    rental_vacancy_rate DECIMAL(5,2),

    -- Metadata
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_msas_code ON msas(code);
CREATE INDEX idx_msas_state ON msas(state);

-- ============================================================================
-- Communities (Multifamily Properties)
-- ============================================================================

CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    msa_id UUID REFERENCES msas(id),

    -- Address
    street VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20),

    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Metrics
    total_units INTEGER NOT NULL DEFAULT 0,
    available_units INTEGER DEFAULT 0,

    -- Amenities (array of strings)
    amenities TEXT[],

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_communities_msa_id ON communities(msa_id);
CREATE INDEX idx_communities_name ON communities(name);
CREATE INDEX idx_communities_city_state ON communities(city, state);

-- ============================================================================
-- Units (Individual Apartments/Spaces)
-- ============================================================================

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id),

    -- Unit identification
    unit_number VARCHAR(50),

    -- Physical attributes
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(3,1) NOT NULL,
    square_feet INTEGER NOT NULL,

    -- Pricing
    monthly_rent DECIMAL(10,2) NOT NULL,

    -- Availability
    availability VARCHAR(20) NOT NULL DEFAULT 'occupied',
    -- Values: 'available', 'occupied', 'offline'

    -- Floor plan and media
    floor_plan VARCHAR(100),
    photo_urls TEXT[],
    floor_plan_urls TEXT[],
    virtual_tour_url TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_bedrooms CHECK (bedrooms >= 0 AND bedrooms <= 5),
    CONSTRAINT chk_bathrooms CHECK (bathrooms >= 0 AND bathrooms <= 4),
    CONSTRAINT chk_square_feet CHECK (square_feet > 0),
    CONSTRAINT chk_monthly_rent CHECK (monthly_rent >= 0),
    CONSTRAINT chk_availability CHECK (availability IN ('available', 'occupied', 'offline'))
);

CREATE INDEX idx_units_community_id ON units(community_id);
CREATE INDEX idx_units_bedrooms ON units(bedrooms);
CREATE INDEX idx_units_bathrooms ON units(bathrooms);
CREATE INDEX idx_units_monthly_rent ON units(monthly_rent);
CREATE INDEX idx_units_availability ON units(availability);
CREATE INDEX idx_units_square_feet ON units(square_feet);

-- ============================================================================
-- Features (Amenities and Attributes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50),
    -- Categories: 'kitchen', 'flooring', 'appliances', 'technology', 'bathroom', 'other'
    description TEXT,

    -- Popularity tracking
    is_popular BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_features_name ON features(name);
CREATE INDEX idx_features_category ON features(category);
CREATE INDEX idx_features_is_popular ON features(is_popular);

-- ============================================================================
-- Unit Features (Many-to-Many Relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS unit_features (
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,

    PRIMARY KEY (unit_id, feature_id)
);

CREATE INDEX idx_unit_features_unit_id ON unit_features(unit_id);
CREATE INDEX idx_unit_features_feature_id ON unit_features(feature_id);

-- ============================================================================
-- Materialized View: Feature Usage Statistics
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS feature_stats AS
SELECT
    f.id,
    f.name,
    f.category,
    COUNT(DISTINCT uf.unit_id) as unit_count,
    COUNT(DISTINCT u.community_id) as community_count
FROM features f
LEFT JOIN unit_features uf ON f.id = uf.feature_id
LEFT JOIN units u ON uf.unit_id = u.id
GROUP BY f.id, f.name, f.category
ORDER BY unit_count DESC;

CREATE INDEX idx_feature_stats_unit_count ON feature_stats(unit_count DESC);

-- Refresh materialized view daily
-- REFRESH MATERIALIZED VIEW feature_stats;

-- ============================================================================
-- Triggers: Update Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data Queries
-- ============================================================================

-- Search units with filters (example query)
/*
SELECT
    u.id,
    u.unit_number,
    c.name as community_name,
    u.bedrooms,
    u.bathrooms,
    u.square_feet,
    u.monthly_rent,
    u.availability,
    ARRAY_AGG(DISTINCT f.name) as features
FROM units u
INNER JOIN communities c ON u.community_id = c.id
LEFT JOIN unit_features uf ON u.id = uf.unit_id
LEFT JOIN features f ON uf.feature_id = f.id
WHERE
    c.id = ANY($1::uuid[])  -- Community filter
    AND u.bedrooms >= $2 AND u.bedrooms <= $3  -- Bedroom range
    AND u.bathrooms >= $4 AND u.bathrooms <= $5  -- Bathroom range
    AND u.monthly_rent >= $6 AND u.monthly_rent <= $7  -- Price range
    AND u.square_feet >= $8 AND u.square_feet <= $9  -- Square feet range
    AND ($10::varchar IS NULL OR u.availability = $10)  -- Availability filter
GROUP BY u.id, c.name
HAVING
    -- Feature filter (AND logic: unit must have ALL selected features)
    CASE WHEN $11::varchar[] IS NOT NULL
        THEN ARRAY_AGG(DISTINCT f.name) @> $11::varchar[]
        ELSE TRUE
    END
ORDER BY c.name, u.unit_number
LIMIT $12 OFFSET $13;
*/

-- Get communities by MSA
/*
SELECT c.*
FROM communities c
WHERE c.msa_id = $1
ORDER BY c.name
LIMIT $2 OFFSET $3;
*/

-- Get features with usage counts
/*
SELECT
    f.name,
    f.category,
    COUNT(DISTINCT uf.unit_id) as unit_count
FROM features f
LEFT JOIN unit_features uf ON f.id = uf.feature_id
GROUP BY f.id, f.name, f.category
ORDER BY unit_count DESC;
*/

-- ============================================================================
-- Data Deduplication Strategy
-- ============================================================================

-- Note: This schema assumes units are already deduplicated in the data warehouse.
-- If units appear in multiple source tables, implement deduplication logic in the
-- repository layer using:
--   1. DISTINCT ON (unit_number, community_id)
--   2. CTE with ROW_NUMBER() PARTITION BY for tie-breaking
--   3. Materialized view with unique constraint

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Composite index for common filter combinations
CREATE INDEX idx_units_filters ON units(community_id, bedrooms, bathrooms, monthly_rent, square_feet);

-- Index for feature search (AND logic)
CREATE INDEX idx_unit_features_lookup ON unit_features(feature_id, unit_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE msas IS 'Metro Statistical Areas from US Census Bureau';
COMMENT ON TABLE communities IS 'Multifamily properties/complexes';
COMMENT ON TABLE units IS 'Individual apartments/spaces within communities';
COMMENT ON TABLE features IS 'Amenities and attributes (granite countertops, smart home, etc.)';
COMMENT ON TABLE unit_features IS 'Many-to-many relationship between units and features';
COMMENT ON MATERIALIZED VIEW feature_stats IS 'Cached feature usage statistics for performance';
