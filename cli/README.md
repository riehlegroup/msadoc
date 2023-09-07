# MSAdoc CLI

The MSAdoc CLI allows you to upload Service Docs to a MSAdoc backend. See the [project homepage](https://github.com/riehlegroup/msadoc) to learn more about MSAdoc.

## Installation

> The MSAdoc CLI is primarily meant to be used in CI environments, such as GitHub Actions. However, you can also use it locally.

To install the CLI, run

```
npm install -g msadoc-cli@latest
```

To update the package, simply rerun the installation command.

## Usage

First, create a new API Key using the MSAdoc frontend. Then, make this API Key available as an environment variable called `MSADOC_API_KEY`.

To upload a Service Doc, run the following command:

```
msadoc upload ./example/sample-service.msadoc.json --server=https://example.com
```

Replace `./example/sample-service.msadoc.json` with the path you the Service Doc you would like to upload, and replace `https://example.com` with the URL to your MSAdoc backend.

For testing purposes, you can also directly provide an API Key using the `--api-key` option:

```
msadoc upload ./example/sample-service.msadoc.json --server=https://example.com --api-key=<your-api-key>
```

> Only use the `--api-key` argument for testing purposes since it might make the API Key available in the shell history and/or become accessible by other processes.

### GitHub Actions

It is recommended to automate the upload of Service Docs using a CI environment. In the following, you can find a sample GitHub Actions configuration that automates the upload process.

> Make sure to provide an API Key as a Repository Secret called `MSADOC_API_KEY`. On GitHub, you can set a Repository Secret under `Settings --> Secrets and variables --> Actions`.

```yml
name: Main Workflow

on: [push, pull_request, workflow_dispatch]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install the MSAdoc CLI
        run: npm install -g msadoc-cli@latest

      - name: Upload the Service Doc
        run: msadoc upload ./example/sample-service.msadoc.json --server=https://example.com
        env:
          MSADOC_API_KEY: ${{ secrets.MSADOC_API_KEY }}
```

## Development

In the following, you can find a few tips regarding the development of the CLI.

> Please note that all of the following commands shall be executed from the **root** of the project, not from the CLI folder.

When developing, you probably want to be able to execute the CLI locally on your machine. First, you need to compile the CLI. To do so, run

```
npm run build -w=cli
```

Now, there are two ways to run the compiled program.

1. Directly run the JS file
2. Pack the CLI

### Option 1

The first, and quickest, option is to directly run the generated JS file:

```
node ./cli/dist/cli.js
```

You can also pass arguments to it:

```
node ./cli/dist/cli.js upload ./example/load.service.msadoc.json
```

This is particularly useful if you want to quickly try out e.g. a new feature you are currently developing.

### Option 2

After finishing a particular change, it is recommended to test how the actual CLI will work once the user installs it from npm. For this, we want to install the CLI locally in a similar way as you will install it from npm.

First, we pack the CLI:

```
npm pack -w=cli
```

This will generate a file like `msadoc-cli-0.0.1.tgz` in the root of the project (with `0.0.1` being the current version number of the CLI).

Now, uninstall any already existing package (just to be sure):

```
npm uninstall -g msadoc-cli
```

And finally, install our CLI:

```
npm install -g ./msadoc-cli-0.0.1.tgz
```

(Make sure to replace `0.0.1` with the current version number.)

Now, you can run the CLI as if it was installed directly from npm.

One interesting side effect of this procedure: When to unpack the Tar file, you can see which files are actually part of the package. This is particularly useful to check whether you maybe added unnecessary files to the package, or whether something is missing.
