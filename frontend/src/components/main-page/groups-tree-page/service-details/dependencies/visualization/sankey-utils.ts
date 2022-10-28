import {
  blue,
  cyan,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  pink,
  purple,
  red,
  teal,
} from '@mui/material/colors';
import { DefaultLink, DefaultNode } from '@nivo/sankey';

import {
  ServiceDocsTreeConnectingNode,
  ServiceDocsTreeNodeType,
  ServiceDocsTreeRootNode,
  ServiceDocsTreeServiceNode,
} from '../../../../service-docs-tree';
import { extractAllServices } from '../../../../utils/service-docs-tree-utils';

import { HopsGetterFn, buildHopsGetterFn } from './graph-hops';

export enum NodePosition {
  Left,
  Middle,
  Right,
}

export interface CustomSankeyNode extends DefaultNode {
  customData: {
    label: string;
    color: string;
    position: NodePosition;
  };
}
export type CustomSankeyLink = DefaultLink;

export interface SankeyData {
  nodes: CustomSankeyNode[];
  links: CustomSankeyLink[];
}

export interface SankeyConfig {
  pivotService: ServiceDocsTreeServiceNode;

  includeAPIs: boolean;
  includeEvents: boolean;
}

/**
 * Maps from node name (either the name of the Service, or the name of the API/Event) to the actual node.
 */
interface NodeNameToSankeyNodeMaps {
  serviceSourceNodes: Record<string, CustomSankeyNode>;
  serviceTargetNodes: Record<string, CustomSankeyNode>;
  APINodes: Record<string, CustomSankeyNode>;
  eventNodes: Record<string, CustomSankeyNode>;
}
/**
 * A Map from node ID to the Service Docs Tree Node it is based on.
 */
type NodeIdToServiceDocsTreeNodeMap = Record<
  string,
  ServiceDocsTreeServiceNode | ServiceDocsTreeConnectingNode
>;

export function buildSankeyData(
  rootGroup: ServiceDocsTreeRootNode,
  sankeyConfig: SankeyConfig,
): SankeyData {
  const result: SankeyData = {
    nodes: [],
    links: [],
  };

  const nodeNameToSankeyNodeMaps: NodeNameToSankeyNodeMaps = {
    serviceSourceNodes: {},
    serviceTargetNodes: {},
    APINodes: {},
    eventNodes: {},
  };
  const nodeIdToServiceDocsTreeNodeMap: NodeIdToServiceDocsTreeNodeMap = {};

  const rawLinks = buildRawLinks(rootGroup);
  const hopsGetterFn = buildHopsGetterFn(rootGroup, sankeyConfig.pivotService);

  for (const singleRawLink of rawLinks) {
    if (!shouldIncludeLink(singleRawLink, sankeyConfig)) {
      continue;
    }

    const fromNodeCreationResult = getOrCreateNode(
      singleRawLink.from,
      'from',
      nodeNameToSankeyNodeMaps,
      nodeIdToServiceDocsTreeNodeMap,
      hopsGetterFn,
    );
    if (fromNodeCreationResult.isNewNode) {
      result.nodes.push(fromNodeCreationResult.node);
    }

    const toNodeCreationResult = getOrCreateNode(
      singleRawLink.to,
      'to',
      nodeNameToSankeyNodeMaps,
      nodeIdToServiceDocsTreeNodeMap,
      hopsGetterFn,
    );
    if (toNodeCreationResult.isNewNode) {
      result.nodes.push(toNodeCreationResult.node);
    }

    const newLink: CustomSankeyLink = {
      source: fromNodeCreationResult.node.id,
      target: toNodeCreationResult.node.id,
      value: 1,
    };

    // Make the link grey if it is not connecting two "nodes of interest".
    if (
      !isNodeDirectlyRelatedToPivotService(singleRawLink.from, hopsGetterFn) ||
      !isNodeDirectlyRelatedToPivotService(singleRawLink.to, hopsGetterFn)
    ) {
      newLink.startColor = grey[300];
      newLink.endColor = grey[300];
    }

    result.links.push(newLink);
  }

  return result;
}

type RawLink = RawLinkFromService | RawLinkToService;

interface RawLinkFromService {
  type: 'from-service';
  from: ServiceDocsTreeServiceNode;
  to: ServiceDocsTreeConnectingNode;
}

interface RawLinkToService {
  type: 'to-service';
  from: ServiceDocsTreeConnectingNode;
  to: ServiceDocsTreeServiceNode;
}

function buildRawLinks(rootGroup: ServiceDocsTreeRootNode): RawLink[] {
  const result: RawLink[] = [];

  const allServices = extractAllServices(rootGroup);

  for (const singleService of allServices) {
    /*
      The "natural" flow of Events if from producer to consumer:
      (SomeProducer) --> (Event) --> (SomeConsumer)
    */
    for (const producedEvent of singleService.producedEvents) {
      result.push({
        type: 'from-service',
        from: singleService,
        to: producedEvent,
      });
    }

    for (const consumedEvent of singleService.consumedEvents) {
      result.push({
        type: 'to-service',
        from: consumedEvent,
        to: singleService,
      });
    }

    /*
        The "natural" flow of APIs is from consumer to provider:
        (SomeConsumer) --> (API) --> (SomeProducer)
      */
    for (const consumedAPI of singleService.consumedAPIs) {
      result.push({
        type: 'from-service',
        from: singleService,
        to: consumedAPI,
      });
    }

    for (const providedAPI of singleService.providedAPIs) {
      result.push({
        type: 'to-service',
        from: providedAPI,
        to: singleService,
      });
    }
  }

  return result;
}

function shouldIncludeLink(link: RawLink, sankeyConfig: SankeyConfig): boolean {
  let connectingNode: ServiceDocsTreeConnectingNode;
  if (link.type === 'from-service') {
    connectingNode = link.to;
  } else {
    connectingNode = link.from;
  }

  if (
    connectingNode.type === ServiceDocsTreeNodeType.API &&
    !sankeyConfig.includeAPIs
  ) {
    return false;
  }
  if (
    connectingNode.type === ServiceDocsTreeNodeType.Event &&
    !sankeyConfig.includeEvents
  ) {
    return false;
  }

  return true;
}

function getOrCreateNode(
  correspondingTreeNode:
    | ServiceDocsTreeServiceNode
    | ServiceDocsTreeConnectingNode,
  mode: 'from' | 'to',
  nodeNameToSankeyNodeMaps: NodeNameToSankeyNodeMaps,
  nodeIdToIntermediateNodeMap: NodeIdToServiceDocsTreeNodeMap,
  hopsGetterFn: HopsGetterFn,
): { node: CustomSankeyNode; isNewNode: boolean } {
  let nodeName: string;
  let nodeType: keyof typeof nodeNameToSankeyNodeMaps;
  let nodePosition: NodePosition;
  if (correspondingTreeNode.type === ServiceDocsTreeNodeType.Service) {
    nodeName = correspondingTreeNode.name;

    if (mode === 'from') {
      nodeType = 'serviceSourceNodes';
      nodePosition = NodePosition.Left;
    } else {
      nodeType = 'serviceTargetNodes';
      nodePosition = NodePosition.Right;
    }
  } else if (correspondingTreeNode.type === ServiceDocsTreeNodeType.API) {
    nodeName = `[API] ${correspondingTreeNode.name}`;
    nodeType = 'APINodes';
    nodePosition = NodePosition.Middle;
  } else {
    nodeName = `[Event] ${correspondingTreeNode.name}`;
    nodeType = 'eventNodes';
    nodePosition = NodePosition.Middle;
  }

  const nodeId = `${nodeType}-${nodePosition}-${nodeName}`;
  const nodeFromMap = nodeNameToSankeyNodeMaps[nodeType][nodeName];

  if (nodeFromMap) {
    return {
      node: nodeFromMap,
      isNewNode: false,
    };
  }

  const newNode: CustomSankeyNode = {
    id: nodeId,
    customData: {
      label: nodeName,
      color: getColorForNode(correspondingTreeNode, hopsGetterFn),
      position: nodePosition,
    },
  };

  nodeNameToSankeyNodeMaps[nodeType][nodeName] = newNode;
  nodeIdToIntermediateNodeMap[newNode.id] = correspondingTreeNode;

  return {
    node: newNode,
    isNewNode: true,
  };
}

function getColorForNode(
  node: ServiceDocsTreeServiceNode | ServiceDocsTreeConnectingNode,
  hopsGetterFn: HopsGetterFn,
): string {
  if (!isNodeDirectlyRelatedToPivotService(node, hopsGetterFn)) {
    return grey[300];
  }

  if (node.type === ServiceDocsTreeNodeType.API) {
    return cyan[500];
  }
  if (node.type === ServiceDocsTreeNodeType.Event) {
    return pink[500];
  }

  const COLORS_TO_USE = [
    red[500],
    purple[500],
    deepPurple[500],
    indigo[500],
    blue[500],
    lightBlue[500],
    teal[500],
    green[500],
    lightGreen[500],
    lime[500],
  ];

  let randomStableIdentifier = 0;
  for (const character of node.name) {
    randomStableIdentifier += character.charCodeAt(0);
  }

  return COLORS_TO_USE[randomStableIdentifier % COLORS_TO_USE.length] as string;
}

/**
 * Is the given node directly related to the Pivot Service?
 * We say that a node is directly related if:
 * - It is an API or Event and only one hop is needed to reach it (i.e. `PivotService --> OurNode`)
 * - It is a Service and at most two hops are needed to reach it (i.e. `PivotService --> SomeAPIOrEvent --> OurNode`)
 */
function isNodeDirectlyRelatedToPivotService(
  node: ServiceDocsTreeServiceNode | ServiceDocsTreeConnectingNode,
  hopsGetterFn: HopsGetterFn,
): boolean {
  const hops = hopsGetterFn(node);

  if (node.type === ServiceDocsTreeNodeType.Service) {
    if (hops > 2) {
      return false;
    }
    return true;
  }

  if (hops > 1) {
    return false;
  }
  return true;
}
