interface EnvironmentVariables {
  BACKEND_URL: string;

  ROUTER_BASE: string;

  DEMO_MODE: boolean;
}

/*
  Vite uses static string replacement for the environment variables.
  Thus, we cannot do dynamic loading like this:
  ```
  getEnvVariable(name) {
    return import.meta.env[name]
  }
  ```
  See https://vitejs.dev/guide/env-and-mode.html

  To fix this, we define an object that holds all of these values for us.
*/
type RawEnvironment = Record<string, unknown>;
const rawEnvironment = {
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_ROUTER_BASE: import.meta.env.VITE_ROUTER_BASE,
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
} as const satisfies RawEnvironment;

export const ENVIRONMENT: EnvironmentVariables = {
  BACKEND_URL: getEnvAsStringOrThrow('VITE_BACKEND_URL'),

  ROUTER_BASE: getEnvAsString('VITE_ROUTER_BASE') ?? '',

  DEMO_MODE: getEnvAsBoolean('VITE_DEMO_MODE') ?? false,
};

/**
 * Get the environment variable with the key specified in `name` as a string.
 * This function will return `undefined` if this variable cannot be found.
 */
function getEnvAsString(name: keyof typeof rawEnvironment): string | undefined {
  const variable = rawEnvironment[name] as unknown;
  if (typeof variable !== 'string' && typeof variable !== 'undefined') {
    throw Error(
      `Environment variable "${name}" is of type "${typeof variable}", but we expected a string or undefined. This should not happen.`,
    );
  }

  return variable;
}

/**
 * Get the environment variable with the key specified in `name` as a string.
 * This function will throw an error if this variable cannot be found.
 */
function getEnvAsStringOrThrow(name: keyof typeof rawEnvironment): string {
  const variable = getEnvAsString(name);

  if (variable === undefined) {
    throw Error(`Unable to get the environment variable "${name}".`);
  }

  return variable;
}

/**
 * Get the environment variable with the key specified in `name` as a boolean.
 * This function will return `undefined` if this variable cannot be found.
 */
function getEnvAsBoolean(
  name: keyof typeof rawEnvironment,
): boolean | undefined {
  const variable = getEnvAsString(name);

  if (variable === undefined) {
    return undefined;
  }

  if (variable.toLowerCase() === 'true') {
    return true;
  }
  if (variable.toLowerCase() === 'false') {
    return false;
  }

  throw Error(
    `Environment variable "${name}" does not contain a boolean value. The value: "${variable}"`,
  );
}
