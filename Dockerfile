# ==========================
# Stage 1: Build
# ==========================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build


# ==========================
# Stage 2: Runtime
# ==========================
FROM node:20-alpine AS runtime

WORKDIR /app

# Set production env early
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts only
COPY --from=build /app/dist ./dist

# Security hardening (non-root user)
USER node

EXPOSE 8000

CMD ["node", "dist/server.js"]
