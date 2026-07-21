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

# next.config.ts sets output: "standalone" - running the standalone
# server.js (rather than `next start` against the full build) is required
# for routing to resolve correctly; `next start` against a standalone build
# is unsupported and was observed to 404 on several /dashboard routes.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
