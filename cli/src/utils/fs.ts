import * as fs from 'fs';

import { Result } from '../models/result';

/**
 * A type-safe way to read file contents.
 */
export function readFile(
  filePath: string,
): Promise<Result<string, NodeJS.ErrnoException>> {
  const result = new Promise<Result<string, NodeJS.ErrnoException>>(
    (resolve) => {
      fs.readFile(filePath, (error, data) => {
        if (error) {
          resolve({
            success: false,
            error: error,
          });
          return;
        }

        resolve({
          success: true,
          data: data.toString(),
        });
      });
    },
  );

  return result;
}
