
# Use Node.js 24 Alpine for a lightweight production image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create uploads directory if it does not exist
RUN mkdir -p public/uploads && chown -R node:node /app

# Run as non-root user
USER node

# Backend port
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start backend
CMD ["npm", "start"]
