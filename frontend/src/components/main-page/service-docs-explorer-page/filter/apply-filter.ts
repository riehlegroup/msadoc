import escapeStringRegexp from 'escape-string-regexp';
import { ExpressionNodeType } from 'search-expression-parser';

import { ServiceNode } from '../../service-docs-tree';

import {
  EXTENSIONS_KEY_PREFIX,
  FilterAndNode,
  FilterKeyValueNode,
  FilterNode,
  FilterNotNode,
  FilterOrNode,
  QUERY_KEY_TO_SERVICEDOC_MAP,
  SPECIAL_EMPTY_TAG,
  isExtensionsKey,
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
  let serviceDocEntryFromRawData: unknown;

  // Special case: We are filtering for an Extension Field.
  if (isExtensionsKey(filter.key)) {
    const keyWithoutPrefix = filter.key.replace(EXTENSIONS_KEY_PREFIX, '');
    serviceDocEntryFromRawData =
      serviceDoc.rawData.extensions?.[keyWithoutPrefix];
  } else {
    const serviceDocKey = QUERY_KEY_TO_SERVICEDOC_MAP[filter.key];

    // We use the raw Service Doc here, because there are less different data types we need to distinguish compared to the processed ones in the containing Service Doc.
    serviceDocEntryFromRawData = serviceDoc.rawData[serviceDocKey];
  }

  return doesEntryMatchFilter(filter, serviceDocEntryFromRawData);
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

  if (isAllowedPrimitiveValue(serviceDocEntry)) {
    return isPrimitiveValueMatching(serviceDocEntry, filter.value);
  }

  if (isArrayOfAllowedPrimitiveValues(serviceDocEntry)) {
    for (const singleEntry of serviceDocEntry) {
      if (isPrimitiveValueMatching(singleEntry, filter.value)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Types of primitive values that may appear in our Service Docs.
 */
type AllowedPrimitiveValue = string | number | boolean;
function isAllowedPrimitiveValue(
  value: unknown,
): value is AllowedPrimitiveValue {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }
  return false;
}
function isArrayOfAllowedPrimitiveValues(
  element: unknown,
): element is AllowedPrimitiveValue[] {
  if (!Array.isArray(element)) {
    return false;
  }

  for (const singleEntry of element) {
    if (!isAllowedPrimitiveValue(singleEntry)) {
      return false;
    }
  }

  return true;
}

function isPrimitiveValueMatching(
  theValue: AllowedPrimitiveValue,
  theQuery: string,
): boolean {
  if (typeof theValue === 'string') {
    return isStringMatching(theValue, theQuery);
  }

  if (typeof theValue === 'number') {
    const queryAsNumber = Number.parseInt(theQuery, 10);
    if (Number.isNaN(queryAsNumber)) {
      return false;
    }
    return theValue === queryAsNumber;
  }

  if (theValue === true && theQuery.toLowerCase() === 'true') {
    return true;
  }
  if (theValue === false && theQuery.toLowerCase() === 'false') {
    return true;
  }

  return false;
}

function isStringMatching(theString: string, theQuery: string): boolean {
  // Escape the query so that special characters don't have an unintended side effect.
  let preparedQuery = escapeStringRegexp(theQuery);
  // There is one special case: We want to allow wildcards with the "*" character. So: "un-escape" this character and replace it with a proper Regex wildcard.
  preparedQuery = preparedQuery.replaceAll('\\*', '.*');

  const regex = new RegExp(preparedQuery, 'i');
  return regex.test(theString);
}
