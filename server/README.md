# msadoc server

Backend service to collect and manage `msadoc` metadata of microservices.

## Getting Started

### Prerequesites

```bash
# Install dependencies
$ npm install
```

```bash
# Start postgres db
$ docker compose -f ../deployment/dev/docker-compose.yaml up
```

```bash
# Setup environment
$ cp .env.dev.local .env
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The application is available on `localhost:3000`. Swagger UI serves the API documentation on route `/api`.


### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Development

### User Authentication

There are the following authentication mechanisms, each represented by an `AuthGuard` class:
* `JwtAccessAuthGuard` - the classic API ednpoint protection
* `UserPasswordAuthGuard` - only used to get JWT tokens
* `JwtRefreshAuthGuard` - only used to refresh a JWT access token
* `ApiKeyAuthGuard` - only used for endpoints used by CI

**Usage**: Annotate method in controller with e.g. `@UseGuards(JwtAccessAuthGuard)`


### Database Migrations

* Change the `orm` classes you want to change.
* Make sure your `.env` file points to the right database.
* Run `npm run typeorm:generate-migration --name=<MigrationName>` to create a new migration file in `/src/database/migrations`.
* The next `npm run start` will automatically execute all required db migrations.

### Exploring the database

You can access PGAdmin on `localhost:5433`

Login credentials:
- Email: `example@example.com`
- Password: `example`

Database password: `password`
