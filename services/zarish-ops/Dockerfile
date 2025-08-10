# Multi-stage Dockerfile for ZarishOps - Operations Coordination System
# Optimized for humanitarian healthcare deployments with GIS and mapping support

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules and GIS libraries
RUN apk add --no-cache python3 make g++ gdal-dev proj-dev geos-dev

# Copy package files
COPY ./services/zarish-ops/package*.json ./
COPY ./packages/shared-types ./packages/shared-types

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY ./services/zarish-ops/src ./src
COPY ./services/zarish-ops/tsconfig.json ./

# Build TypeScript code
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S zarish && \
    adduser -S zarish -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies including GIS libraries
RUN apk add --no-cache \
    dumb-init \
    curl \
    gdal \
    proj \
    geos \
    && rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder --chown=zarish:zarish /app/dist ./dist
COPY --from=builder --chown=zarish:zarish /app/node_modules ./node_modules
COPY --from=builder --chown=zarish:zarish /app/package*.json ./

# Create logs and uploads directories
RUN mkdir -p logs uploads && chown -R zarish:zarish logs uploads

# Switch to non-root user
USER zarish

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Metadata
LABEL maintainer="ZarishSphere Team" \
      service="zarish-ops" \
      version="1.0.0" \
      description="Operations Coordination System for humanitarian healthcare" \
      humanitarian-optimized="true" \
      gis-enabled="true"