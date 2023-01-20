/*
  All routes defined here are available both in a "relative" and an "absolute" version.
  The "relative" routes are basically only used when registering them to the router.
  The "absolute" routes are the ones that are used in all other cases - navigating to a page, reading router parameters, and more.
  Thus, most of the time, you need to use the `*_ABS` routes.

  Important: All routes are defined with the "as const" keyword. This makes type inference possible.
*/

// These are the only routes that don't have a "relative" and "absolute" variant, because both variants would be the same.
export const APP_ROUTES = {
  login: '/login',
  main: '/main',
} as const;

export const MAIN_PAGE_ROUTES_REL = {
  graph: '/graph',
  serviceDocsExplorer: '/service-docs-explorer',
  apiKeys: '/api-keys',
} as const;
export const MAIN_PAGE_ROUTES_ABS = buildAbsoluteRoutes(
  MAIN_PAGE_ROUTES_REL,
  APP_ROUTES.main,
);

export const SERVICE_DOCS_EXPLORER_ROUTES_REL = {
  root: '/root',
  group: '/group/:group',
  service: '/service/:service',
} as const;
export const SERVICE_DOCS_EXPLORER_ROUTES_ABS = buildAbsoluteRoutes(
  SERVICE_DOCS_EXPLORER_ROUTES_REL,
  MAIN_PAGE_ROUTES_ABS.serviceDocsExplorer,
);

/**
 * A helper function that converts a relative route object to an absolute one.
 * Technically, all it does is to build a new object where all values are prefixed with the prefix provided as second parameter. The return type is properly inferred (i.e. it has the actual string literal types instead of just being typed as "string"). This makes it easier and more type-safe to work with the router.
 *
 * Example:
 * ```
 * const myRelativeRoutes = {
 *  route1: '/foo',
 *  route2: '/bar',
 * } as const;
 *
 * buildAbsoluteRoutes(myRelativeRoutes, '/example');
 * // --> { route1: '/example/foo', route2: '/example/bar', };
 * // Note that the TS type is also properly inferred.
 * ```
 */
function buildAbsoluteRoutes<
  TRelRecord extends Record<string, string>,
  TPrefix extends string,
>(relRecord: TRelRecord, prefix: TPrefix): Absolute<TRelRecord, TPrefix> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(relRecord)) {
    result[key] = prefix + value;
  }

  return result as Absolute<TRelRecord, TPrefix>;
}
type Absolute<TRelRecord, TPrefix extends string> = TRelRecord extends Record<
  string,
  string
>
  ? {
      [Key in keyof TRelRecord]: `${TPrefix}${TRelRecord[Key]}`;
    }
  : never;
