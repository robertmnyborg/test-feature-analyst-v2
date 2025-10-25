#!/bin/bash
# Setup AWS SSM Parameter Store parameters for Feature Analyst V2
# This script creates all required parameters for the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-development}"

echo -e "${GREEN}Setting up SSM parameters for Feature Analyst V2${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${AWS_REGION}"
echo ""

# Function to create or update SSM parameter
create_parameter() {
  local name=$1
  local value=$2
  local type=$3
  local description=$4

  echo -n "Creating parameter: ${name}... "

  # Check if parameter already exists
  if aws ssm get-parameter --name "${name}" --region "${AWS_REGION}" &>/dev/null; then
    echo -e "${YELLOW}EXISTS${NC}"
    read -p "Do you want to update it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      return
    fi
  fi

  # Create or update parameter
  aws ssm put-parameter \
    --name "${name}" \
    --value "${value}" \
    --type "${type}" \
    --description "${description}" \
    --overwrite \
    --region "${AWS_REGION}" \
    --tags "Key=Environment,Value=${ENVIRONMENT}" "Key=Application,Value=feature-analyst-v2" \
    &>/dev/null

  echo -e "${GREEN}CREATED${NC}"
}

# Required parameters
echo -e "${YELLOW}Setting up required parameters...${NC}"
echo ""

# 1. Database URL
echo "1. Database URL (PostgreSQL connection string)"
if [ -z "$DATABASE_URL" ]; then
  read -p "Enter PostgreSQL connection string: " DATABASE_URL
fi
create_parameter \
  "/feature-analyst/${ENVIRONMENT}/database-url" \
  "${DATABASE_URL}" \
  "SecureString" \
  "PostgreSQL database connection string for Feature Analyst ${ENVIRONMENT}"

# 2. Census API Key
echo ""
echo "2. US Census Bureau API Key"
if [ -z "$CENSUS_API_KEY" ]; then
  read -p "Enter Census API key (or press Enter to skip): " CENSUS_API_KEY
fi
if [ -n "$CENSUS_API_KEY" ]; then
  create_parameter \
    "/feature-analyst/${ENVIRONMENT}/census-api-key" \
    "${CENSUS_API_KEY}" \
    "SecureString" \
    "US Census Bureau API key for demographic data"
fi

# 3. CORS Origin
echo ""
echo "3. CORS Origin (Frontend URL)"
if [ "${ENVIRONMENT}" = "production" ]; then
  CORS_ORIGIN="${CORS_ORIGIN:-https://unit-features.peek.us}"
else
  CORS_ORIGIN="${CORS_ORIGIN:-https://unit-features-dev.peek.us}"
fi
read -p "Enter CORS origin [${CORS_ORIGIN}]: " INPUT_CORS
CORS_ORIGIN="${INPUT_CORS:-$CORS_ORIGIN}"
create_parameter \
  "/feature-analyst/${ENVIRONMENT}/cors-origin" \
  "${CORS_ORIGIN}" \
  "String" \
  "CORS origin for frontend application"

# Optional parameters
echo ""
echo -e "${YELLOW}Setting up optional parameters...${NC}"
echo ""

# 4. MongoDB URL (if needed for legacy data)
echo "4. MongoDB URL (optional, for legacy data)"
read -p "Enter MongoDB URL (or press Enter to skip): " MONGODB_URL
if [ -n "$MONGODB_URL" ]; then
  create_parameter \
    "/feature-analyst/${ENVIRONMENT}/mongodb-url" \
    "${MONGODB_URL}" \
    "SecureString" \
    "MongoDB connection string for legacy data"
fi

# 5. Node Environment
echo ""
create_parameter \
  "/feature-analyst/${ENVIRONMENT}/node-env" \
  "${ENVIRONMENT}" \
  "String" \
  "Node.js environment setting"

# Summary
echo ""
echo -e "${GREEN}✅ SSM Parameter Store setup completed!${NC}"
echo ""
echo "Parameters created in region: ${AWS_REGION}"
echo "Environment: ${ENVIRONMENT}"
echo ""
echo "To view parameters:"
echo "  aws ssm get-parameters-by-path --path /feature-analyst/${ENVIRONMENT} --region ${AWS_REGION}"
echo ""
echo "To retrieve a specific parameter:"
echo "  aws ssm get-parameter --name /feature-analyst/${ENVIRONMENT}/database-url --with-decryption --region ${AWS_REGION}"
echo ""
