# Database Migrations

This directory contains database migration scripts for Feature Analyst V2.

## Overview

The application uses PostgreSQL as the primary data warehouse. The schema is defined in `/database-schema.sql` at the project root.

## Running Migrations

### Locally (Development)

```bash
# Set database URL
export DATABASE_URL="postgresql://user:password@localhost:5432/feature_analyst"

# Run migrations
cd backend
node migrations/run-migrations.js
```

### Production (CI/CD Pipeline)

Migrations run automatically during deployment via GitHub Actions. See `.github/workflows/deploy.yml` for details.

### Manual Production Migration

```bash
# Get database URL from AWS SSM
export DATABASE_URL=$(aws ssm get-parameter \
  --name "/feature-analyst/production/database-url" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text)

# Run migrations
node migrations/run-migrations.js
```

## Seeding Sample Data

To seed sample data (development only):

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/feature_analyst"
export SEED_DATA=true

node migrations/run-migrations.js
```

## Schema Files

- `/database-schema.sql` - Main database schema (tables, indexes, constraints)
- `/database-sample-data.sql` - Sample data for development/testing

## Migration Strategy

This project uses a simple migration approach:

1. **Schema as Code**: The complete schema is defined in SQL files
2. **Idempotent Operations**: Uses `CREATE TABLE IF NOT EXISTS` and similar patterns
3. **No Versioning**: Schema represents the desired state, not incremental changes
4. **Production Safety**: Migrations run AFTER backend deployment to ensure compatibility

## Future Enhancements

For more complex migration needs, consider:

- Migration versioning (e.g., Flyway, Liquibase)
- Rollback capabilities
- Data transformation scripts
- Schema comparison tools

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Check database URL format: `postgresql://user:password@host:port/database`
2. Verify network access (security groups, VPN)
3. Confirm SSL requirements for AWS RDS

### Schema Errors

If migrations fail:

1. Check PostgreSQL version compatibility
2. Review error messages for syntax issues
3. Test schema locally before production deployment

### SSM Parameter Access

If you can't retrieve database URL:

1. Verify AWS credentials: `aws sts get-caller-identity`
2. Check IAM permissions for SSM Parameter Store
3. Confirm parameter path: `/feature-analyst/{environment}/database-url`
