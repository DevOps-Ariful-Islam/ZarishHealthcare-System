# Multi-stage Dockerfile for ZarishAccess - Identity and Access Management System
# Optimized for humanitarian healthcare deployments with enhanced security

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules and security libraries
RUN apk add --no-cache python3 make g++ openssl-dev

# Copy package files
COPY ./services/zarish-access/package*.json ./
COPY ./packages/shared-types ./packages/shared-types

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY ./services/zarish-access/src ./src
COPY ./services/zarish-access/tsconfig.json ./

# Build TypeScript code
RUN yarn build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S zarish && \
    adduser -S zarish -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies and security tools
RUN apk add --no-cache \
    dumb-init \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder --chown=zarish:zarish /app/dist ./dist
COPY --from=builder --chown=zarish:zarish /app/node_modules ./node_modules
COPY --from=builder --chown=zarish:zarish /app/package*.json ./

# Create directories for security operations
RUN mkdir -p logs certificates temp && \
    chown -R zarish:zarish logs certificates temp

# Set security-focused file permissions
RUN chmod 700 logs certificates temp

# Switch to non-root user
USER zarish

# Expose port
EXPOSE 3005

# Health check with enhanced security validation
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Security and compliance metadata
LABEL maintainer="ZarishSphere Team" \
      service="zarish-access" \
      version="1.0.0" \
      description="Identity and Access Management System for humanitarian healthcare" \
      humanitarian-optimized="true" \
      security-hardened="true" \
      compliance="HIPAA,GDPR,humanitarian-standards" \
      auth-methods="MFA,SAML,OAuth,LDAP"
