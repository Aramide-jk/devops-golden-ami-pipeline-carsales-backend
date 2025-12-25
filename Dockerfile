# ==========================
# Stage 1: Build Stage
# ==========================
FROM public.ecr.aws/docker/library/node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install build dependencies (all, including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build project
RUN npm run build

# ==========================
# Stage 2: Production Stage
# ==========================
FROM public.ecr.aws/docker/library/node:20-alpine AS production

WORKDIR /app

# Install only production dependencies with caching for faster rebuilds
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled files from build stage
COPY --from=build /app/dist ./dist

# Set environment
ENV NODE_ENV=production
EXPOSE 8000

# Run the app
CMD ["node", "dist/server.js"]
