interface EnvironmentVariables {
  REACT_APP_BACKEND_URL: string;
  REACT_APP_DEMO_MODE: boolean;
}

export const ENVIRONMENT: EnvironmentVariables = {
  REACT_APP_BACKEND_URL: getEnvAsStringOrThrow<EnvironmentVariables>(
    'REACT_APP_BACKEND_URL',
  ),
  REACT_APP_DEMO_MODE:
    getEnvAsString<EnvironmentVariables>(
      'REACT_APP_DEMO_MODE',
    )?.toLowerCase() === 'true',
};

/**
 * Get the environment variable with the key specified in `name` as a string.
 * This function will return `undefined` if this variable cannot be found.
 */
function getEnvAsString<T>(name: keyof T): string | undefined {
  return process.env[name];
}

/**
 * Get the environment variable with the key specified in `name` as a string.
 * This function will throw an error if this variable cannot be found.
 */
function getEnvAsStringOrThrow<T>(name: string & keyof T): string {
  const variable = getEnvAsString<T>(name);

  if (variable === undefined) {
    throw Error(`Unable to get the environment variable "${name}".`);
  }

  return variable;
}
