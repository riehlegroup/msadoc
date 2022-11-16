# Deployment

## Local Machine

- See [Development Setup](../README) in the main README.
- Server and frontend run on different ports on the host machine.

## Docker Compose (remote)

Use this with the published Docker images instead of building from scratch.

- Copy the `/deployment/docker/docker-compose.yml` [file](./docker/docker-compose.yml) to your remote machine.
- Configure the environment variables for secrets, credentials, etc.
- Run in the same directory with `docker compose up`.

## Docker Compose (local)

Use this on a cloned repository to start locally.

- Add build context information by flags `-f docker-compose.yml -f docker-compose.local.yml`. Use environment variables to change secrets, credentials, etc.
- From repository root, build via `docker compose -f deployment/docker/docker-compose.yml -f deployment/docker/docker-compose.local.yml build`.
- From repository root, run via `docker compose -f deployment/docker/docker-compose.yml -f deployment/docker/docker-compose.local.yml up`.

## Kubernetes

Upcoming feature!
