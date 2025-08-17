# Multi-stage Dockerfile for ZarishSync - Offline Synchronization Engine
# Optimized for humanitarian healthcare deployments with advanced sync capabilities

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules and sync libraries
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY ./services/zarish-sync/package*.json ./
COPY ./packages/shared-types ./packages/shared-types

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY ./services/zarish-sync/src ./src
COPY ./services/zarish-sync/tsconfig.json ./

# Build TypeScript code
RUN yarn build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S zarish && \
    adduser -S zarish -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies and sync utilities
RUN apk add --no-cache \
    dumb-init \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder --chown=zarish:zarish /app/dist ./dist
COPY --from=builder --chown=zarish:zarish /app/node_modules ./node_modules
COPY --from=builder --chown=zarish:zarish /app/package*.json ./

# Create directories for sync operations
RUN mkdir -p logs sync-data temp offline-queue conflicts && \
    chown -R zarish:zarish logs sync-data temp offline-queue conflicts

# Set optimal file permissions for sync operations
RUN chmod 755 sync-data offline-queue conflicts && \
    chmod 700 logs temp

# Switch to non-root user
USER zarish

# Expose port
EXPOSE 3006

# Health check with sync-specific validation
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3006/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Metadata optimized for sync operations
LABEL maintainer="ZarishSphere Team" \
      service="zarish-sync" \
      version="1.0.0" \
      description="Offline Synchronization Engine for humanitarian healthcare" \
      humanitarian-optimized="true" \
      offline-capable="true" \
      sync-engine="advanced" \
      conflict-resolution="intelligent" \
      bandwidth-optimized="true"
