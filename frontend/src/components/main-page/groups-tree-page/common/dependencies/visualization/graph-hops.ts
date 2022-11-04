import { addMultipleItemsToSet } from '../../../../../../utils/set';
import {
  ConnectingNode,
  MainNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../../service-docs-tree';
import { extractAllServices } from '../../../../utils/service-docs-tree-utils';

/**
 * A function that returns the "number of hops" for any given service, group, or API/Event. (If a group is passed to this function, then the minimal number of hops of all contained services is returned.)
 *
 * Hops are the minimal number of services/APIs/Events one would have to visit in order to reach the Pivot Node. (One could also call this number "depth" or "distance".)
 *
 * If the Pivot Node is a service, then the following applies. The hops number is:
 * - 0 for the Pivot Service itself.
 * - 1 for all the APIs and Events directly connected to the Pivot Service.
 * - 2 for all services consuming an API/Event produced by the Pivot Service, and also 2 for all services producing an API/Event consumed by the Pivot Service.
 * - ...
 *
 * If the Pivot Node is a group, then all services contained in the Pivot Group are collected. The hops number is then the minimal distance to any of the collected services, i.e. if there is one service reachable in 2 hops and one in 4, then the hops number is set to 2.
 *
 * The hops are calculated by following the APIs/Events in a directed way.
 * Example:
 * Assume there is only one Event, and this Event is:
 * - Consumed by the Pivot Service and by service X
 * - Produced by service Y
 *
 * In this scenario, we say that 2 hops are needed to reach service Y (PivotService --> TheEvent --> Y).
 * However, we say that the Pivot Service and X are not connected at all, leading to an infinite number of hops.
 * This is because we follow the graph in a directed way, so when looking an the consumed Events of a service, we then go to the services that produced these Events, and we do not look at services that consumed these Events.
 */
export type HopsGetterFn = (node: ServiceDocsTreeNode) => number;

/**
 * Returns a "hops getter function".
 * This returned function tells us how far a given node is apart from the provided Pivot Node.
 * For a detailed explanation of this returned function, see {@link HopsGetterFn}.
 */
export function buildHopsGetterFn(
  treeRoot: RootGroupNode,
  pivotNode: MainNode,
): HopsGetterFn {
  const hopsMap = new Map<ServiceDocsTreeNode, number>();

  const alreadyVisitedNodes = new Set<ServiceNode | ConnectingNode>();
  const servicesToVisitInNextIteration = new Set<ServiceNode>();

  if (pivotNode.type === ServiceDocsTreeNodeType.Service) {
    servicesToVisitInNextIteration.add(pivotNode);
  } else {
    const allServicesOfPivotNode = extractAllServices(pivotNode);
    addMultipleItemsToSet(
      allServicesOfPivotNode,
      servicesToVisitInNextIteration,
    );
  }

  let currentDepth = 0;
  /*
    This is basically Breadth-First Search: We go over all services "layer-by-layer", following the direction of the APIs/Events.

    So, we take a service, look at the APIs it provides, and say that we want to visit all services consuming these APIs in the next iteration.
    Also, we look at the APIs it consumes, and say that we want to visit all services producing these APIs in the next iteration.
    The same is done for Events.

    By doing it like that, we always follow the APIs/Events in a directed way.  
  */
  while (servicesToVisitInNextIteration.size > 0) {
    const servicesOnCurrentLevel = Array.from(servicesToVisitInNextIteration);
    servicesToVisitInNextIteration.clear();

    const potentialServicesToVisitInNextIteration = new Set<ServiceNode>();

    for (const singleService of servicesOnCurrentLevel) {
      hopsMap.set(singleService, currentDepth * 2);
      alreadyVisitedNodes.add(singleService);

      const APIOrEventDepth = currentDepth * 2 + 1;

      for (const singleProvidedAPI of singleService.providedAPIs) {
        if (alreadyVisitedNodes.has(singleProvidedAPI)) {
          continue;
        }
        hopsMap.set(singleProvidedAPI, APIOrEventDepth);

        addMultipleItemsToSet(
          singleProvidedAPI.consumedBy,
          potentialServicesToVisitInNextIteration,
        );
      }

      for (const singleConsumedAPI of singleService.consumedAPIs) {
        if (alreadyVisitedNodes.has(singleConsumedAPI)) {
          continue;
        }
        hopsMap.set(singleConsumedAPI, APIOrEventDepth);

        addMultipleItemsToSet(
          singleConsumedAPI.providedBy,
          potentialServicesToVisitInNextIteration,
        );
      }

      for (const singleProducedEvent of singleService.producedEvents) {
        if (alreadyVisitedNodes.has(singleProducedEvent)) {
          continue;
        }
        hopsMap.set(singleProducedEvent, APIOrEventDepth);

        addMultipleItemsToSet(
          singleProducedEvent.consumedBy,
          potentialServicesToVisitInNextIteration,
        );
      }

      for (const singleConsumedEvent of singleService.consumedEvents) {
        if (alreadyVisitedNodes.has(singleConsumedEvent)) {
          continue;
        }
        hopsMap.set(singleConsumedEvent, APIOrEventDepth);

        addMultipleItemsToSet(
          singleConsumedEvent.producedBy,
          potentialServicesToVisitInNextIteration,
        );
      }

      for (const singleAPIOrEventNode of [
        ...singleService.providedAPIs,
        ...singleService.consumedAPIs,
        ...singleService.producedEvents,
        ...singleService.consumedEvents,
      ]) {
        alreadyVisitedNodes.add(singleAPIOrEventNode);
      }
    }

    for (const singlePotentialItem of potentialServicesToVisitInNextIteration.values()) {
      if (alreadyVisitedNodes.has(singlePotentialItem)) {
        continue;
      }
      servicesToVisitInNextIteration.add(singlePotentialItem);
    }

    currentDepth++;
  }

  addGroupsToHopsMap(treeRoot, hopsMap);

  return (node) => {
    const hopsMapEntry = hopsMap.get(node);
    if (hopsMapEntry === undefined) {
      return Number.POSITIVE_INFINITY;
    }
    return hopsMapEntry;
  };
}

/**
 * Complete the Hops Map by adding entries for all groups.
 */
function addGroupsToHopsMap(
  rootGroup: RootGroupNode,
  hopsMap: Map<ServiceDocsTreeNode, number>,
): void {
  getHopsForGroupAndUpdateHopsMap(rootGroup, hopsMap);
}

function getHopsForGroupAndUpdateHopsMap(
  group: RegularGroupNode | RootGroupNode,
  hopsMap: Map<ServiceDocsTreeNode, number>,
): number {
  let bestSoFar = Number.POSITIVE_INFINITY;

  for (const singleService of group.services) {
    const hopsMapEntry = hopsMap.get(singleService);
    if (hopsMapEntry === undefined) {
      continue;
    }

    bestSoFar = Math.min(bestSoFar, hopsMapEntry);
  }

  for (const singleGroup of Object.values(group.childGroups)) {
    const recResult = getHopsForGroupAndUpdateHopsMap(singleGroup, hopsMap);
    bestSoFar = Math.min(bestSoFar, recResult);
  }

  hopsMap.set(group, bestSoFar);

  return bestSoFar;
}
