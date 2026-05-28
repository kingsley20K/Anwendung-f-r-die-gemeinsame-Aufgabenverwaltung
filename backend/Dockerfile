# ── Stage 1 : Builder ──────────────────────────────────────────────────────
# Compile TypeScript — this intermediate image is NOT included in the final image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first so npm ci layer is cached independently of source changes
COPY package*.json ./
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ── Stage 2 : Production ───────────────────────────────────────────────────
FROM node:20-alpine AS production

# dumb-init handles Unix signals (SIGTERM) correctly — plain node as PID 1 does not
RUN apk add --no-cache dumb-init

WORKDIR /app

# Non-root user — limits blast radius if the process is compromised
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies, then clean the npm cache
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Pull compiled output from the builder stage
COPY --from=builder /app/dist ./dist

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
