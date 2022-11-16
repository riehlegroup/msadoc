# Deployment

## Local Machine

See [Development Setup](../README) in the main README.

## Docker Compose

- Use the `/deployment/docker/docker-compose.yml`. Change environment variables to change secrets, credentials, etc.
- Build via `docker compose -f deployment/docker/docker-compose.yml build`.
- Run via `docker compose -f deployment/docker/docker-compose.yml up`

## Kubernetes

Upcoming!
