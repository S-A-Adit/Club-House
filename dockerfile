# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create non-root user for security (optional but recommended)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "server.js"]

# Alternatively for npm start:
# CMD ["npm", "start"]