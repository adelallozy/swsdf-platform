# ─────────────────────────────────────────────────────────────────────────────
# Distributed (production) image for SWSDF Platform.
#
# Vite base is "/app/" (see vite.config.js), so the emitted bundle in dist/
# references assets as /app/new-front/assets/... and index.html lives at the
# dist/ root. The runtime stage copies dist/ contents under
# /usr/share/nginx/html/app/ so the in-container nginx can serve everything
# under the /app/ prefix that the host reverse proxy already forwards.
#
# Build with an immutable release tag and OCI metadata:
#   docker build \
#     --build-arg APP_VERSION=<release-tag> \
#     --build-arg VCS_REF=<git-commit> \
#     --build-arg BUILD_DATE=<RFC3339-date> \
#     -t swsdf-platform:<release-tag> .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build the Vite production bundle ────────────────────────────────
FROM node:20.19.0 AS build

WORKDIR /app

# Install dependencies first for better layer caching.
# Requires package-lock.json to be in sync with package.json.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the sources and build.
# Vite loads .env then .env.production automatically, baking the VITE_* values
# (VITE_API_BASE_URL, VITE_WEB_BASE_URL, VITE_DEFAULT_LOCALE, ...) into dist/.
COPY . .
RUN npm run build

# ── Stage 2: serve the static bundle with nginx ──────────────────────────────
FROM nginx:1.27-alpine AS runtime

ARG APP_VERSION=development
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="SWSDF Platform" \
      org.opencontainers.image.description="SWSDF private application production frontend" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}"

# Drop the default site config; replace with our SPA config (listens on 8080).
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Place the built bundle under /app so the /app/ location paths line up with
# the Vite base and the host reverse proxy that forwards /app/ unchanged.
COPY --from=build /app/dist/ /usr/share/nginx/html/app/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
