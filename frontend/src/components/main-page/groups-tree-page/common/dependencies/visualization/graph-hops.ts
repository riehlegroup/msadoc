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
 * If the Pivot Node is a service, then the following applies:
 * The hops number is 0 for the Pivot Service itself, 1 for all the APIs and Events directly connected to this service, 2 for all services that are connected to the APIs/Events mentioned before, and so on. If the Pivot Service is not reachable, the number is set to infinity.
 *
 * If the Pivot Node is a group, then all services contained in the Pivot Group are collected. The hops number is then the minimal distance to any of the collected services, i.e. if there is one service reachable in 3 hops and one in 4, then the hops number is set to 3.
 */
export type HopsGetterFn = (node: ServiceDocsTreeNode) => number;

export function buildHopsGetterFn(
  treeRoot: RootGroupNode,
  pivotNode: MainNode,
): HopsGetterFn {
  const hopsMap = new Map<ServiceDocsTreeNode, number>();

  const alreadyVisitedNodes = new Set<ServiceNode | ConnectingNode>();
  let nodesToVisitInNextIteration: Array<ServiceNode | ConnectingNode>;
  if (pivotNode.type === ServiceDocsTreeNodeType.Service) {
    nodesToVisitInNextIteration = [pivotNode];
  } else {
    nodesToVisitInNextIteration = extractAllServices(pivotNode);
  }

  let currentDepth = 0;
  // This is basically Breadth-First Search: We go over all services and API/Event nodes "layer-by-layer".
  while (nodesToVisitInNextIteration.length > 0) {
    const nodesOnCurrentLevel = [...nodesToVisitInNextIteration];
    nodesToVisitInNextIteration = [];

    for (const singleNode of nodesOnCurrentLevel) {
      hopsMap.set(singleNode, currentDepth);
      alreadyVisitedNodes.add(singleNode);

      const potentialItemsForNextIteration: Array<
        ServiceNode | ConnectingNode
      > = [];

      if (singleNode.type === ServiceDocsTreeNodeType.Service) {
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.providedAPIs),
        );
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.consumedAPIs),
        );
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.producedEvents),
        );
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.consumedEvents),
        );
      } else if (singleNode.type === ServiceDocsTreeNodeType.API) {
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.providedBy),
        );
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.consumedBy),
        );
      } else {
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.producedBy),
        );
        potentialItemsForNextIteration.push(
          ...Array.from(singleNode.consumedBy),
        );
      }

      for (const singlePotentialItem of potentialItemsForNextIteration) {
        if (alreadyVisitedNodes.has(singlePotentialItem)) {
          continue;
        }
        nodesToVisitInNextIteration.push(singlePotentialItem);
      }
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
