FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --os=linux --cpu=x64 --include=optional --ignore-scripts --no-audit --no-fund
RUN npx nuxt prepare

COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nitro

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder --chown=nitro:nodejs /app/.output ./.output
COPY --from=builder --chown=nitro:nodejs /app/package.json ./package.json

USER nitro

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
