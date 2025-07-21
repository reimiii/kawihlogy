# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy and install dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build app
RUN pnpm build && pnpm prune --prod

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Only copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN apk add --no-cache curl

# Define default command (can be overridden)
CMD ["node", "dist/main"]
