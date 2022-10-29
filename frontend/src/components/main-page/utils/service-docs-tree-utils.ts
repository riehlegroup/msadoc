import {
  ServiceDocsTreeAPINode,
  ServiceDocsTreeEventNode,
  ServiceDocsTreeMainNode,
  ServiceDocsTreeNodeType,
  ServiceDocsTreeRegularGroupNode,
  ServiceDocsTreeRootNode,
  ServiceDocsTreeServiceNode,
} from '../service-docs-tree';

export function isGroupXDescendantOfGroupY(params: {
  xGroup: ServiceDocsTreeRegularGroupNode;
  yGroup: ServiceDocsTreeRegularGroupNode;
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
  group: ServiceDocsTreeRegularGroupNode | ServiceDocsTreeRootNode,
): ServiceDocsTreeServiceNode[] {
  const result: ServiceDocsTreeServiceNode[] = [...group.services];

  for (const singleChildGroup of Object.values(group.childGroups)) {
    const recursivelyExtractedServices = extractAllServices(singleChildGroup);
    result.push(...recursivelyExtractedServices);
  }

  return result;
}

export interface APIsAndEvents {
  providedAPIs: Set<ServiceDocsTreeAPINode>;
  consumedAPIs: Set<ServiceDocsTreeAPINode>;
  producedEvents: Set<ServiceDocsTreeEventNode>;
  consumedEvents: Set<ServiceDocsTreeEventNode>;
}
export function getAllAPIsAndEvents(
  item: ServiceDocsTreeMainNode,
): APIsAndEvents {
  if (item.type === ServiceDocsTreeNodeType.Service) {
    return {
      providedAPIs: new Set(item.providedAPIs),
      consumedAPIs: new Set(item.consumedAPIs),
      producedEvents: new Set(item.producedEvents),
      consumedEvents: new Set(item.consumedEvents),
    };
  }

  const result: APIsAndEvents = {
    providedAPIs: new Set(),
    consumedAPIs: new Set(),
    producedEvents: new Set(),
    consumedEvents: new Set(),
  };
  const allServices = extractAllServices(item);

  for (const singleService of allServices) {
    addMultipleItemsToSet(singleService.providedAPIs, result.providedAPIs);
    addMultipleItemsToSet(singleService.consumedAPIs, result.consumedAPIs);
    addMultipleItemsToSet(singleService.producedEvents, result.producedEvents);
    addMultipleItemsToSet(singleService.consumedEvents, result.consumedEvents);
  }

  return result;
}

function addMultipleItemsToSet<T>(items: T[], theSet: Set<T>): void {
  for (const singleItem of items) {
    theSet.add(singleItem);
  }
}
