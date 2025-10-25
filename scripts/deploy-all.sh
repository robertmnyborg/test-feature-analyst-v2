#!/bin/bash
# Complete deployment script for Feature Analyst V2
# This script handles the full deployment process

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${ENVIRONMENT:-production}"
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${GREEN}Feature Analyst V2 - Complete Deployment${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${AWS_REGION}"
echo ""

# Function to check command exists
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is not installed${NC}"
    exit 1
  fi
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
check_command node
check_command yarn
check_command aws
check_command docker
check_command cdk
echo -e "${GREEN}✓ All prerequisites installed${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
cd "${PROJECT_ROOT}"
yarn install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Build frontend
echo -e "${YELLOW}Step 2: Building frontend...${NC}"
yarn workspace @feature-analyst/frontend build
if [ ! -d "${PROJECT_ROOT}/frontend/dist" ]; then
  echo -e "${RED}Error: Frontend build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 3: Build and push backend Docker image
echo -e "${YELLOW}Step 3: Building and pushing backend Docker image...${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPOSITORY="feature-analyst-api"
IMAGE_TAG="latest"

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Build Docker image
echo "Building Docker image..."
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} -f backend/Dockerfile .

# Tag for ECR
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}

# Push to ECR
echo "Pushing to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}

echo -e "${GREEN}✓ Docker image pushed to ECR${NC}"
echo ""

# Step 4: Deploy infrastructure with CDK
echo -e "${YELLOW}Step 4: Deploying infrastructure with CDK...${NC}"
cd "${PROJECT_ROOT}/infra"

# Install CDK dependencies if not already installed
if [ ! -d "node_modules" ]; then
  yarn install
fi

# Deploy all stacks
ENVIRONMENT=${ENVIRONMENT} cdk deploy --all --require-approval never

echo -e "${GREEN}✓ Infrastructure deployed${NC}"
echo ""

# Step 5: Update ECS service
echo -e "${YELLOW}Step 5: Updating ECS service...${NC}"
CLUSTER_NAME="peek-ecs-cluster"
SERVICE_NAME="feature-analyst-api-${ENVIRONMENT}"

aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment \
  --region ${AWS_REGION} \
  > /dev/null

echo "Waiting for service to stabilize..."
aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${AWS_REGION}

echo -e "${GREEN}✓ ECS service updated${NC}"
echo ""

# Step 6: Run database migrations
echo -e "${YELLOW}Step 6: Running database migrations...${NC}"
cd "${PROJECT_ROOT}/backend"

# Get database URL from SSM
export DATABASE_URL=$(aws ssm get-parameter \
  --name "/feature-analyst/${ENVIRONMENT}/database-url" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region ${AWS_REGION})

# Run migrations
node migrations/run-migrations.js

echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Step 7: Get CloudFront distribution ID and invalidate cache
echo -e "${YELLOW}Step 7: Invalidating CloudFront cache...${NC}"

# Get distribution ID from stack outputs
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name "FeatureAnalystStack-${ENVIRONMENT}" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text \
  --region ${AWS_REGION})

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id ${DISTRIBUTION_ID} \
    --paths "/*" \
    --region ${AWS_REGION} \
    > /dev/null
  echo -e "${GREEN}✓ CloudFront cache invalidated${NC}"
else
  echo -e "${YELLOW}⚠ Could not find CloudFront distribution ID${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${AWS_REGION}"
echo ""

# Get application URL
if [ "${ENVIRONMENT}" = "production" ]; then
  APP_URL="https://unit-features.peek.us"
else
  APP_URL="https://unit-features-dev.peek.us"
fi

echo "Application URL: ${APP_URL}"
echo "API Health Check: ${APP_URL}/api/health"
echo ""
echo "Verify deployment:"
echo "  curl ${APP_URL}/api/health"
echo ""
echo "View logs:"
echo "  aws logs tail /ecs/feature-analyst/feature-analyst-api --follow"
echo ""
