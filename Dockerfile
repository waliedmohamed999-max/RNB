# Root-level Dockerfile for the `frontend` (Next.js) app, meant for platforms
# (e.g. Render) that build from the repository root without a configurable
# "Root Directory" / build-context setting. It is a straight copy of
# frontend/Dockerfile with paths adjusted for a repo-root build context.
#
# frontend/Dockerfile remains the canonical version for local
# `docker build`/`docker compose` runs from inside frontend/ — keep both in
# sync if you change one.

FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they must be supplied as Docker build arguments (Render: service Settings ->
# "Build Arguments") rather than only as runtime environment variables -
# setting them after the image is built has no effect on the already-built
# client bundle. Safe defaults are used if left unset.
ARG NEXT_PUBLIC_LEGACY_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_LEGACY_BASE_URL=$NEXT_PUBLIC_LEGACY_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node_modules/.bin/next", "start"]
