# Client Code Generator

This project generates client code from the `MSAdoc server` project using [@openapitools/openapi-generator-cli](https://github.com/OpenAPITools/openapi-generator-cli) under the hood.

## Usage

### TypeScript Code Generation

Edit the environment variables in `docker-compose.yaml`. The checked-in configuration uses `axios` as client library and assumes that the server is running on `localhost:3000`.

```bash
# Start the docker container to generate code
$ docker compose up msadoc-ts-client-generator
```


