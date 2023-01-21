import escapeStringRegexp from 'escape-string-regexp';
import { ExpressionNodeType } from 'search-expression-parser';

import { ServiceNode } from '../../service-docs-tree';

import {
  FilterAndNode,
  FilterKeyValueNode,
  FilterNode,
  FilterNotNode,
  FilterOrNode,
  QUERY_KEY_TO_SERVICEDOC_MAP,
  SPECIAL_EMPTY_TAG,
} from './models';

export function applyFilter(
  filter: FilterNode,
  serviceDocs: ServiceNode[],
): ServiceNode[] {
  const result: ServiceNode[] = [];

  for (const singleServiceDoc of serviceDocs) {
    if (doesServiceDocMatchFilter(filter, singleServiceDoc)) {
      result.push(singleServiceDoc);
    }
  }

  return result;
}

function doesServiceDocMatchFilter(
  filter: FilterNode,
  serviceDoc: ServiceNode,
): boolean {
  switch (filter.type) {
    case ExpressionNodeType.And:
      return doesMatchAndNode(filter, serviceDoc);
    case ExpressionNodeType.Or:
      return doesMatchOrNode(filter, serviceDoc);
    case ExpressionNodeType.Not:
      return doesMatchNotNode(filter, serviceDoc);
    case ExpressionNodeType.KeyValue:
      return doesMatchKeyValueNode(filter, serviceDoc);
  }
}

function doesMatchAndNode(
  filter: FilterAndNode,
  serviceDoc: ServiceNode,
): boolean {
  if (!doesServiceDocMatchFilter(filter.leftChild, serviceDoc)) {
    return false;
  }
  return doesServiceDocMatchFilter(filter.rightChild, serviceDoc);
}
function doesMatchOrNode(
  filter: FilterOrNode,
  serviceDoc: ServiceNode,
): boolean {
  if (doesServiceDocMatchFilter(filter.leftChild, serviceDoc)) {
    return true;
  }
  return doesServiceDocMatchFilter(filter.rightChild, serviceDoc);
}
function doesMatchNotNode(
  filter: FilterNotNode,
  serviceDoc: ServiceNode,
): boolean {
  return !doesServiceDocMatchFilter(filter.child, serviceDoc);
}

function doesMatchKeyValueNode(
  filter: FilterKeyValueNode,
  serviceDoc: ServiceNode,
): boolean {
  const serviceDocKey = QUERY_KEY_TO_SERVICEDOC_MAP[filter.key];

  // We use the raw Service Doc here, because there are less different data types we need to distinguish compared to the processed ones in the containing Service Doc.
  const serviceDocEntry = serviceDoc.rawData[serviceDocKey];
  return doesEntryMatchFilter(filter, serviceDocEntry);
}
function doesEntryMatchFilter(
  filter: FilterKeyValueNode,
  serviceDocEntry: unknown,
): boolean {
  if (filter.value.toLowerCase() === SPECIAL_EMPTY_TAG) {
    if (serviceDocEntry === undefined) {
      return true;
    }
    if (serviceDocEntry === '') {
      return true;
    }
    if (Array.isArray(serviceDocEntry) && serviceDocEntry.length < 1) {
      return true;
    }
    return false;
  }

  if (typeof serviceDocEntry === 'string') {
    return isStringMatching(serviceDocEntry, filter.value);
  }

  if (isStringArray(serviceDocEntry)) {
    for (const singleEntry of serviceDocEntry) {
      if (isStringMatching(singleEntry, filter.value)) {
        return true;
      }
    }
  }

  return false;
}

function isStringArray(element: unknown): element is string[] {
  if (!Array.isArray(element)) {
    return false;
  }

  for (const singleEntry of element) {
    if (typeof singleEntry !== 'string') {
      return false;
    }
  }

  return true;
}

function isStringMatching(theString: string, theQuery: string): boolean {
  // Escape the query so that special characters don't have an unintended side effect.
  let preparedQuery = escapeStringRegexp(theQuery);
  // There is one special case: We want to allow wildcards with the "*" character. So: "un-escape" this character and replace it with a proper Regex wildcard.
  preparedQuery = preparedQuery.replaceAll('\\*', '.*');

  const regex = new RegExp(preparedQuery, 'i');
  return regex.test(theString);
}
