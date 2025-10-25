# Feature Analyst V2 - Infrastructure Summary

Complete deployment infrastructure created for Feature Analyst V2 application.

## Files Created

### 1. Docker Configuration

**Location**: `/backend/`

- **`Dockerfile`** - Multi-stage Docker build for backend API
  - Stage 1: Build TypeScript with Node.js 22-alpine
  - Stage 2: Production runtime with non-root user
  - Health check on port 3001
  - Optimized layer caching

- **`.dockerignore`** - Excludes unnecessary files from Docker context
  - node_modules, tests, development files
  - Reduces image size and build time

### 2. AWS CDK Infrastructure

**Location**: `/infra/`

#### Configuration Files

- **`package.json`** - CDK project dependencies
  - aws-cdk-lib: ^2.110.0
  - constructs: ^10.3.0
  - TypeScript: ^5.2.0

- **`tsconfig.json`** - TypeScript compiler configuration for CDK
  - Target: ES2020
  - Module: CommonJS
  - Strict type checking enabled

- **`cdk.json`** - CDK app configuration
  - App entry point: `node bin/app.js`
  - Context settings for all AWS CDK features
  - Watch configuration for development

- **`.gitignore`** - Excludes CDK build artifacts

#### Infrastructure Code (Functional Programming Pattern)

- **`lib/config.ts`** - Environment configuration (pure data structures)
  - `EnvironmentConfig` - Environment-specific settings
  - `BackendConfig` - ECS service configuration
  - `FrontendConfig` - S3 and CloudFront settings
  - `MonitoringConfig` - CloudWatch alarms configuration
  - Pure functions: `getEnvironmentConfig()`, `getCorsOrigin()`, `getParameterPaths()`

- **`lib/feature-analyst-stack.ts`** - Main CDK stack (functional approach)
  - **All business logic in pure functions**
  - Minimal class usage (only CDK requirement)
  - Infrastructure components:
    - VPC and ECS cluster import
    - Security groups (ALB + ECS)
    - IAM roles (task + execution)
    - CloudWatch log groups
    - Application Load Balancer
    - ECR repository
    - ECS task definition and service
    - Auto-scaling configuration
    - S3 bucket for frontend
    - CloudFront distribution with dual origins
    - Route53 DNS records
    - CloudWatch alarms (CPU, memory, errors, health checks)
    - SNS topic for alarm notifications

- **`bin/app.ts`** - CDK app entry point
  - Reads environment from context or env var
  - Creates stack with configuration
  - Applies tags for resource management

### 3. GitHub Actions CI/CD

**Location**: `/.github/workflows/`

- **`deploy.yml`** - Complete CI/CD pipeline

  **Jobs:**
  1. **Test** - Run all tests (backend + frontend)
     - Type checking
     - Linting
     - Unit tests

  2. **Build Backend** - Docker image to ECR
     - Multi-stage build
     - Tag with branch and SHA
     - Push to Amazon ECR
     - Cache optimization

  3. **Deploy Backend** - ECS service update
     - Force new deployment
     - Wait for service stability
     - Verify running tasks

  4. **Build Frontend** - Vite production build
     - Optimize assets
     - Upload build artifacts

  5. **Deploy Frontend** - S3 + CloudFront
     - Upload to S3 with cache headers
     - Different caching for HTML vs assets
     - Invalidate CloudFront cache

  6. **Migrate Database** - Run migrations (production only)
     - Fetch DB URL from SSM
     - Execute migration scripts

  **Environments:**
  - `main` branch → production
  - `develop` branch → development

### 4. Database Migrations

**Location**: `/backend/migrations/`

- **`run-migrations.js`** - Migration runner (functional approach)
  - Connects to PostgreSQL via SSM parameter
  - Executes schema from `/database-schema.sql`
  - Optional seeding with `/database-sample-data.sql`
  - Validation function for connection testing
  - SSL support for AWS RDS

- **`README.md`** - Migration documentation
  - Usage instructions
  - Local and production workflows
  - Troubleshooting guide

### 5. Environment Configuration

**Location**: `/scripts/`

- **`setup-ssm-parameters.sh`** - Interactive SSM setup script
  - Creates all required SSM parameters
  - Prompts for sensitive values
  - Supports both environments (dev/prod)
  - Tags parameters for management

- **`get-ssm-parameters.sh`** - Fetch parameters for local development
  - Retrieves all parameters from SSM
  - Creates `.env` file in backend directory
  - Ready for local development

**Backend `.env.example`** already exists - no changes needed.

### 6. Deployment Documentation

**Location**: `/` (project root)

- **`DEPLOYMENT.md`** - Comprehensive deployment guide
  - Architecture overview with diagrams
  - Prerequisites and tool requirements
  - Environment setup instructions
  - First-time deployment walkthrough
  - Update deployment procedures
  - Rollback procedures (backend, frontend, database)
  - Monitoring and logs access
  - Troubleshooting guide
  - Cost estimates (dev and prod)

---

## Architecture Highlights

### Separated Deployment Pattern

```
Frontend (React SPA)     Backend (Express API)
        ↓                         ↓
    S3 Bucket              Docker → ECR
        ↓                         ↓
   CloudFront           ECS on EC2 Cluster
        ↓                         ↓
    (Static)              Load Balancer
        ↓                         ↓
        └─────── CloudFront ──────┘
                    ↓
          unit-features.peek.us
```

### Key Design Decisions

1. **Functional Programming in CDK**
   - All logic in pure functions
   - Classes only where CDK requires
   - Composable infrastructure functions
   - No side effects in configuration

2. **ECS on Existing EC2 Cluster**
   - Uses BRIDGE network mode
   - Dynamic port mapping
   - Cost-optimized (no Fargate charges)
   - Auto-scaling 1-3 tasks

3. **CloudFront Dual Origins**
   - S3 origin for `/` (static files)
   - ALB origin for `/api/*` (backend API)
   - Single domain (no CORS issues)
   - Optimized caching policies

4. **Zero-Downtime Deployments**
   - Rolling updates for ECS
   - Health checks during deployment
   - CloudFront cache invalidation
   - Independent frontend/backend deploys

5. **Security Best Practices**
   - Non-root container user
   - Secrets in SSM Parameter Store (encrypted)
   - Security groups with least privilege
   - HTTPS only (SSL enforcement)
   - IAM roles with minimal permissions

6. **Monitoring and Observability**
   - CloudWatch Logs aggregation
   - Alarms for CPU, memory, errors, health
   - SNS notifications
   - ECS service metrics
   - ALB performance metrics

---

## Deployment Workflow

### Automated (GitHub Actions)

```bash
# Production deployment
git push origin main

# Development deployment
git push origin develop
```

### Manual (Local)

```bash
# 1. Setup environment
cd scripts
./setup-ssm-parameters.sh

# 2. Build and deploy infrastructure
cd ../infra
yarn install
ENVIRONMENT=production cdk deploy --all

# 3. Build and push Docker image
cd ..
docker build -t feature-analyst-api -f backend/Dockerfile .
# ... tag and push to ECR

# 4. Update ECS service
aws ecs update-service --cluster peek-ecs-cluster --service feature-analyst-api-production --force-new-deployment

# 5. Build and deploy frontend
yarn workspace @feature-analyst/frontend build
aws s3 sync frontend/dist/ s3://feature-analyst-frontend-production/
aws cloudfront create-invalidation --distribution-id E123... --paths "/*"

# 6. Run migrations
cd backend
node migrations/run-migrations.js
```

---

## Configuration Requirements

### Before First Deployment

**Update `/infra/lib/config.ts`:**

```typescript
// Replace these placeholders:
certificateArn: 'arn:aws:acm:...'        // Your ACM certificate ARN
hostedZoneId: 'Z1234567890ABC'           // Your Route53 hosted zone ID
existingClusterName: 'your-ecs-cluster'  // Your ECS cluster name
existingVpcId: 'vpc-xxxxx'               // Your VPC ID
```

**Create SSM Parameters:**

```bash
cd scripts
export ENVIRONMENT=production
./setup-ssm-parameters.sh
```

**Required values:**
- PostgreSQL connection string
- Census API key (optional)
- CORS origin (https://unit-features.peek.us)

**Update GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID` (after first deployment)

---

## Cost Breakdown

### Development Environment: ~$19-27/month

- ECS Tasks: $0 (uses existing cluster)
- ALB: ~$16/month
- S3: ~$0.01/month
- CloudFront: $0-$8/month (free tier)
- Route53: ~$0.50/month
- CloudWatch: ~$2.50/month

### Production Environment: ~$127-135/month

- ECS Tasks: $0 (uses existing cluster)
- ALB: ~$16/month
- S3: ~$0.01/month
- CloudFront: ~$85/month (10TB transfer)
- Route53: ~$0.90/month
- CloudWatch: ~$25/month
- SNS: ~$0.10/month

**Notes:**
- RDS costs not included (assumes existing shared instance)
- No Fargate charges (uses existing EC2 cluster)
- CloudFront is main cost driver (scales with traffic)

---

## Technology Stack

### Infrastructure
- **IaC**: AWS CDK v2 (TypeScript)
- **CI/CD**: GitHub Actions
- **Container Registry**: Amazon ECR
- **Orchestration**: Amazon ECS (EC2 launch type)
- **Load Balancing**: Application Load Balancer
- **CDN**: CloudFront
- **Storage**: S3
- **DNS**: Route53
- **Secrets**: SSM Parameter Store
- **Monitoring**: CloudWatch

### Application
- **Frontend**: React 18 + Vite
- **Backend**: Node.js 22 + Express
- **Database**: PostgreSQL (RDS)
- **Runtime**: Docker (Alpine Linux)

---

## Functional Programming Principles

This infrastructure follows functional programming patterns:

1. **Pure Functions**: All configuration logic is stateless and side-effect free
2. **Immutable Data**: Configuration objects are readonly
3. **Function Composition**: Infrastructure built by composing small functions
4. **No Classes**: Classes only where CDK framework requires (minimal)
5. **Explicit Dependencies**: All inputs passed as function parameters

**Example Pattern:**

```typescript
// ✅ CORRECT - Pure function approach
const createSecurityGroups = (scope: Construct, vpc: ec2.IVpc): SecurityGroupConfig => {
  const albSg = new ec2.SecurityGroup(scope, 'AlbSg', { vpc });
  const ecsSg = new ec2.SecurityGroup(scope, 'EcsSg', { vpc });
  return { albSecurityGroup: albSg, ecsSecurityGroup: ecsSg };
};

// ❌ WRONG - Class-based approach (not used)
class SecurityGroupManager {
  private vpc: ec2.IVpc;
  constructor(vpc: ec2.IVpc) { this.vpc = vpc; }
  createGroups() { /* ... */ }
}
```

---

## Next Steps

1. **Configure AWS Resources**
   - Update VPC ID, ECS cluster name, certificate ARN in `/infra/lib/config.ts`
   - Create SSM parameters using `scripts/setup-ssm-parameters.sh`

2. **Bootstrap CDK** (first-time only)
   ```bash
   cd infra
   cdk bootstrap
   ```

3. **Deploy Infrastructure**
   ```bash
   cd infra
   ENVIRONMENT=production cdk deploy --all
   ```

4. **Setup CI/CD**
   - Add GitHub secrets (AWS credentials, CloudFront ID)
   - Push code to trigger automated deployment

5. **Verify Deployment**
   - Check ECS service status
   - Test API: `curl https://unit-features.peek.us/api/health`
   - Open frontend: `https://unit-features.peek.us`

6. **Monitor**
   - CloudWatch Logs: `/ecs/feature-analyst/feature-analyst-api`
   - CloudWatch Alarms: Check SNS email for alerts
   - ECS Service: Monitor running task count and health

---

## Support Resources

- **Full Deployment Guide**: `/DEPLOYMENT.md`
- **Migration Guide**: `/backend/migrations/README.md`
- **CDK Documentation**: https://docs.aws.amazon.com/cdk/
- **GitHub Actions**: `/.github/workflows/deploy.yml`

---

## Infrastructure Compliance

✅ **All requirements met:**

- Docker configuration (multi-stage, non-root, health checks)
- ECS on existing EC2 cluster (BRIDGE mode)
- S3 + CloudFront for frontend
- Single domain with CloudFront routing
- RDS PostgreSQL (or existing instance)
- Auto-scaling (1-3 tasks)
- CloudWatch monitoring and alarms
- SSM Parameter Store for secrets
- GitHub Actions CI/CD
- Database migrations
- Zero-downtime deployments
- Functional programming patterns
- Comprehensive documentation

**Status**: ✅ Ready for deployment
