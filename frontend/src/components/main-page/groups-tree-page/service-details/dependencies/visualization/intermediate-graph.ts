import { ServiceDocsServiceTreeItem } from '../../../../utils/service-docs-utils';

export type IntermediateGraphNode =
  | IntermediateGraphServiceNode
  | IntermediateGraphAPINode
  | IntermediateGraphEventNode;

interface BasicNode {
  /**
   * The minimal number of services one would have to visit in order to reach the Pivot Service. (One could also call this number "depth" or "distance".)
   *
   * This number is 0 for the Pivot Service itself, 1 for all the APIs and Events directly connected to this service, 2 for all services that are connected to the APIs/Events mentioned before, and so on.
   *
   * If the Pivot Service is not reachable, the number is set to infinity.
   */
  hopsNeededToReachPivotService: number;
}

export interface IntermediateGraphServiceNode extends BasicNode {
  type: 'service';

  serviceDoc: ServiceDocsServiceTreeItem;

  providedAPIs: Set<IntermediateGraphAPINode>;
  consumedAPIs: Set<IntermediateGraphAPINode>;

  producedEvents: Set<IntermediateGraphEventNode>;
  consumedEvents: Set<IntermediateGraphEventNode>;
}

export interface IntermediateGraphAPINode extends BasicNode {
  type: 'api';
  name: string;

  providedBy: Set<IntermediateGraphServiceNode>;
  consumedBy: Set<IntermediateGraphServiceNode>;
}
export interface IntermediateGraphEventNode extends BasicNode {
  type: 'event';
  name: string;

  producedBy: Set<IntermediateGraphServiceNode>;
  consumedBy: Set<IntermediateGraphServiceNode>;
}

export type IntermediateGraphLink =
  | IntermediateGraphLinkFromService
  | IntermediateGraphLinkToService;

export interface IntermediateGraphLinkFromService {
  type: 'from-service';
  from: IntermediateGraphServiceNode;
  to: IntermediateGraphAPINode | IntermediateGraphEventNode;
}

export interface IntermediateGraphLinkToService {
  type: 'to-service';
  from: IntermediateGraphAPINode | IntermediateGraphEventNode;
  to: IntermediateGraphServiceNode;
}

/**
 * Build the Intermediate Graph.
 *
 * The Intermediate Graph is a data structure based on the provided Service Docs.
 * Unlike the Service Docs, the Intermediate Graph is built with graph traversal in mind:
 * You can traverse from nodes to their related APIs/Events (and vice versa) using references.
 * This makes it particularly easy to answer questions like "which services are producing events that service X is consuming?".
 *
 * The graph structure is returned as an array of links, which makes it particularly easy to build the necessary data structures needed when visualizing Sankey Diagrams, Networks, or the like.
 *
 * @param serviceDocs The Service Docs the graph should be based on.
 * @param pivotService Every node in the generated graph has a field that informs us about the depth (i.e. the distance) from this particular Pivot Service.
 */
export function convertServiceDocsToIntermediateGraph(
  serviceDocs: ServiceDocsServiceTreeItem[],
  pivotService: ServiceDocsServiceTreeItem,
): IntermediateGraphLink[] {
  const intermediateNodes = buildIntermediateNodes(serviceDocs, pivotService);

  const result: IntermediateGraphLink[] = [];

  for (const singleIntermediateNode of intermediateNodes) {
    /*
      The "natural" flow of Events if from producer to consumer:

      (SomeProducer) --> (Event) --> (SomeConsumer)
    */
    for (const producedEvent of Array.from(
      singleIntermediateNode.producedEvents,
    )) {
      result.push({
        type: 'from-service',
        from: singleIntermediateNode,
        to: producedEvent,
      });
    }

    for (const consumedEvent of Array.from(
      singleIntermediateNode.consumedEvents,
    )) {
      result.push({
        type: 'to-service',
        from: consumedEvent,
        to: singleIntermediateNode,
      });
    }

    /*
      The "natural" flow of APIs is from consumer to provider:

      (SomeConsumer) --> (API) --> (SomeProducer)
    */
    for (const consumedAPI of Array.from(singleIntermediateNode.consumedAPIs)) {
      result.push({
        type: 'from-service',
        from: singleIntermediateNode,
        to: consumedAPI,
      });
    }

    for (const providedAPI of Array.from(singleIntermediateNode.providedAPIs)) {
      result.push({
        type: 'to-service',
        from: providedAPI,
        to: singleIntermediateNode,
      });
    }
  }

  return result;
}

function buildIntermediateNodes(
  serviceDocs: ServiceDocsServiceTreeItem[],
  pivotService: ServiceDocsServiceTreeItem,
): IntermediateGraphServiceNode[] {
  const result: IntermediateGraphServiceNode[] = [];

  /**
   * A Map from node name to its Intermediate Node.
   */
  const APINodesMap: Record<string, IntermediateGraphAPINode> = {};
  /**
   * A Map from node name to its Intermediate Node.
   */
  const eventNodesMap: Record<string, IntermediateGraphEventNode> = {};

  for (const singleServiceDoc of serviceDocs) {
    const newServiceDocNode: IntermediateGraphServiceNode = {
      type: 'service',

      serviceDoc: singleServiceDoc,

      hopsNeededToReachPivotService: Number.POSITIVE_INFINITY,

      providedAPIs: new Set(),
      consumedAPIs: new Set(),

      producedEvents: new Set(),
      consumedEvents: new Set(),
    };
    result.push(newServiceDocNode);

    if (singleServiceDoc.providedAPIs !== undefined) {
      for (const singleProvidedApiName of singleServiceDoc.providedAPIs) {
        const theAPINode = getOrCreateAPINode(
          singleProvidedApiName,
          APINodesMap,
        );

        newServiceDocNode.providedAPIs.add(theAPINode);
        theAPINode.providedBy.add(newServiceDocNode);
      }
    }

    if (singleServiceDoc.consumedAPIs !== undefined) {
      for (const singleConsumedApiName of singleServiceDoc.consumedAPIs) {
        const theAPINode = getOrCreateAPINode(
          singleConsumedApiName,
          APINodesMap,
        );

        newServiceDocNode.consumedAPIs.add(theAPINode);
        theAPINode.consumedBy.add(newServiceDocNode);
      }
    }

    if (singleServiceDoc.producedEvents !== undefined) {
      for (const singleProducedEventName of singleServiceDoc.producedEvents) {
        const theEventNode = getOrCreateEventNode(
          singleProducedEventName,
          eventNodesMap,
        );

        newServiceDocNode.producedEvents.add(theEventNode);
        theEventNode.producedBy.add(newServiceDocNode);
      }
    }

    if (singleServiceDoc.consumedEvents !== undefined) {
      for (const singleProducedEventName of singleServiceDoc.consumedEvents) {
        const theEventNode = getOrCreateEventNode(
          singleProducedEventName,
          eventNodesMap,
        );

        newServiceDocNode.consumedEvents.add(theEventNode);
        theEventNode.producedBy.add(newServiceDocNode);
      }
    }
  }

  updateHopsNeededToReachPivotService(result, pivotService);

  return result;
}

function getOrCreateAPINode(
  nodeName: string,
  APINodesMap: Record<string, IntermediateGraphAPINode>,
): IntermediateGraphAPINode {
  let theAPINode = APINodesMap[nodeName];
  if (!theAPINode) {
    theAPINode = {
      type: 'api',
      name: nodeName,
      hopsNeededToReachPivotService: Number.POSITIVE_INFINITY,
      providedBy: new Set(),
      consumedBy: new Set(),
    };
    APINodesMap[nodeName] = theAPINode;
  }

  return theAPINode;
}

function getOrCreateEventNode(
  nodeName: string,
  eventNodesMap: Record<string, IntermediateGraphEventNode>,
): IntermediateGraphEventNode {
  let theEventNode = eventNodesMap[nodeName];
  if (!theEventNode) {
    theEventNode = {
      type: 'event',
      name: nodeName,
      hopsNeededToReachPivotService: Number.POSITIVE_INFINITY,
      producedBy: new Set(),
      consumedBy: new Set(),
    };
    eventNodesMap[nodeName] = theEventNode;
  }

  return theEventNode;
}

/**
 * Update the number that indicates how many hops you need to perform from a given node to reach the Pivot Service.
 *
 * (Only the nodes reachable by the Pivot Service are updated here. This is why we set the number to infinity when creating the nodes. Now, if a node is not reachable, its number remains at infinity.)
 */
function updateHopsNeededToReachPivotService(
  intermediateNodes: IntermediateGraphServiceNode[],
  pivotService: ServiceDocsServiceTreeItem,
): void {
  const intermediateNodeOfPivotService = intermediateNodes.find(
    (item) => item.serviceDoc.name === pivotService.name,
  );

  if (!intermediateNodeOfPivotService) {
    console.warn('Did not find the Pivot Service. This should not happen.');
    return;
  }

  const alreadyVisitedNodes = new Set<IntermediateGraphNode>();
  let nodesToVisitInNextIteration: IntermediateGraphNode[] = [
    intermediateNodeOfPivotService,
  ];
  let currentDepth = 0;
  // This is basically Breadth-First Search.
  while (nodesToVisitInNextIteration.length > 0) {
    const nodesOnCurrentLevel = [...nodesToVisitInNextIteration];
    nodesToVisitInNextIteration = [];

    for (const singleNode of nodesOnCurrentLevel) {
      singleNode.hopsNeededToReachPivotService = currentDepth;
      alreadyVisitedNodes.add(singleNode);

      const potentialItemsForNextIteration: IntermediateGraphNode[] = [];

      if (singleNode.type === 'service') {
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
      } else if (singleNode.type === 'api') {
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
}
