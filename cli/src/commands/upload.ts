import * as path from 'path';

import { Configuration, ServiceDocsApi } from 'msadoc-client';
import { firstValueFrom } from 'rxjs';
import { AjaxConfig } from 'rxjs/ajax';

import { readFile } from '../utils/fs';
import { logErrorMessage, logSuccessMessage } from '../utils/log';

export async function handleUploadCommand(params: {
  filePath: string;
  serverUrl: string;
  apiKey: string;
}): Promise<void> {
  const serviceDoc = await loadServiceDoc(params.filePath);

  const configuration = createConfiguration({
    apiKey: params.apiKey,
    serverUrl: params.serverUrl,
  });

  try {
    await firstValueFrom(
      new ServiceDocsApi(configuration).serviceDocsControllerCreateServiceDoc({
        // We don't check the structure of the JSON document. The server should reject invalid payloads.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        createServiceDocRequest: serviceDoc as any,
      }),
    );
  } catch (error) {
    const status = getErrorStatus(error);

    const errorMessages = ['Failed to upload the Service Doc.'];

    if (status === 401) {
      errorMessages.push('It seems like the API Key is invalid.');
    }

    logErrorMessage(errorMessages.join(' '));

    process.exit(1);
  }

  logSuccessMessage('The Service Doc has been uploaded successfully.');
}

/**
 * Get the Service Doc found at the given file path.
 *
 * If something goes wrong (e.g. the file does not exist), this function will call `process.exit()`.
 */
async function loadServiceDoc(filePath: string): Promise<object> {
  const fullPath = path.join(process.cwd(), filePath);

  const fileReadingResult = await readFile(fullPath);
  if (!fileReadingResult.success) {
    if (fileReadingResult.error.code === 'ENOENT') {
      logErrorMessage('Unable to find the specified Service Doc file.');
    } else {
      logErrorMessage(
        'Something went wrong trying to read the specified Service Doc file',
      );
    }

    process.exit(1);
  }

  let parsedFileContent: object;
  try {
    const parserResult = JSON.parse(fileReadingResult.data) as unknown;
    if (parserResult == null || typeof parserResult !== 'object') {
      throw Error();
    }

    parsedFileContent = parserResult;
  } catch {
    logErrorMessage('The file does not seem to contain valid JSON');

    process.exit(1);
  }

  return parsedFileContent;
}

function createConfiguration(params: {
  apiKey: string;
  serverUrl: string;
}): Configuration {
  return new Configuration({
    basePath: params.serverUrl,

    /*
      The generated client is not capable of adding the "authorization: Bearer <API Key>" header. 
      Thus, we add a custom Middleware to it in order to manually add this header.
    */
    middleware: [
      {
        pre: (requestConfig: AjaxConfig): AjaxConfig => {
          const newRequestConfig = { ...requestConfig };

          const bearer = `Bearer ${params.apiKey}`;
          newRequestConfig.headers = {
            ...newRequestConfig.headers,
            authorization: bearer,
          };

          return newRequestConfig;
        },
      },
    ],
  });
}

/**
 * A helper function to get the "status" field of an error object returned when a http request fails.
 */
function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error == null) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const status = (error as any).status;

  if (typeof status !== 'number') {
    return undefined;
  }
  return status;
}
