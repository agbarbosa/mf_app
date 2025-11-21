# Multi-stage Dockerfile for Next.js application
# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g npm@latest
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm install 2>&1 | tee /tmp/npm-install.log && \
    npm cache clean --force

# Extract and save warnings from npm install
RUN grep -iE "warn|deprecated" /tmp/npm-install.log > /app/npm-warnings.log || echo "No npm warnings found" > /app/npm-warnings.log && \
    echo "=== NPM Install Warnings ===" && cat /app/npm-warnings.log

# Generate Prisma client (use local version from node_modules)
RUN ./node_modules/.bin/prisma generate 2>&1 | tee /tmp/prisma.log

# Extract and save Prisma warnings
RUN grep -iE "warn|error" /tmp/prisma.log > /app/build-warnings.log || echo "No Prisma warnings found" > /app/build-warnings.log

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g npm@latest
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/npm-warnings.log ./npm-warnings.log
COPY --from=deps /app/build-warnings.log ./build-warnings.log
COPY . .

# Set environment variable for build
ENV NEXT_TELEMETRY_DISABLED 1

# Build application and capture output
RUN npm run build 2>&1 | tee /tmp/build.log

# Extract and save build warnings
RUN grep -iE "warn|warning|deprecated" /tmp/build.log >> /app/build-warnings.log || echo "No build warnings found" >> /app/build-warnings.log && \
    echo "=== Build Warnings ===" && cat /app/build-warnings.log

# Stage 3: Runner (Production)
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g npm@latest
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy build logs for inspection
COPY --from=builder /app/npm-warnings.log ./logs/npm-warnings.log
COPY --from=builder /app/build-warnings.log ./logs/build-warnings.log

# Create consolidated build log
RUN mkdir -p /app/logs && \
    echo "=== Docker Build Log Summary ===" > /app/logs/build-summary.log && \
    echo "Build Date: $(date)" >> /app/logs/build-summary.log && \
    echo "" >> /app/logs/build-summary.log && \
    cat /app/logs/npm-warnings.log >> /app/logs/build-summary.log && \
    echo "" >> /app/logs/build-summary.log && \
    cat /app/logs/build-warnings.log >> /app/logs/build-summary.log

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
