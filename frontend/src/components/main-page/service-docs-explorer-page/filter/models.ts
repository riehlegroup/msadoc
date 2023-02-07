// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExpressionNode, ExpressionNodeType } from 'search-expression-parser';

/**
 * Similar to {@link ExpressionNode}, but with some constraints and simplifications.
 */
export type FilterNode =
  | FilterAndNode
  | FilterOrNode
  | FilterNotNode
  | FilterKeyValueNode;

export interface FilterAndNode {
  type: ExpressionNodeType.And;

  leftChild: FilterNode;
  rightChild: FilterNode;
}
export interface FilterOrNode {
  type: ExpressionNodeType.Or;

  leftChild: FilterNode;
  rightChild: FilterNode;
}
export interface FilterNotNode {
  type: ExpressionNodeType.Not;

  child: FilterNode;
}

/**
 * Users can write "extensions.foo:bar" to ask for extension field "foo" with value "bar".
 */
export const EXTENSIONS_KEY_PREFIX = 'extensions.';
export type ExtensionsKey = `${typeof EXTENSIONS_KEY_PREFIX}${string}`;
export function isExtensionsKey(key: string): key is ExtensionsKey {
  if (key.startsWith(EXTENSIONS_KEY_PREFIX)) {
    return true;
  }
  return false;
}

export interface FilterKeyValueNode {
  type: ExpressionNodeType.KeyValue;

  key: AllowedLiteralNodeKey | ExtensionsKey;
  value: string;
}

/**
 * In the filter queries, the allowed keys (slightly) differ from the keys that are present in the Service Docs.
 * For instance, we use "tag" instead of "tags" in the queries to better match the idea that we match a single tag.
 * This Map maps from a filter key to the respective Service Doc key.
 *
 * **IMPORTANT**: The keys must all be lowercase, because we use ".toLowerCase()" when accessing entries in this Map.
 */
/*
  The following can be made more type-safe in TS 4.9 using the "satisfies" operator:
  ```
  type QueryKeyToServiceDocKeyMap = Record<string, keyof GetServiceDocResponse>;
  export const QUERY_KEY_TO_SERVICEDOC_MAP = {...} satisfies QueryKeyToServiceDocKeyMap;
  ```

  Unfortunately, react-scripts 18.2.0 did not support this syntax yet, leading to a compiler error.
*/
export const QUERY_KEY_TO_SERVICEDOC_MAP = {
  name: 'name',
  tag: 'tags',
  group: 'group',
  repository: 'repository',
  taskboard: 'taskBoard',

  providedapi: 'providedAPIs',
  consumedapi: 'consumedAPIs',
  publishedevent: 'publishedEvents',
  subscribedevent: 'subscribedEvents',

  developmentdocumentation: 'developmentDocumentation',
  deploymentdocumentation: 'deploymentDocumentation',
  apidocumentation: 'apiDocumentation',

  responsibleteam: 'responsibleTeam',
  responsible: 'responsibles',
} as const;

type AllowedLiteralNodeKey = keyof typeof QUERY_KEY_TO_SERVICEDOC_MAP;

/**
 * The strings that are allowed to be used as keys in a query.
 */
export const ALLOWED_LITERAL_NODE_KEYS = Object.keys(
  QUERY_KEY_TO_SERVICEDOC_MAP,
) as AllowedLiteralNodeKey[];

export function isAllowedLiteralNodeKey(
  key: string,
): key is AllowedLiteralNodeKey {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  if (ALLOWED_LITERAL_NODE_KEYS.includes(key as any)) {
    return true;
  }
  return false;
}

/**
 * In a query, one can write `%empty%` in order to match empty values.
 * A value is considered empty if:
 * - It is missing in the Service Doc.
 * - It is the empty string.
 * - It is an empty array.
 */
export const SPECIAL_EMPTY_TAG = '%empty%';

export interface FilterParseError {
  errorMessages: string[];
}
