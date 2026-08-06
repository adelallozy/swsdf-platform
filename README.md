# SWSDF Platform

Private Vue application served publicly under `https://swsdf.sa/app/`.

## Development

```bash
npm ci
npm run dev
```

## Production Bundle

Vite loads `.env.production` automatically when creating the production bundle:

```bash
npm ci
npm run build
```

The deployable static files are written to `dist/`.

## Static Server Image

The Docker image contains only nginx and `nginx.conf`. It does not contain
application files and only needs rebuilding when nginx or its configuration
changes:

```bash
docker compose build
```

Compose mounts the externally built `dist/` directory read-only:

```bash
docker compose up -d
docker compose ps
```

Defaults:

- Image: `swsdf-platform-nginx:1.0.0`
- Host endpoint: `127.0.0.1:8911`
- Container endpoint: `8080`
- Bundle path: `./dist`

Override values when necessary:

```bash
SWSDF_PLATFORM_DIST_PATH=/opt/swsdf-platform/releases/2026.07.13 \
SWSDF_PLATFORM_PORT=8911 \
docker compose up -d
```

The host nginx reverse proxy must preserve the `/app/` request path when
proxying to `http://127.0.0.1:8911`.

Deployment documentation:

- [Production Deployment Guide](docs/guides/production-deployment.md) covers
  the complete local-build, rsync, Docker, nginx, Cloudflare, verification, and
  rollback workflow.
- [Private Docker Hub Image Guide](docs/guides/private-docker-hub-image.md)
  covers creating the private repository and publishing the reusable nginx
  image.
