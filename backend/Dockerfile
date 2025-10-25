# Multi-stage Dockerfile for Feature Analyst V2 Backend
# Stage 1: Build TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY tsconfig.json ./

# Build TypeScript
WORKDIR /app/backend
RUN yarn build

# Stage 2: Production runtime
FROM node:22-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built application
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/dist ./shared/dist

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
