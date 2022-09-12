# MSAdoc Format Specification

The presented format is currently under development and might change over time.

## Base Data

### `name` (string) **[mandatory]**

The name of the microservice. The `name` is used as key to identify and reference services.
#### Example
```json
{
    "name": "PipelineService",
}
```
#### Best Practices
* Use a consistent naming scheme across all microservices.
* Don't use spaces - otherwise API requests filtering by name might not work.


### `tags` (string[])

A list of tags for the microservice. The `tag` is used as key to filter services.
#### Example
```json
{
    "name": "PipelineService",
    "tags": ["pipeline", "backend"],
}
```
#### Best Practices
* Use a consistent tagging scheme across all microservices.
* Don't use spaces - otherwise API requests filtering by name might not work.


### `repository` (string)

The link to the microservice's repository.

#### Example
```json
{
    "name": "PipelineService",
    "repository": "https://github.com/jvalue/ods"
}
```

#### Best Practices
* If you use a mono-repo approach you might want to link to the directory of the microservice instead.



### `taskBoard` (string)

The link to the microservice's task board.

#### Example
```json
{
    "name": "PipelineService",
    "taskBoard": "https://github.com/jvalue/ods/projects/1"
}
```

#### Best Practices
* If you utilize a microservice-overarching task board you might want to link to a filtered view specific to the microservice.


## Dependencies

### `providedAPIs` (string[])

The APIs that the microservice provides. The `consumedAPI` identifier of other microservices have to match with the here chosen `providerAPI` in order to link them. A microservice can provide multiple APIs allowing to document more fine-granularly.

The chosen formatting as string is deliberatively chosen to allow documenting multiple communication protocols.

#### Example
```json
{
    "name": "PipelineService",
    "providedAPIs": ["/pipelines", "/pipeline-executions"]
}
```
#### Best Practices
* Use this attribute to document synchronous API dependencies. For events use the attribute `producedEvents`.
* Use a consistent naming scheme for APIs across all microservices.
* Consider if you can uniquely identify an API via its route, e.g. `/pipelines` to add more expressiveness to the documentation. Otherwise you can use custom names as e.g. `PipelineApi`.
* Don't use spaces - otherwise API requests filtering by name might not work.


### `consumedAPIs` (string[])

The APIs that the microservice consumes. The `consumedAPI` identifier has to match a `providerAPI` identifier in another microservice`s `msadoc.json` in order to link them.

#### Example
```json
{
    "name": "PipelineService",
    "consumedAPIs": ["/datasources"]
}
```
#### Best Practices
* Use this attribute to document synchronous API dependencies. For events use the attribute `consumedEvents`.


### `producedEvents` (string[])

The events that the microservice produces. The `consumedEvents` identifier of other microservices have to match with the here chosen `producedEvent` in order to link them. A microservice can provide multiple events allowing to document more fine-granularly.

The chosen formatting as string is deliberatively chosen to allow documenting multiple communication protocols.

#### Example
```json
{
    "name": "PipelineService",
    "producedEvents": [
        "datasources.config.created", 
        "datasources.config.deleted", 
        "datasources.execution.success", 
        "datasources.execution.failure"
    ]
}
```
#### Best Practices
* Use this attribute to document asynchronous event dependencies. For synchronous APIs like HTTP or RPC use the attribute `providedAPIs`.
* Use a consistent naming scheme for events across all microservices.
* Consider if you can uniquely identify an event via its routing key, e.g. `datasources.config.created` to add more expressiveness to the documentation. Otherwise you can use custom names as e.g. `DatasourceConfigCreatedEvent`.
* Don't use spaces - otherwise API requests filtering by name might not work.


### `consumedEvents` (string[])

The events that the microservice consumes. The `consumedEvents` identifier has to match a `producedEvents` identifier in another microservice`s `msadoc.json` in order to link them.

#### Example
```json
{
    "name": "PipelineService",
    "consumedEvents": ["datasources.execution.success"]
}
```
#### Best Practices
* Use this attribute to document asynchronous event dependencies. For synchronous APIs like HTTP or RPC use the attribute `consumedAPIs`.


## Documentation Links


### `developmentDocumentation` (string)

The link to the development documentation.

#### Example
```json
{
    "name": "PipelineService",
    "developmentDocumentation": "https://github.com/jvalue/ods/blob/main/pipeline/README.md"
}
```

#### Best Practices
* Maintain a markdown file in your microservice repository that you can link here.


### `deploymentDocumentation` (string)

The link to the deployment documentation.

#### Example
```json
{
    "name": "PipelineService",
    "deploymentDocumentation": "https://github.com/jvalue/ods"
}
```

#### Best Practices
* Maintain a markdown file in your microservice repository or in the deployment repository that you can link here.


### `apiDocumentation` (string)

The link to the API documentation.

#### Example
```json
{
    "name": "PipelineService",
    "apiDocumentation": "https://github.com/jvalue/ods/tree/main/pipeline#api"
}
```

#### Best Practices
* Maintain a markdown file in your microservice repository or you can link here.
* Alternatively, use a documentation tool as [OpenAPI](https://support.smartbear.com/swaggerhub/docs/tutorials/openapi-3-tutorial.html) or [AsyncAPI](https://www.asyncapi.com/blog/understanding-asyncapis) to document your APIs and link to the running instance here.


## Responsibilities


### `responsibleTeam` (string)

The identifyier of the responsible team. Make sure all microservices goverend by the same team use the same identifier in order to link them.

#### Example
```json
{
    "name": "PipelineService",
    "responsibleTeam": "PipelineTeam"
}
```

#### Best Practices
* If you have shared responsibilities for certain microservices, you might consider introducing a `SharedOwnership` team.

### `responsibles` (string[])

The email addresses or names of the mainly responsible people that should serve as contact persons. Make sure all microservices goverend by the same responsible use the same identifier in order to link them.

#### Example
```json
{
    "name": "PipelineService",
    "responsibles": [ 
        "john.doe@jvalue.com", 
        "jane.doe@jvalue.com" 
    ]
}
```

#### Best Practices
* Using email addresses makes getting in touch easier than names.
