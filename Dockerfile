# -------------------------------
# Stage 1: Build
# -------------------------------
FROM node:22-alpine AS builder

# Build tools + canvas dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    cairo-dev \
    pango-dev \
    giflib-dev \
    jpeg-dev \
    libpng-dev \
    musl-dev \
    bash \
    git

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --unsafe-perm

# Copy source
COPY . .

RUN npx prisma generate 

# Build project
RUN npm run build

# -------------------------------
# Stage 2: Production
# -------------------------------
FROM node:22-alpine

# Runtime dependencies for canvas
RUN apk add --no-cache \
    libc6-compat \
    cairo \
    pango \
    giflib \
    jpeg \
    libpng \
    bash

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only what's needed
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

ENV NODE_ENV=production
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
