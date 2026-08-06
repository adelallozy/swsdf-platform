# Reusable static server for SWSDF Platform.
#
# This image intentionally does not contain the application bundle. Build the
# Vite bundle outside Docker with `npm ci && npm run build`, then mount dist/
# read-only at /usr/share/nginx/html/app through docker-compose.yml.
FROM nginx:1.27-alpine

ARG IMAGE_VERSION=development
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="SWSDF Platform Static Server" \
      org.opencontainers.image.description="Reusable nginx runtime for the SWSDF Platform frontend" \
      org.opencontainers.image.version="${IMAGE_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}"

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
