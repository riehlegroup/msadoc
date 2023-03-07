interface EnvironmentVariables {
  MSADOC_API_KEY: string | undefined;
}

export const ENVIRONMENT: EnvironmentVariables = {
  MSADOC_API_KEY: getEnvAsString<EnvironmentVariables>('MSADOC_API_KEY'),
};

/**
 * Get the environment variable with the key specified in `name` as a string.
 * This function will return `undefined` if this variable cannot be found.
 *
 * Example usage:
 *
 * ``` ts
 * interface MyEnvironmentVariables {
 *   foo: string | undefined;
 * }
 *
 * const theEnvironment: MyEnvironmentVariables = {
 *   foo: getEnvAsString<MyEnvironmentVariables>('foo'),
 * }
 * ```
 */
export function getEnvAsString<T>(name: keyof T): string | undefined {
  return process.env[name];
}
