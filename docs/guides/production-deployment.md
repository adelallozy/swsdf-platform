# SWSDF Platform Production Deployment Guide

This runbook deploys SWSDF Platform as a static Vue application at
`https://swsdf.sa/app/`.

The deployment has two independent artifacts:

1. `swsdf-platform-nginx` is a reusable private Docker image containing nginx
   and `nginx.conf` only.
2. `dist/` is the application bundle built outside Docker and synchronized to
   the production server.

Normal frontend releases update only the bundle. Rebuild the Docker image only
when `Dockerfile`, `nginx.conf`, or the nginx base image changes.

## 1. Architecture

```text
Browser
  -> Cloudflare
  -> host nginx / aaPanel (TLS, swsdf.sa)
  -> http://127.0.0.1:8911/app/
  -> swsdf-platform-nginx container, port 8080
  -> read-only dist bundle mounted at /usr/share/nginx/html/app
```

The `/app/` prefix is a deployment contract:

- `vite.config.js` uses `base: "/app/"`.
- Vue Router uses `import.meta.env.BASE_URL`.
- Container nginx serves and falls back under `/app/`.
- Host nginx must preserve `/app/` when proxying.

Do not add another `/app` segment to Vue routes.

## 2. Canonical Paths And Names

Local project root:

```text
/home/adelallozy/workspace/swsdf.sa/swsdf-platform
```

Production deployment root:

```text
/home/www/swsdf-platform
```

Recommended production layout:

```text
/home/www/swsdf-platform/
├── .env
├── docker-compose.yml
└── dist/
    ├── index.html
    ├── new-front/
    ├── fonts/
    └── ...
```

Docker defaults:

```text
Image:          <dockerhub-user>/swsdf-platform-nginx:1.0.0
Container:      swsdf-platform
Host endpoint:  127.0.0.1:8911
Container port: 8080
Bundle mount:   /home/www/swsdf-platform/dist
Public URL:     https://swsdf.sa/app/
```

## 3. Prerequisites

Build machine:

- Git
- Node.js 20
- npm
- Docker Engine and Docker Compose when publishing the nginx image
- SSH and rsync

Production server:

- Docker Engine
- Docker Compose plugin
- nginx managed by aaPanel
- rsync
- A deploy account with write access to `/home/www/swsdf-platform`
- Docker Hub read-only token for the private image

The server does not need Node.js, npm, project source, `Dockerfile`, or
`nginx.conf` for normal bundle releases.

## 4. Production Environment Review

Vite reads `.env` and `.env.production` during `npm run build`. Client-side
variables are baked into JavaScript and cannot be changed after the build.

Before each release, confirm at least:

```dotenv
VITE_API_BASE_URL=https://swsdf.sa/api/
VITE_WEB_BASE_URL=https://swsdf.sa/
VITE_DEFAULT_LOCALE=ar
```

Never place secrets in a `VITE_*` variable. Every `VITE_*` value is visible to
browser users.

## 5. One-Time Docker Hub Setup

Create a private Docker Hub repository named:

```text
swsdf-platform-nginx
```

Create two access tokens:

- Read/write token for the trusted image build machine.
- Read-only token for the production server.

See [Private Docker Hub Image Guide](./private-docker-hub-image.md) for the full
image build, verification, push, pull, and image rollback process.

## 6. Build And Publish The Nginx Image

This step is required only for the first deployment or after nginx
infrastructure changes.

From the local project root:

```bash
cd /home/adelallozy/workspace/swsdf.sa/swsdf-platform

export DOCKERHUB_USERNAME="your-dockerhub-username"
export IMAGE_VERSION="1.0.0"

VCS_REF=$(git rev-parse HEAD)
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)

docker build \
  --build-arg IMAGE_VERSION="${IMAGE_VERSION}" \
  --build-arg VCS_REF="${VCS_REF}" \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  --tag "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}" \
  .

docker run --rm \
  "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}" \
  nginx -t

docker login --username "${DOCKERHUB_USERNAME}"
docker push "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}"
```

Enter the read/write access token when prompted. Record the repository digest
printed by `docker push`.

## 7. One-Time Server Preparation

The examples below use `allozy` as the SSH deployment user and `www` as the
shared web group.

On the production server:

```bash
sudo mkdir -p /home/www/swsdf-platform/dist
sudo chmod 750 /home/www
sudo chown -R www:www /home/www/swsdf-platform
sudo find /home/www/swsdf-platform -type d -exec chmod 2775 {} \;
sudo find /home/www/swsdf-platform -type f -exec chmod 664 {} \;
```

The deployment user must belong to the `www` group. Directory mode `2775`
keeps the setgid bit so newly deployed files inherit that group.

Copy the standalone Compose file from the build machine:

```bash
rsync -rz \
  /home/adelallozy/workspace/swsdf.sa/swsdf-platform/docker-compose.yml \
  allozy@185.206.29.97:/home/www/swsdf-platform/docker-compose.yml
```

Create `/home/www/swsdf-platform/.env` on the server:

```dotenv
SWSDF_PLATFORM_NGINX_IMAGE=your-dockerhub-username/swsdf-platform-nginx
SWSDF_PLATFORM_NGINX_TAG=1.0.0
SWSDF_PLATFORM_DIST_PATH=/home/www/swsdf-platform/dist
SWSDF_PLATFORM_PORT=8911
SWSDF_PLATFORM_CONTAINER=swsdf-platform
```

These are deployment settings, not application `VITE_*` settings.

Log in to Docker Hub using the read-only production token:

```bash
docker login --username "your-dockerhub-username"
```

## 8. Build A Frontend Release Locally

Use a committed revision for production releases:

```bash
cd /home/adelallozy/workspace/swsdf.sa/swsdf-platform

git status --short
git rev-parse HEAD

npm ci
npm run build
```

Basic local checks:

```bash
test -f dist/index.html
grep '<title>SWSDF Platform</title>' dist/index.html
```

Optional local container smoke test:

```bash
SWSDF_PLATFORM_CONTAINER=swsdf-platform-release-test \
SWSDF_PLATFORM_PORT=18911 \
docker compose up -d --no-build

curl --fail http://127.0.0.1:18911/app/
curl --fail http://127.0.0.1:18911/app/ar/auth/sign-in

SWSDF_PLATFORM_CONTAINER=swsdf-platform-release-test \
SWSDF_PLATFORM_PORT=18911 \
docker compose down
```

## 9. Synchronize The Bundle To Production

Synchronize the contents of local `dist/`:

```bash
rsync -rz --delete --info=progress2 \
  --no-perms \
  --no-times \
  --omit-dir-times \
  ./dist/ \
  allozy@185.206.29.97:/home/www/swsdf-platform/dist/
```

Run this command from the local project root. The trailing slash after `dist/`
copies its contents. `--delete` intentionally removes stale generated assets
from the remote `dist/`; never point this command at the deployment root.

## 10. Start Or Refresh The Service

On the production server:

```bash
cd /home/www/swsdf-platform
docker compose pull
docker compose up -d --no-build --force-recreate
docker compose ps
```

Normal frontend-only updates to the existing `dist/` mount do not require a
container rebuild. Recreate the service when its image or Compose settings
change.

## 11. Host Nginx Configuration

Add these locations inside the existing `server {}` block for `swsdf.sa`:

```nginx
location = /app {
    return 301 /app/;
}

location ^~ /app/ {
    # No trailing slash: preserve /app/ when proxying.
    proxy_pass http://127.0.0.1:8911;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_read_timeout 300;
    proxy_send_timeout 300;
}
```

Important:

```nginx
# Correct: preserves /app/
proxy_pass http://127.0.0.1:8911;

# Wrong: strips /app/ and causes a redirect loop
proxy_pass http://127.0.0.1:8911/;
```

WebSocket upgrade headers are unnecessary because production serves static
files, not the Vite development server.

Validate and reload host nginx:

```bash
nginx -t
systemctl reload nginx
```

Recommended TLS protocols:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
```

## 12. Cloudflare

The DNS record may remain proxied through Cloudflare. Recommended checks:

- Cloudflare SSL mode is **Full (strict)**.
- `/app/` and HTML remain dynamically validated unless an explicit cache rule
  is introduced.
- Hashed files under `/app/new-front/assets/` can be cached long-term.
- Do not cache authenticated API responses under `/api/`.

The container adds long-lived immutable caching for hashed Vite assets. HTML is
not assigned that immutable policy.

## 13. Post-Deployment Verification

Check the container:

```bash
docker ps --filter name=swsdf-platform
docker exec swsdf-platform nginx -t
docker logs --tail 100 swsdf-platform
```

Expected port mapping:

```text
127.0.0.1:8911->8080/tcp
```

Confirm the mount is read-only:

```bash
docker inspect swsdf-platform \
  --format '{{range .Mounts}}{{.Source}} -> {{.Destination}} read-write={{.RW}}{{end}}'
```

Expected:

```text
/home/www/swsdf-platform/dist -> /usr/share/nginx/html/app read-write=false
```

Test the container directly:

```bash
curl -I http://127.0.0.1:8911/app/
curl -I http://127.0.0.1:8911/app/ar/auth/sign-in
```

Test through host nginx and Cloudflare:

```bash
curl -I https://swsdf.sa/app/
curl -IL --max-redirs 5 https://swsdf.sa/app/
curl -I https://swsdf.sa/app/ar/auth/sign-in
```

All should return `200`. The redirect-chain command must not loop.

Browser checks:

1. Sign in at `https://swsdf.sa/app/ar/auth/sign-in`.
2. Refresh a nested SPA route directly.
3. Confirm generated asset URLs contain exactly one `/app/` prefix.
4. Confirm API calls use `https://swsdf.sa/api/`.
5. Confirm there are no mixed-content or failed asset requests.

## 14. Normal Frontend Update

For normal source changes, do not rebuild or push the nginx image:

1. Commit the intended application changes.
2. Run `npm ci && npm run build` locally.
3. Synchronize `dist/` to `/home/www/swsdf-platform/dist/` with the documented
   rsync command.
4. Run verification checks.

## 15. Bundle Rollback

Check out or rebuild the previous known-good revision locally, then synchronize
its generated `dist/` using the same deployment command:

```bash
npm ci
npm run build
rsync -rz --delete --info=progress2 \
  --no-perms \
  --no-times \
  --omit-dir-times \
  ./dist/ \
  allozy@185.206.29.97:/home/www/swsdf-platform/dist/
curl --fail https://swsdf.sa/app/
```

## 16. Nginx Image Update And Rollback

After publishing a new nginx image, update `.env` on the production server:

```dotenv
SWSDF_PLATFORM_NGINX_TAG=1.0.1
```

Then:

```bash
docker compose pull
docker compose up -d --no-build --force-recreate
```

To roll back, restore the previous tag and run the same commands.

## 17. Permissions

The bundle is writable by the `www` group for deployment and mounted read-only
inside the container:

```bash
chmod 750 /home/www
chmod 2775 /home/www/swsdf-platform
chmod 2775 /home/www/swsdf-platform/dist
chown -R www:www /home/www/swsdf-platform
find /home/www/swsdf-platform -type d -exec chmod 2775 {} \;
find /home/www/swsdf-platform -type f -exec chmod 664 {} \;
```

Avoid world-writable or executable static files (`777`). The bind mount must
still use `:ro` even when host permissions are correct.

## 18. Troubleshooting

### Redirect loop

Symptoms:

```text
Repeated GET / returning 302
```

Cause: host nginx uses a trailing slash in `proxy_pass` and strips `/app/`.

Fix:

```nginx
proxy_pass http://127.0.0.1:8911;
```

### 502 Bad Gateway

Check:

```bash
docker ps --filter name=swsdf-platform
curl -I http://127.0.0.1:8911/app/
docker logs --tail 100 swsdf-platform
```

Confirm the host mapping is `127.0.0.1:8911->8080`, not the reverse.

### `/app/` returns 404

Check the mounted bundle:

```bash
docker exec swsdf-platform ls -la /usr/share/nginx/html/app
```

`index.html` must exist directly in that directory.

### Assets return 404

Inspect `dist/index.html`. Production asset URLs must start with:

```text
/app/new-front/assets/
```

Rebuild with the current `vite.config.js` if the base is incorrect.

### Container uses an old bundle

Check the configured mount and deployed index:

```bash
test -f /home/www/swsdf-platform/dist/index.html
docker inspect swsdf-platform --format '{{range .Mounts}}{{.Source}}{{end}}'
```

### Docker Hub pull denied

Log in again using the production read-only token:

```bash
docker logout
docker login --username "your-dockerhub-username"
docker compose pull
```

### Cloudflare shows stale content

Hashed assets receive new filenames on each changed build. If HTML remains
stale, purge the `/app/` URL from Cloudflare rather than purging all API paths.

## 19. Security Checklist

- Bind the container to `127.0.0.1`, not `0.0.0.0`.
- Mount application files read-only.
- Use separate Docker Hub build and production tokens.
- Keep Docker Hub tokens out of repository files.
- Use immutable nginx image tags.
- Keep the deployed Git revision available so the bundle can be rebuilt for rollback.
- Use TLS 1.2 and TLS 1.3 on host nginx.
- Never put secrets in `VITE_*` variables.
- Do not expose the Docker daemon remotely.
- Review nginx and base-image updates independently from frontend releases.

## 20. Release Checklist

Before deployment:

- [ ] Intended source is committed.
- [ ] `.env.production` URLs are correct.
- [ ] `npm ci` succeeds.
- [ ] `npm run build` succeeds.
- [ ] `dist/index.html` exists and identifies SWSDF Platform.
- [ ] Local `/app/` and nested-route smoke tests pass.

During deployment:

- [ ] `dist/` contents were synchronized to `/home/www/swsdf-platform/dist/`.
- [ ] Docker Compose pulled the configured private nginx image.
- [ ] The container was recreated if its image or Compose settings changed.

After deployment:

- [ ] Container nginx configuration is valid.
- [ ] Mount is read-only.
- [ ] Direct container endpoint returns 200.
- [ ] Public `/app/` returns 200 without a redirect loop.
- [ ] Nested SPA routes return 200.
- [ ] Browser API requests use the production API.
- [ ] The deployed Git revision is recorded for rollback.
