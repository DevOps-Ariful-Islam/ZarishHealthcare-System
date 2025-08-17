# Mobile App Dockerfile (React Native Web)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the web version of the mobile app
RUN yarn build:web

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:web"]
