import { GetServiceDocResponse } from 'msadoc-client';

export type FilterNode = AndNode | OrNode | NotNode | LiteralNode;

export enum FilterNodeType {
  Literal,
  And,
  Or,
  Not,
}

export interface AndNode {
  type: FilterNodeType.And;

  leftChild: FilterNode;
  rightChild: FilterNode;
}
export interface OrNode {
  type: FilterNodeType.Or;

  leftChild: FilterNode;
  rightChild: FilterNode;
}
export interface NotNode {
  type: FilterNodeType.Not;
  child: FilterNode;
}
export interface LiteralNode {
  type: FilterNodeType.Literal;
  key: string;
  value: string;
}

type QueryKeyToServiceDocKeyMap = Record<string, keyof GetServiceDocResponse>;

/**
 * In the filter queries, the allowed keys (slightly) differ from the keys that are present in the Service Docs.
 * For instance, we use "tag" instead of "tags" in the queries to better match the idea that we match a single tag.
 * This Map maps from a filter key to the respective Service Doc key.
 *
 * **IMPORTANT**: The keys must all be lowercase, because in our Semantics, we use ".toLowerCase()".
 */
export const QUERY_KEY_TO_SERVICEDOC_MAP: QueryKeyToServiceDocKeyMap = {
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
};

/**
 * The strings that are allowed to be used as keys in a query.
 */
export const allowedLiteralNodeKeys = Object.keys(QUERY_KEY_TO_SERVICEDOC_MAP);

/**
 * In a query, one can write `%empty%` in order to match empty values.
 * A value is considered empty if:
 * - It is missing in the Service Doc.
 * - It is the empty string.
 * - It is an empty array.
 */
export const SPECIAL_EMPTY_TAG = '%empty%';
