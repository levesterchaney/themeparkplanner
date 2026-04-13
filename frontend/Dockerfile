FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install libc6-compat for alpine compatibility
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Set npm timeout and install dependencies
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

# Copy source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
