#!/bin/bash
# Retrieve SSM parameters for local development
# Creates a .env file in backend directory

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-development}"
OUTPUT_FILE="../backend/.env"

echo -e "${GREEN}Fetching SSM parameters for Feature Analyst V2${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Region: ${AWS_REGION}"
echo ""

# Function to get SSM parameter value
get_parameter() {
  local name=$1
  aws ssm get-parameter \
    --name "${name}" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text \
    --region "${AWS_REGION}" 2>/dev/null || echo ""
}

# Create or clear .env file
cd "$(dirname "$0")"
echo "# Auto-generated from AWS SSM Parameter Store" > "${OUTPUT_FILE}"
echo "# Environment: ${ENVIRONMENT}" >> "${OUTPUT_FILE}"
echo "# Generated: $(date)" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

echo -n "Fetching parameters... "

# Fetch parameters
DATABASE_URL=$(get_parameter "/feature-analyst/${ENVIRONMENT}/database-url")
CENSUS_API_KEY=$(get_parameter "/feature-analyst/${ENVIRONMENT}/census-api-key")
CORS_ORIGIN=$(get_parameter "/feature-analyst/${ENVIRONMENT}/cors-origin")
MONGODB_URL=$(get_parameter "/feature-analyst/${ENVIRONMENT}/mongodb-url")
NODE_ENV=$(get_parameter "/feature-analyst/${ENVIRONMENT}/node-env")

echo -e "${GREEN}DONE${NC}"
echo ""

# Write to .env file
[ -n "$NODE_ENV" ] && echo "NODE_ENV=${NODE_ENV}" >> "${OUTPUT_FILE}"
[ -n "$DATABASE_URL" ] && echo "DATABASE_URL=${DATABASE_URL}" >> "${OUTPUT_FILE}"
[ -n "$MONGODB_URL" ] && echo "MONGODB_URL=${MONGODB_URL}" >> "${OUTPUT_FILE}"
[ -n "$CENSUS_API_KEY" ] && echo "CENSUS_API_KEY=${CENSUS_API_KEY}" >> "${OUTPUT_FILE}"
[ -n "$CORS_ORIGIN" ] && echo "CORS_ORIGIN=${CORS_ORIGIN}" >> "${OUTPUT_FILE}"
echo "PORT=3001" >> "${OUTPUT_FILE}"

echo -e "${GREEN}✅ Environment file created: ${OUTPUT_FILE}${NC}"
echo ""
echo "Parameters retrieved:"
[ -n "$NODE_ENV" ] && echo "  ✓ NODE_ENV"
[ -n "$DATABASE_URL" ] && echo "  ✓ DATABASE_URL"
[ -n "$MONGODB_URL" ] && echo "  ✓ MONGODB_URL"
[ -n "$CENSUS_API_KEY" ] && echo "  ✓ CENSUS_API_KEY"
[ -n "$CORS_ORIGIN" ] && echo "  ✓ CORS_ORIGIN"
echo ""
echo "You can now run the backend with these environment variables:"
echo "  cd backend && yarn dev"
echo ""
