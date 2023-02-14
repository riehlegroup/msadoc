# Example

This example was inspired by our open data project - the [JValue ODS](https://github.com/jvalue/ods).

## Prerequisites

- Install the [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plugin to your `VSCode` IDE.
- A `msadoc-server` instance is running locally on your machine.

## Usage

1. Got to file `requests.http`.
2. Execute the `login` request to fetch an `access_token` for later requests.
3. Execute any or all of the `create` requests to create the `service-doc` entries on the server.
