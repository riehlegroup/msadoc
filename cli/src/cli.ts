import { Command } from '@commander-js/extra-typings';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import XMLHttpRequest from 'xhr2';

import { version } from '../package.json';

import { handleUploadCommand } from './commands/upload';
import { ENVIRONMENT } from './env';
import { logErrorMessage } from './utils/log';

/*
  We use the msadoc-client to perform HTTP requests.
  This library internally depends on XMLHttpRequest, which is unfortunately not available in NodeJS.
  (When trying to perform a request to the server, you get "ReferenceError: XMLHttpRequest is not defined".)
  Thus, we need to add a custom library for this.
*/
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.XMLHttpRequest = XMLHttpRequest;

const program = new Command();

program
  .name('msadoc-cli')
  .description('CLI to interact with MSAdoc files (Service Docs)')
  .version(version);

program
  .command('upload')
  .description('Upload a Service Doc to a server.')
  .argument('<file-path>', 'The path to the Service Doc')
  .requiredOption('--server <url>', 'URL of the server')
  .option(
    '--api-key <key>',
    'API Key to be used to authenticate. It is recommended to use the environment variable "MSADOC_API_KEY" instead.',
  )
  .action((filePath, options) => {
    const apiKey = options.apiKey ?? ENVIRONMENT.MSADOC_API_KEY;
    if (apiKey === undefined) {
      logErrorMessage(
        'Missing API Key. Make sure to provide the environment variable "MSADOC_API_KEY". For testing purposes, you can also use the "--api-key" argument.',
      );
      process.exit(1);
    }

    void handleUploadCommand({
      filePath: filePath,
      serverUrl: options.server,
      apiKey: apiKey,
    });
  });

program.parse();
