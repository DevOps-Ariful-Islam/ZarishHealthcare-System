# ZarishCare Service Dockerfile
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++ && \
    ln -sf python3 /usr/bin/python

# Copy package files
COPY ./services/zarish-care/package*.json ./
COPY ./services/zarish-care/tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY ./services/zarish-care/src ./src
COPY ./services/zarish-care/tsconfig.json ./tsconfig.json
COPY ./packages/shared-types ./packages/shared-types
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY ./services/zarish-care/src ./src
COPY ./services/zarish-care/tsconfig.json ./tsconfig.json
COPY ./packages/shared-types ./packages/shared-types
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S zarish -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=base --chown=zarish:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=zarish:nodejs /app/dist ./dist
COPY --from=build --chown=zarish:nodejs /app/package.json ./

# Create necessary directories
RUN mkdir -p /app/logs && chown zarish:nodejs /app/logs

# Switch to non-root user
USER zarish

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]