# msadoc server

Backend service to collect and manage `msadoc` metadata of microservices.

## Getting Started

### Prerequisites

At this point, we expect that you have already performed the steps described in the [Main README](../README.md).

### Running the server

There are multiple ways to run the backend, depending on your concrete use-case:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

- The **server application** is available on `localhost:3000`.
- **Swagger** UI serves the API documentation on route `/api`. Password for API sign-in is in your `.env` file.

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

- `JwtAccessAuthGuard` - the classic API endpoint protection
- `UserPasswordAuthGuard` - only used to get JWT tokens
- `JwtRefreshAuthGuard` - only used to refresh a JWT access token
- `ApiKeyAuthGuard` - only used for endpoints used by CI

**Usage**: Annotate method in controller with e.g. `@UseGuards(JwtAccessAuthGuard)`

### Database Migrations

- Change the `orm` classes you want to change.
- Make sure your `.env` file points to the right database.
- Run `npm run typeorm:generate-migration --name=<MigrationName>` to create a new migration file in `/src/database/migrations`.
- The next `npm run start` will automatically execute all required db migrations.

### Exploring the database

You can access PGAdmin on `localhost:5433`

Login credentials:

- Email: `example@example.com`
- Password: `example`

Database password: `password`
