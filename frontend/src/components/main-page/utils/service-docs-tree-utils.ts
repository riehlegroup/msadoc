import { addMultipleItemsToSet } from '../../../utils/set';
import {
  APINode,
  EventNode,
  MainNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../service-docs-tree';

export function isGroupXDescendantOfGroupY(params: {
  xGroup: RegularGroupNode;
  yGroup: RegularGroupNode;
}): boolean {
  let currentParentGroup = params.xGroup.parent;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
  while (true) {
    if (currentParentGroup === params.yGroup) {
      return true;
    }

    if (currentParentGroup.type === ServiceDocsTreeNodeType.RootGroup) {
      break;
    }
    currentParentGroup = currentParentGroup.parent;
  }

  return false;
}

export function extractAllServices(
  group: RegularGroupNode | RootGroupNode,
): ServiceNode[] {
  const result: ServiceNode[] = [...group.services];

  for (const singleChildGroup of Object.values(group.childGroups)) {
    const recursivelyExtractedServices = extractAllServices(singleChildGroup);
    result.push(...recursivelyExtractedServices);
  }

  return result;
}

export interface APIsAndEvents {
  providedAPIs: Set<APINode>;
  consumedAPIs: Set<APINode>;
  publishedEvents: Set<EventNode>;
  subscribedEvents: Set<EventNode>;
}
export function getAllAPIsAndEvents(item: MainNode): APIsAndEvents {
  if (item.type === ServiceDocsTreeNodeType.Service) {
    return {
      providedAPIs: new Set(item.providedAPIs),
      consumedAPIs: new Set(item.consumedAPIs),
      publishedEvents: new Set(item.publishedEvents),
      subscribedEvents: new Set(item.subscribedEvents),
    };
  }

  const result: APIsAndEvents = {
    providedAPIs: new Set(),
    consumedAPIs: new Set(),
    publishedEvents: new Set(),
    subscribedEvents: new Set(),
  };
  const allServices = extractAllServices(item);

  for (const singleService of allServices) {
    addMultipleItemsToSet(singleService.providedAPIs, result.providedAPIs);
    addMultipleItemsToSet(singleService.consumedAPIs, result.consumedAPIs);
    addMultipleItemsToSet(
      singleService.publishedEvents,
      result.publishedEvents,
    );
    addMultipleItemsToSet(
      singleService.subscribedEvents,
      result.subscribedEvents,
    );
  }

  return result;
}

/**
 * Sort the given Services by their name.
 */
export function sortServicesByName(services: ServiceNode[]): ServiceNode[] {
  const result = [...services];

  result.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return result;
}

/**
 * Sort the given Groups by their name.
 */
export function sortGroupsByName(
  groups: RegularGroupNode[],
): RegularGroupNode[] {
  const result = [...groups];

  result.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return result;
}
