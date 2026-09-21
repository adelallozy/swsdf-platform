# Private Docker Hub Image Guide

This guide builds, publishes, and deploys the reusable SWSDF Platform nginx
image through a private Docker Hub repository.

The image contains only nginx and `nginx.conf`. It does not contain `dist/`.
Application bundles are built and deployed separately.

For the complete bundle synchronization, host nginx, Cloudflare, verification,
and rollback workflow, see [Production Deployment Guide](./production-deployment.md).

## 1. Create The Private Repository

1. Sign in at [Docker Hub](https://hub.docker.com/).
2. Select **Create repository**.
3. Set the repository name to `swsdf-platform-nginx`.
4. Set visibility to **Private**.
5. Create the repository.

The resulting image name is:

```text
<dockerhub-username>/swsdf-platform-nginx
```

## 2. Create Access Tokens

In Docker Hub, open **Account settings > Personal access tokens**.

- Create a read/write token for the trusted build machine.
- Create a separate read-only token for the production server.
- Do not use the Docker Hub account password in scripts.
- Do not commit either token to this repository or an environment file.

## 3. Choose An Image Version

The nginx image is versioned independently from application bundles. Increase
its version only when the nginx base image, Dockerfile, or `nginx.conf` changes.

Example:

```bash
export DOCKERHUB_USERNAME="your-username"
export IMAGE_VERSION="1.0.0"
```

Do not overwrite an existing version tag. Immutable version tags make rollback
and audit reliable.

## 4. Build The Nginx Image

Run from the SWSDF Platform project root:

```bash
cd /path/to/swsdf-platform

export DOCKERHUB_USERNAME="your-username"
export IMAGE_VERSION="1.0.0"

VCS_REF=$(git rev-parse HEAD)
BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)

docker build \
  --build-arg IMAGE_VERSION="${IMAGE_VERSION}" \
  --build-arg VCS_REF="${VCS_REF}" \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  --tag "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}" \
  .
```

The `.dockerignore` file limits the build context to `Dockerfile` and
`nginx.conf`; application source and `dist/` are not copied into the image.

## 5. Verify The Image

Validate the nginx configuration and inspect the OCI metadata:

```bash
docker run --rm \
  "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}" \
  nginx -t

docker image inspect \
  "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}"
```

For an application smoke test, build `dist/` outside Docker and mount it
read-only:

```bash
npm ci
npm run build

docker run --rm -d \
  --name swsdf-platform-image-test \
  --publish 127.0.0.1:18911:8080 \
  --volume "$(pwd)/dist:/usr/share/nginx/html/app:ro" \
  "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}"

curl --fail http://127.0.0.1:18911/app/
docker rm -f swsdf-platform-image-test
```

## 6. Log In And Push

Interactive login avoids placing the token in shell history:

```bash
docker login --username "${DOCKERHUB_USERNAME}"
```

Enter the read/write access token when prompted, then push the immutable tag:

```bash
docker push \
  "${DOCKERHUB_USERNAME}/swsdf-platform-nginx:${IMAGE_VERSION}"
```

Record the repository digest printed by `docker push`. The digest is the exact
immutable image identity.

## 7. Prepare The Production Server

Install Docker Engine and Docker Compose, then log in with the read-only token:

```bash
docker login --username "your-username"
```

Create the deployment directories:

```bash
mkdir -p /home/www/swsdf-production /home/www/swsdf-platform/dist
```

Copy `deploy/production/compose.yml` to
`/home/www/swsdf-production/compose.yml`, configure
`/home/www/swsdf-production/.env.production`, and deploy the separately built application bundle into
`/home/www/swsdf-platform/dist/`. Follow the ownership, permissions, and rsync
commands in [Production Deployment](./production-deployment.md).

The production server does not need application source, Node.js, npm, the
Dockerfile, or `nginx.conf` because those server files are already in the image.

## 8. Pull And Start On Production

Set the complete image reference in `.env.production`:

```dotenv
SWSDF_PLATFORM_IMAGE=your-username/swsdf-platform-nginx:1.0.0
SWSDF_PLATFORM_DIST_PATH=/home/www/swsdf-platform/dist
```

Then run:

```bash
cd /home/www/swsdf-production
docker compose --env-file .env.production -f compose.yml \
  --profile frontends pull swsdf-platform
docker compose --env-file .env.production -f compose.yml \
  --profile frontends up -d --no-build swsdf-platform
docker compose --env-file .env.production -f compose.yml ps swsdf-platform
```

Verify the local container and public endpoint:

```bash
curl --fail http://127.0.0.1:8911/app/
curl --fail https://swsdf.sa/app/
```

The host nginx reverse proxy must preserve `/app/` when proxying to
`http://127.0.0.1:8911`.

## 9. Update The Nginx Image

Build and push a new immutable version, then update the complete image reference
in `.env.production`:

```dotenv
SWSDF_PLATFORM_IMAGE=your-username/swsdf-platform-nginx:1.0.1
```

```bash
docker compose --env-file .env.production -f compose.yml \
  --profile frontends pull swsdf-platform
docker compose --env-file .env.production -f compose.yml \
  --profile frontends up -d --no-build --force-recreate swsdf-platform
```

Do not rebuild the nginx image for normal frontend changes. Build a new `dist/`
bundle, deploy that bundle, and recreate the container if its mounted release
path changes.

## 10. Roll Back The Nginx Image

Restore the previous known-good image reference and recreate the service:

```dotenv
SWSDF_PLATFORM_IMAGE=your-username/swsdf-platform-nginx:1.0.0
```

```bash
docker compose --env-file .env.production -f compose.yml \
  --profile frontends pull swsdf-platform
docker compose --env-file .env.production -f compose.yml \
  --profile frontends up -d --no-build --force-recreate swsdf-platform
```

Application-bundle rollback is separate: restore the previous versioned `dist/`
directory through `SWSDF_PLATFORM_DIST_PATH` and recreate the service.
