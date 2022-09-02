# msadoc
Document your microservice architecture - recentralize decentralized documentation!

## Usage

1. Host your `DocHub` instance on your servers.

TODO via Docker & K8s & Helm


2. Add a `msadoc.json` file to your project. Example:
```json
{
  "serviceName": "PaymentService",
  "dependencies": {
    "OrderService": "1.1.0",
  },
  "technicalDocumentation": "https://github.com/osrgroup/msadoc/README.md",
  "apiDocumentation": "https://petstore.swagger.io"
  "responsibleTeam": "Payments",
  "responsibles": "reponsible.developer@mymail.com",
}
```


3. Push the `msadoc.json` file to the `DocHub` instance via your CI system. You can use the following shell script:

```bash
TODO
```


4. Browse all your microservices on your `DocHub` instance.

TODO


## Architecture

* The `DocHub` collects the `msadoc.json` files and provides backend functionality to browse the aggregated information.
* The `UI` connects to the `DocHub` and presents the aggregated documentation to the user. 
* The `CLI` allows pushing the `msadoc.json` file to the `DocHub`.


## License

Copyright 2022 Friedrich-Alexander Universität Erlangen-Nürnberg.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
