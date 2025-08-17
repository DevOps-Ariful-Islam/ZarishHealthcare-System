# Clinical Dashboard Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY ./apps/clinical-dashboard/package*.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY ./apps/clinical-dashboard/src ./src
COPY ./packages/shared-types ./packages/shared-types

# Build the application
RUN yarn build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
