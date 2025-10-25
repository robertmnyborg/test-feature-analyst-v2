# Feature Analyst V2 - Infrastructure (AWS CDK)

AWS CDK infrastructure for Feature Analyst V2 application.

## Overview

This directory contains the complete AWS infrastructure definition using AWS CDK v2 with TypeScript. The infrastructure follows **functional programming principles** with minimal class usage.

## Architecture

- **Backend**: ECS on existing EC2 cluster (BRIDGE network mode)
- **Frontend**: S3 + CloudFront (static SPA)
- **Routing**: CloudFront with dual origins (S3 for `/`, ALB for `/api/*`)
- **Database**: RDS PostgreSQL (or existing managed instance)
- **Monitoring**: CloudWatch Logs, Metrics, and Alarms

## Directory Structure

```
infra/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── config.ts           # Environment configuration (pure data)
│   └── feature-analyst-stack.ts  # Main infrastructure stack (functional)
├── cdk.json                # CDK configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Prerequisites

- Node.js 22+
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Existing AWS resources:
  - VPC
  - ECS cluster (EC2-based)
  - Route53 hosted zone
  - ACM certificate

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Update Configuration

Edit `lib/config.ts` and replace placeholders:

```typescript
export const prodConfig: EnvironmentConfig = {
  certificateArn: 'arn:aws:acm:...',        // ← Your certificate
  hostedZoneId: 'Z1234567890ABC',           // ← Your hosted zone
  existingClusterName: 'your-ecs-cluster',  // ← Your ECS cluster
  existingVpcId: 'vpc-xxxxx',               // ← Your VPC
  // ...
};
```

### 3. Bootstrap CDK (First-Time Only)

```bash
cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

## Deployment

### Deploy All Stacks

```bash
# Production
ENVIRONMENT=production cdk deploy --all

# Development
ENVIRONMENT=development cdk deploy --all
```

### Preview Changes (Dry Run)

```bash
ENVIRONMENT=production cdk diff
```

### Synthesize CloudFormation

```bash
cdk synth
```

### Destroy Infrastructure

```bash
ENVIRONMENT=production cdk destroy --all
```

## Infrastructure Components

### Created Resources

The CDK stack creates the following resources:

**Compute & Networking:**
- Application Load Balancer (ALB)
- ECS Service (on existing cluster)
- ECS Task Definition (BRIDGE network mode)
- Security Groups (ALB + ECS)
- Target Group with health checks

**Storage & Distribution:**
- S3 Bucket (frontend assets)
- CloudFront Distribution
  - Origin 1: S3 (static files)
  - Origin 2: ALB (API)
- Route53 A Record (alias to CloudFront)

**Container Registry:**
- ECR Repository (Docker images)

**Monitoring:**
- CloudWatch Log Group
- CloudWatch Alarms:
  - High CPU (>80%)
  - High Memory (>80%)
  - 5XX errors (>5 in 5 minutes)
  - Unhealthy targets
- SNS Topic (alarm notifications)

**IAM:**
- ECS Task Role (CloudWatch, SSM access)
- ECS Execution Role (ECR, CloudWatch)

### Existing Resources (Referenced)

The stack references these existing resources:
- VPC (imported by ID)
- ECS Cluster (imported by name)
- Route53 Hosted Zone (imported by ID)
- ACM Certificate (imported by ARN)

## Configuration

### Environment Variables (ECS Tasks)

Environment variables are injected into ECS tasks from:

1. **Static Configuration** (hardcoded):
   ```typescript
   NODE_ENV: 'production'
   PORT: '3001'
   CORS_ORIGIN: 'https://unit-features.peek.us'
   ```

2. **SSM Parameter Store** (secrets):
   ```typescript
   DATABASE_URL: ssm:/feature-analyst/production/database-url
   CENSUS_API_KEY: ssm:/feature-analyst/production/census-api-key
   ```

### Auto-Scaling Configuration

Backend ECS service auto-scales based on:
- **CPU Utilization**: Target 80%, scales 1-3 tasks
- **Memory Utilization**: Target 80%, scales 1-3 tasks

Configured in `lib/config.ts`:

```typescript
export const backendConfig: BackendConfig = {
  desiredCount: 1,
  minCapacity: 1,
  maxCapacity: 3,
  autoScaling: {
    targetCpuUtilization: 80,
    targetMemoryUtilization: 80,
  },
};
```

### Resource Sizing

Current configuration:
- **ECS Task**: 512 CPU units (0.5 vCPU), 1024 MB RAM
- **Container Port**: 3001
- **Health Check**: `/api/health` (30s interval)

## Functional Programming Patterns

This infrastructure strictly follows functional programming principles:

### Pure Functions

All logic is in pure, side-effect-free functions:

```typescript
// ✅ CORRECT - Pure function
const createSecurityGroups = (scope: Construct, vpc: ec2.IVpc): SecurityGroupConfig => {
  const albSg = new ec2.SecurityGroup(scope, 'AlbSg', { vpc });
  const ecsSg = new ec2.SecurityGroup(scope, 'EcsSg', { vpc });
  return { albSecurityGroup: albSg, ecsSecurityGroup: ecsSg };
};

// ❌ WRONG - Class-based (not used)
class SecurityGroupManager {
  private vpc: ec2.IVpc;
  constructor(vpc: ec2.IVpc) { this.vpc = vpc; }
  createGroups() { /* side effects */ }
}
```

### Immutable Configuration

All configuration objects are `readonly`:

```typescript
export interface EnvironmentConfig {
  readonly environment: string;
  readonly domain: string;
  readonly certificateArn: string;
  // ... all readonly
}
```

### Function Composition

Infrastructure is built by composing small functions:

```typescript
const createBackendInfrastructure = (scope, envConfig, backendConfig) => {
  const vpc = importExistingVpc(scope, envConfig.existingVpcId);
  const cluster = importExistingCluster(scope, vpc, envConfig.existingClusterName);
  const { albSg, ecsSg } = createSecurityGroups(scope, vpc);
  const { alb, targetGroup } = createLoadBalancer(scope, vpc, albSg, backendConfig);
  const service = createEcsService(scope, cluster, taskDefinition, targetGroup, ecsSg);
  return { alb, service, logGroup };
};
```

### Minimal Class Usage

Classes are **only used where CDK requires them**:

```typescript
// ✅ ACCEPTABLE - CDK requires this class
export class FeatureAnalystStack extends Stack {
  constructor(scope, id, envConfig, backendConfig, frontendConfig, monitoringConfig, props) {
    super(scope, id, props);

    // Immediately delegate to pure functions
    const { alb, service, logGroup } = createBackendInfrastructure(this, envConfig, backendConfig);
    const { bucket, distribution } = createFrontendInfrastructure(this, alb, envConfig, frontendConfig);
    createCloudWatchAlarms(this, service, alb, alarmTopic, monitoringConfig);
  }
}
```

## Outputs

After deployment, the stack outputs:

- **LoadBalancerDnsName** - ALB DNS name
- **CloudFrontUrl** - CloudFront distribution URL
- **CustomDomainUrl** - Custom domain (unit-features.peek.us)
- **FrontendBucketName** - S3 bucket name
- **LogGroupName** - CloudWatch log group name

View outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name FeatureAnalystStack-production \
  --query 'Stacks[0].Outputs'
```

## Monitoring

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/feature-analyst/feature-analyst-api --follow
```

### CloudWatch Alarms

Alarms trigger SNS notifications when:
- CPU usage > 80% for 2 periods (5 minutes)
- Memory usage > 80% for 2 periods (5 minutes)
- 5XX errors > 5 in 5 minutes
- Unhealthy target count ≥ 1 for 2 minutes

Configure email in `lib/config.ts`:

```typescript
export const monitoringConfig: MonitoringConfig = {
  enableAlarms: true,
  alarmEmail: 'alerts@peek.us',  // ← Update
};
```

## Troubleshooting

### Stack Deployment Fails

```bash
# View detailed error
cdk deploy --verbose

# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name FeatureAnalystStack-production \
  --max-items 20
```

### Resource Not Found Errors

Verify existing resources:

```bash
# List VPCs
aws ec2 describe-vpcs

# List ECS clusters
aws ecs list-clusters

# List ACM certificates
aws acm list-certificates --region us-east-1

# List Route53 hosted zones
aws route53 list-hosted-zones
```

### CDK Diff Shows Unexpected Changes

```bash
# Compare current vs desired state
cdk diff

# Check for drift
aws cloudformation detect-stack-drift \
  --stack-name FeatureAnalystStack-production
```

## Best Practices

1. **Review changes before deployment**
   ```bash
   cdk diff
   ```

2. **Use environment variables for configuration**
   ```bash
   ENVIRONMENT=production cdk deploy
   ```

3. **Tag all resources**
   - Automatically applied via CDK app tags
   - Environment, Application, ManagedBy

4. **Enable versioning for critical resources**
   - ECR images (automatic)
   - S3 bucket (optional, not enabled by default)

5. **Test in development first**
   ```bash
   ENVIRONMENT=development cdk deploy --all
   ```

## Cost Optimization

- Backend uses **existing EC2 cluster** (no Fargate costs)
- S3 uses **standard tier** (consider Intelligent-Tiering)
- CloudWatch logs **30-day retention** (reduce for dev)
- Auto-scaling **scales down to 1 task** during low traffic

## Support

- **Full Deployment Guide**: `/DEPLOYMENT.md`
- **Quick Start**: `/QUICKSTART_DEPLOYMENT.md`
- **Infrastructure Summary**: `/INFRASTRUCTURE_SUMMARY.md`
- **CDK Documentation**: https://docs.aws.amazon.com/cdk/

## License

Proprietary - Internal use only
