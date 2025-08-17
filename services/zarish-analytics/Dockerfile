# Multi-stage Dockerfile for ZarishAnalytix - Analytics and Intelligence System
# Optimized for humanitarian healthcare deployments with ML/AI capabilities

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules and ML libraries
RUN apk add --no-cache python3 make g++ py3-pip

# Install Python dependencies for ML support
RUN pip3 install --no-cache-dir numpy pandas scikit-learn tensorflow-lite --break-system-packages

# Copy package files
COPY ./services/zarish-analytics/package*.json ./
COPY ./packages/shared-types ./packages/shared-types

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY ./services/zarish-analytics/src ./src
COPY ./services/zarish-analytics/tsconfig.json ./

# Build TypeScript code
RUN yarn build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S zarish && \
    adduser -S zarish -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies including Python and ML libraries
RUN apk add --no-cache \
    dumb-init \
    curl \
    python3 \
    py3-pip \
    && rm -rf /var/cache/apk/*

# Install Python runtime dependencies
RUN pip3 install --no-cache-dir numpy pandas scikit-learn tensorflow-lite --break-system-packages

# Copy built application from builder stage
COPY --from=builder --chown=zarish:zarish /app/dist ./dist
COPY --from=builder --chown=zarish:zarish /app/node_modules ./node_modules
COPY --from=builder --chown=zarish:zarish /app/package*.json ./

# Create directories for analytics processing
RUN mkdir -p logs uploads reports models temp && \
    chown -R zarish:zarish logs uploads reports models temp

# Switch to non-root user
USER zarish

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Metadata
LABEL maintainer="ZarishSphere Team" \
      service="zarish-analytics" \
      version="1.0.0" \
      description="Analytics and Intelligence System for humanitarian healthcare" \
      humanitarian-optimized="true" \
      ml-enabled="true" \
      ai-ready="true"
