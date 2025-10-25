# Feature Analyst V2 - Deployment Guide

Complete deployment guide for Feature Analyst V2 application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [First-Time Deployment](#first-time-deployment)
- [Update Deployment](#update-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Cost Estimates](#cost-estimates)

---

## Architecture Overview

Feature Analyst V2 uses a **separated deployment architecture** optimized for performance and scalability:

### Deployment Components

```
┌─────────────────────────────────────────────────────────┐
│                    Route53 (DNS)                        │
│              unit-features.peek.us                      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│              CloudFront (CDN)                           │
│  - HTTPS/SSL Termination                                │
│  - Static asset caching                                 │
│  - Route /api/* to backend                              │
│  - Route /* to frontend                                 │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
   ┌───────▼───────┐      ┌────────▼────────┐
   │  S3 Bucket    │      │ Application     │
   │  (Frontend)   │      │ Load Balancer   │
   │  Static Files │      │ (Backend API)   │
   └───────────────┘      └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   ECS Cluster   │
                          │   (EC2 Based)   │
                          │   - 1-3 tasks   │
                          │   - Auto-scale  │
                          │   - Health chk  │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │  RDS PostgreSQL │
                          │  (Data Source)  │
                          └─────────────────┘
```

### Technology Stack

- **Frontend**: React 18 + Vite (Static SPA) → S3 + CloudFront
- **Backend**: Node.js 22 + Express (Containerized) → ECS on EC2
- **Database**: PostgreSQL (RDS or existing managed instance)
- **Infrastructure**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions

### Key Features

- **Single Domain**: All traffic through `unit-features.peek.us` (no CORS issues)
- **Zero-Downtime Deployments**: Rolling updates for backend
- **Auto-Scaling**: Backend scales based on CPU/memory (1-3 tasks)
- **Cost-Optimized**: Uses existing EC2 cluster (no Fargate costs)
- **Independent Deployments**: Frontend and backend deploy separately

---

## Prerequisites

### Required Tools

1. **AWS CLI** (v2.x or higher)
   ```bash
   aws --version
   # aws-cli/2.x.x Python/3.x.x ...
   ```

2. **AWS CDK** (v2.110.0 or higher)
   ```bash
   npm install -g aws-cdk
   cdk --version
   # 2.110.0 (build ...)
   ```

3. **Node.js** (v22 or higher)
   ```bash
   node --version
   # v22.x.x
   ```

4. **Yarn** (v3.5.1 or higher)
   ```bash
   yarn --version
   # 3.5.1
   ```

5. **Docker** (for local testing and ECR pushes)
   ```bash
   docker --version
   # Docker version 24.x.x ...
   ```

### AWS Account Setup

1. **IAM Permissions**

   Your AWS user/role needs the following permissions:
   - ECS (full access to specific cluster)
   - ECR (push/pull images)
   - S3 (read/write to frontend bucket)
   - CloudFront (create distributions, invalidate cache)
   - Route53 (manage DNS records)
   - CloudWatch (logs and metrics)
   - SSM Parameter Store (read secrets)
   - IAM (create roles for ECS tasks)

2. **Existing Resources**

   The following resources must exist before deployment:
   - **VPC**: Your organization's VPC
   - **ECS Cluster**: EC2-based ECS cluster (BRIDGE network mode)
   - **Route53 Hosted Zone**: `peek.us` domain
   - **ACM Certificate**: SSL certificate for `*.peek.us`
   - **RDS PostgreSQL**: Database instance (or connection to existing)

3. **Update Configuration**

   Edit `/infra/lib/config.ts` and replace placeholder values:
   ```typescript
   // Production configuration
   export const prodConfig: EnvironmentConfig = {
     certificateArn: 'arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID', // ← Update
     hostedZoneId: 'HOSTED_ZONE_ID', // ← Update
     existingClusterName: 'peek-ecs-cluster', // ← Update
     existingVpcId: 'vpc-xxxxx', // ← Update
     // ... other settings
   };
   ```

### GitHub Secrets

Configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (after first deployment) |

---

## Environment Setup

### 1. Install Dependencies

```bash
# Install all workspace dependencies
yarn install

# Install CDK dependencies
cd infra
yarn install
cd ..
```

### 2. Setup SSM Parameter Store

Store sensitive configuration in AWS SSM Parameter Store:

```bash
# Run interactive setup script
cd scripts
export ENVIRONMENT=production  # or 'development'
./setup-ssm-parameters.sh
```

**Required Parameters:**
- `/feature-analyst/production/database-url` - PostgreSQL connection string
- `/feature-analyst/production/census-api-key` - US Census Bureau API key
- `/feature-analyst/production/cors-origin` - Frontend URL (https://unit-features.peek.us)

**Optional Parameters:**
- `/feature-analyst/production/mongodb-url` - MongoDB URL (if needed for legacy data)

### 3. Create ECR Repository

```bash
# Create repository for backend Docker images
aws ecr create-repository \
  --repository-name feature-analyst-api \
  --image-scanning-configuration scanOnPush=true \
  --region us-east-1
```

### 4. Bootstrap CDK (First-Time Only)

```bash
# Bootstrap CDK in your AWS account/region
cd infra
cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

---

## First-Time Deployment

### Step 1: Build Frontend

```bash
# Build optimized production frontend
yarn workspace @feature-analyst/frontend build

# Verify build output
ls -la frontend/dist
```

### Step 2: Build and Push Backend Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
docker build -t feature-analyst-api:latest -f backend/Dockerfile .

# Tag image for ECR
docker tag feature-analyst-api:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/feature-analyst-api:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/feature-analyst-api:latest
```

### Step 3: Deploy Infrastructure with CDK

```bash
cd infra

# Review changes (dry-run)
ENVIRONMENT=production cdk diff

# Deploy all stacks
ENVIRONMENT=production cdk deploy --all

# Confirm deployment when prompted
```

This will create:
- ECS service with task definition
- Application Load Balancer
- S3 bucket for frontend
- CloudFront distribution
- Route53 DNS record
- CloudWatch alarms
- IAM roles and security groups

**Important**: Save the CloudFront Distribution ID from the CDK output - you'll need it for GitHub Actions.

### Step 4: Run Database Migrations

```bash
cd backend

# Get database URL from SSM
export DATABASE_URL=$(aws ssm get-parameter \
  --name "/feature-analyst/production/database-url" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text)

# Run migrations
node migrations/run-migrations.js
```

### Step 5: Verify Deployment

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster peek-ecs-cluster \
  --services feature-analyst-api-production \
  --region us-east-1

# Check running tasks
aws ecs list-tasks \
  --cluster peek-ecs-cluster \
  --service-name feature-analyst-api-production \
  --region us-east-1

# Test backend API
curl https://unit-features.peek.us/api/health

# Test frontend
open https://unit-features.peek.us
```

---

## Update Deployment

### Automated Deployment (Recommended)

Push code to GitHub, and CI/CD handles everything:

```bash
# Commit changes
git add .
git commit -m "Update feature analyst"

# Deploy to production
git push origin main

# Deploy to development
git push origin develop
```

**GitHub Actions Workflow:**
1. Run tests (backend + frontend)
2. Build backend Docker image → Push to ECR
3. Update ECS service (rolling deployment)
4. Build frontend → Upload to S3
5. Invalidate CloudFront cache
6. Run database migrations (if needed)

### Manual Backend Deployment

```bash
# Build and push new Docker image
docker build -t feature-analyst-api:latest -f backend/Dockerfile .
docker tag feature-analyst-api:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/feature-analyst-api:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/feature-analyst-api:latest

# Force new ECS deployment
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-production \
  --force-new-deployment \
  --region us-east-1

# Wait for deployment to complete
aws ecs wait services-stable \
  --cluster peek-ecs-cluster \
  --services feature-analyst-api-production \
  --region us-east-1
```

### Manual Frontend Deployment

```bash
# Build frontend
yarn workspace @feature-analyst/frontend build

# Upload to S3
aws s3 sync frontend/dist/ s3://feature-analyst-frontend-production/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html"

# Upload HTML with different cache settings
aws s3 sync frontend/dist/ s3://feature-analyst-frontend-production/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## Rollback Procedures

### Backend Rollback

ECS allows quick rollback to previous task definition:

```bash
# List task definition revisions
aws ecs list-task-definitions \
  --family-prefix feature-analyst-api \
  --region us-east-1

# Update service to previous revision
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-production \
  --task-definition feature-analyst-api:PREVIOUS_REVISION \
  --region us-east-1

# Wait for rollback to complete
aws ecs wait services-stable \
  --cluster peek-ecs-cluster \
  --services feature-analyst-api-production \
  --region us-east-1
```

### Frontend Rollback

Use S3 versioning or redeploy previous commit:

```bash
# Option 1: Re-deploy previous git commit
git checkout PREVIOUS_COMMIT
yarn workspace @feature-analyst/frontend build
# ... upload to S3 and invalidate CloudFront

# Option 2: Enable S3 versioning (if not already enabled)
aws s3api put-bucket-versioning \
  --bucket feature-analyst-frontend-production \
  --versioning-configuration Status=Enabled
```

### Database Rollback

**Important**: Database migrations are **not automatically reversible**. Always:
1. Backup database before migrations
2. Test migrations in development first
3. Have rollback SQL scripts prepared

```bash
# Backup before migration
pg_dump -h RDS_HOST -U postgres -d feature_analyst > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql -h RDS_HOST -U postgres -d feature_analyst < backup_TIMESTAMP.sql
```

---

## Monitoring and Logs

### CloudWatch Logs

View backend application logs:

```bash
# View logs from CLI
aws logs tail /ecs/feature-analyst/feature-analyst-api --follow --region us-east-1

# Or in AWS Console
# CloudWatch > Log groups > /ecs/feature-analyst/feature-analyst-api
```

### CloudWatch Alarms

Alarms are configured for:
- **High CPU Usage** (>80%) - Backend ECS service
- **High Memory Usage** (>80%) - Backend ECS service
- **5XX Errors** (>5 errors in 5 minutes) - Application Load Balancer
- **Unhealthy Targets** - Load balancer health checks failing

Alarms send notifications to SNS topic → Email (configure in `/infra/lib/config.ts`).

### Monitoring Dashboards

Create custom CloudWatch dashboard:

```bash
# View metrics in AWS Console
# CloudWatch > Dashboards > Create dashboard

# Key metrics to track:
# - ECS: CPUUtilization, MemoryUtilization, RunningTaskCount
# - ALB: RequestCount, TargetResponseTime, HTTPCode_Target_5XX_Count
# - CloudFront: Requests, BytesDownloaded, ErrorRate
```

### Application Performance

Monitor API performance:

```bash
# Check ALB response times
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=app/feature-analyst-lb/... \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region us-east-1
```

---

## Troubleshooting

### Backend Not Responding

1. **Check ECS service status**
   ```bash
   aws ecs describe-services \
     --cluster peek-ecs-cluster \
     --services feature-analyst-api-production \
     --region us-east-1
   ```

2. **Check running tasks**
   ```bash
   aws ecs list-tasks \
     --cluster peek-ecs-cluster \
     --service-name feature-analyst-api-production \
     --region us-east-1
   ```

3. **View task logs**
   ```bash
   # Get task ID from previous command
   aws ecs describe-tasks \
     --cluster peek-ecs-cluster \
     --tasks TASK_ID \
     --region us-east-1

   # View logs
   aws logs tail /ecs/feature-analyst/feature-analyst-api --follow
   ```

4. **Common issues**:
   - Database connection failure → Check SSM parameter `/feature-analyst/production/database-url`
   - Health check failing → Verify `/api/health` endpoint returns 200
   - Memory/CPU limit → Increase in `/infra/lib/config.ts` (memoryLimitMiB, cpu)

### Frontend Not Loading

1. **Check S3 bucket**
   ```bash
   aws s3 ls s3://feature-analyst-frontend-production/
   ```

2. **Check CloudFront distribution**
   ```bash
   aws cloudfront get-distribution --id E1234567890ABC
   ```

3. **Test CloudFront directly**
   ```bash
   curl -I https://d111111abcdef8.cloudfront.net
   ```

4. **Common issues**:
   - 404 errors → Verify `index.html` exists in S3 root
   - Cached old version → Invalidate CloudFront cache
   - CORS errors → Check backend CORS_ORIGIN matches frontend domain

### API Requests Failing

1. **Check CloudFront behavior**
   - Verify `/api/*` behavior routes to ALB (not S3)
   - Check cache policy is `CACHING_DISABLED` for API requests

2. **Test ALB directly**
   ```bash
   # Get ALB DNS name
   aws elbv2 describe-load-balancers \
     --names feature-analyst-lb \
     --query 'LoadBalancers[0].DNSName' \
     --output text

   # Test directly
   curl http://ALB_DNS_NAME/api/health
   ```

3. **Check security groups**
   ```bash
   # Verify ALB security group allows inbound HTTPS
   # Verify ECS security group allows inbound from ALB on port 3001
   ```

### Database Connection Issues

1. **Test connection from ECS task**
   ```bash
   # Get task ID
   TASK_ID=$(aws ecs list-tasks --cluster peek-ecs-cluster --service-name feature-analyst-api-production --query 'taskArns[0]' --output text)

   # Execute command in running container
   aws ecs execute-command \
     --cluster peek-ecs-cluster \
     --task ${TASK_ID} \
     --container ApiContainer \
     --interactive \
     --command "/bin/sh"

   # Inside container, test database connection
   node -e "const { Client } = require('pg'); const c = new Client({connectionString: process.env.DATABASE_URL}); c.connect().then(() => console.log('OK')).catch(e => console.error(e));"
   ```

2. **Check RDS security group**
   - Verify ECS security group is allowed inbound on PostgreSQL port (5432)

3. **Verify SSM parameter**
   ```bash
   aws ssm get-parameter \
     --name "/feature-analyst/production/database-url" \
     --with-decryption \
     --query 'Parameter.Value' \
     --output text
   ```

---

## Cost Estimates

### Development Environment

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| ECS Tasks (1 task) | 0.5 vCPU, 1GB RAM on existing EC2 | $0 (uses existing cluster) |
| Application Load Balancer | Standard ALB | ~$16 |
| S3 Storage (Frontend) | ~100MB, standard tier | ~$0.01 |
| CloudFront | Free tier: 1TB transfer | $0-$8 |
| Route53 | 1 hosted zone, 100K queries | ~$0.50 |
| CloudWatch Logs | 5GB ingestion, 30-day retention | ~$2.50 |
| **Total Development** | | **~$19-27/month** |

### Production Environment

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| ECS Tasks (avg 2 tasks) | 0.5 vCPU, 1GB RAM on existing EC2 | $0 (uses existing cluster) |
| Application Load Balancer | Standard ALB | ~$16 |
| S3 Storage (Frontend) | ~100MB, standard tier | ~$0.01 |
| CloudFront | ~10TB transfer/month | ~$85 |
| Route53 | 1 hosted zone, 1M queries | ~$0.90 |
| CloudWatch Logs | 50GB ingestion, 30-day retention | ~$25 |
| SNS (Alarms) | ~100 notifications/month | ~$0.10 |
| **Total Production** | | **~$127-135/month** |

**Notes:**
- RDS PostgreSQL costs not included (assumes existing shared instance)
- ECS costs $0 because using existing EC2 cluster (no Fargate charges)
- Actual costs depend on traffic volume and CloudFront data transfer

### Cost Optimization Tips

1. **Use existing resources**: Leverage existing ECS cluster and RDS instance
2. **CloudFront caching**: Optimize cache policies to reduce origin requests
3. **S3 lifecycle policies**: Enable Intelligent-Tiering for frontend assets
4. **CloudWatch log retention**: Reduce to 7 days for development environments
5. **Auto-scaling**: Backend scales down to 1 task during low-traffic periods

---

## Additional Resources

- **AWS CDK Documentation**: https://docs.aws.amazon.com/cdk/
- **ECS Best Practices**: https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/
- **CloudFront Developer Guide**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/
- **GitHub Actions AWS Deployment**: https://github.com/aws-actions

---

## Support

For deployment issues or questions:
1. Check CloudWatch logs first
2. Review this troubleshooting guide
3. Contact DevOps team or infrastructure specialist

**Emergency Rollback**: If production is broken, follow [Rollback Procedures](#rollback-procedures) immediately.
