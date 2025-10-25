# Feature Analyst V2 - Quick Start Deployment

Fast-track deployment guide for Feature Analyst V2.

## Prerequisites Checklist

- ✅ AWS CLI configured (`aws configure`)
- ✅ Node.js 22+ installed
- ✅ Yarn 3.5.1+ installed
- ✅ Docker installed
- ✅ AWS CDK installed (`npm install -g aws-cdk`)
- ✅ GitHub repository with Actions enabled

## 5-Minute Setup

### 1. Update Configuration (2 minutes)

Edit `/infra/lib/config.ts` and replace placeholders:

```typescript
export const prodConfig: EnvironmentConfig = {
  certificateArn: 'arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT',  // ← Update
  hostedZoneId: 'Z1234567890ABC',              // ← Update
  hostedZoneName: 'peek.us',
  existingClusterName: 'your-ecs-cluster',     // ← Update
  existingVpcId: 'vpc-xxxxx',                  // ← Update
  // ... rest is fine
};
```

### 2. Setup AWS Secrets (2 minutes)

```bash
cd scripts
export ENVIRONMENT=production
./setup-ssm-parameters.sh
```

Enter when prompted:
- PostgreSQL connection string
- Census API key (optional)
- CORS origin (default is fine)

### 3. Deploy Everything (1 minute to start, 10-15 minutes to complete)

```bash
cd scripts
export ENVIRONMENT=production
./deploy-all.sh
```

This script will:
1. ✅ Install dependencies
2. ✅ Build frontend
3. ✅ Build and push Docker image to ECR
4. ✅ Deploy CDK infrastructure
5. ✅ Update ECS service
6. ✅ Run database migrations
7. ✅ Invalidate CloudFront cache

### 4. Verify Deployment

```bash
# Test API
curl https://unit-features.peek.us/api/health

# Open in browser
open https://unit-features.peek.us
```

---

## Automated CI/CD Setup (5 minutes)

### 1. Add GitHub Secrets

Go to: `Settings > Secrets and variables > Actions > New repository secret`

Add these secrets:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `CLOUDFRONT_DISTRIBUTION_ID` - From CDK output (after first deployment)

### 2. Push to GitHub

```bash
git add .
git commit -m "Add deployment infrastructure"
git push origin main
```

GitHub Actions will automatically deploy on every push to `main` (production) or `develop` (development).

---

## Manual Deployment Options

### Deploy Backend Only

```bash
# Build and push Docker image
docker build -t feature-analyst-api -f backend/Dockerfile .
docker tag feature-analyst-api:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/feature-analyst-api:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/feature-analyst-api:latest

# Update ECS service
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-production \
  --force-new-deployment
```

### Deploy Frontend Only

```bash
# Build frontend
yarn workspace @feature-analyst/frontend build

# Deploy to S3
aws s3 sync frontend/dist/ s3://feature-analyst-frontend-production/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### Deploy Infrastructure Only

```bash
cd infra
ENVIRONMENT=production cdk deploy --all
```

---

## Troubleshooting

### "Cluster not found"

Update `existingClusterName` in `/infra/lib/config.ts`

```bash
# List your ECS clusters
aws ecs list-clusters
```

### "VPC not found"

Update `existingVpcId` in `/infra/lib/config.ts`

```bash
# List your VPCs
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0]]' --output table
```

### "Certificate not found"

Update `certificateArn` in `/infra/lib/config.ts`

```bash
# List ACM certificates
aws acm list-certificates --region us-east-1
```

### "Database connection failed"

Check SSM parameter:

```bash
aws ssm get-parameter \
  --name "/feature-analyst/production/database-url" \
  --with-decryption
```

### "ECS tasks not starting"

Check CloudWatch Logs:

```bash
aws logs tail /ecs/feature-analyst/feature-analyst-api --follow
```

Common issues:
- Database URL is incorrect
- Memory/CPU limits too low (increase in config.ts)
- Security group blocking traffic

---

## Cost Optimization

### Development Environment

Save money by:
1. Set `desiredCount: 0` when not in use
2. Use smaller instance types
3. Reduce CloudWatch log retention to 7 days

```bash
# Stop development ECS service
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-development \
  --desired-count 0
```

### Production Environment

- Backend auto-scales based on load (1-3 tasks)
- CloudFront caching reduces origin requests
- S3 uses standard tier (consider Intelligent-Tiering)

---

## Daily Operations

### View Logs

```bash
# Real-time logs
aws logs tail /ecs/feature-analyst/feature-analyst-api --follow

# Logs from last hour
aws logs tail /ecs/feature-analyst/feature-analyst-api --since 1h
```

### Check Service Status

```bash
aws ecs describe-services \
  --cluster peek-ecs-cluster \
  --services feature-analyst-api-production
```

### Manual Restart

```bash
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-production \
  --force-new-deployment
```

### Update Environment Variables

```bash
# Update SSM parameter
aws ssm put-parameter \
  --name "/feature-analyst/production/cors-origin" \
  --value "https://new-domain.com" \
  --overwrite

# Restart service to pick up changes
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-production \
  --force-new-deployment
```

---

## Emergency Procedures

### Rollback Backend

```bash
# List task definition revisions
aws ecs list-task-definitions --family-prefix feature-analyst-api

# Rollback to previous revision
aws ecs update-service \
  --cluster peek-ecs-cluster \
  --service feature-analyst-api-production \
  --task-definition feature-analyst-api:PREVIOUS_REVISION
```

### Rollback Frontend

```bash
# Re-deploy previous commit
git checkout PREVIOUS_COMMIT
yarn workspace @feature-analyst/frontend build
aws s3 sync frontend/dist/ s3://feature-analyst-frontend-production/ --delete
aws cloudfront create-invalidation --distribution-id E123... --paths "/*"
```

---

## Next Steps

1. **Setup Monitoring**: Configure CloudWatch dashboards
2. **Setup Alerts**: Add email to SNS topic for alarms
3. **Enable Backups**: Configure RDS automated backups
4. **Review Costs**: Check AWS Cost Explorer after first month
5. **Performance Testing**: Load test the API endpoints

---

## Support

- **Full Documentation**: See `/DEPLOYMENT.md`
- **Infrastructure Details**: See `/INFRASTRUCTURE_SUMMARY.md`
- **GitHub Actions**: See `/.github/workflows/deploy.yml`

**Need help?** Check CloudWatch Logs first, then review troubleshooting section in `/DEPLOYMENT.md`.
