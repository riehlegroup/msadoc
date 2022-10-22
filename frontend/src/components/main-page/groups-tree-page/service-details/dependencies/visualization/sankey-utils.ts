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

import { ServiceDocsServiceTreeItem } from '../../../../utils/service-docs-utils';

import {
  IntermediateGraphAPINode,
  IntermediateGraphEventNode,
  IntermediateGraphLink,
  IntermediateGraphServiceNode,
  convertServiceDocsToIntermediateGraph,
} from './intermediate-graph';

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
  pivotService: ServiceDocsServiceTreeItem;

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
 * A Map from node ID to the Intermediate Graph Node it is based on.
 */
type NodeIdToIntermediateNodeMap = Record<
  string,
  | IntermediateGraphServiceNode
  | IntermediateGraphAPINode
  | IntermediateGraphEventNode
>;

export function convertServiceDocsToSankeyData(
  serviceDocs: ServiceDocsServiceTreeItem[],
  sankeyConfig: SankeyConfig,
): SankeyData {
  const nodeNameToSankeyNodeMaps: NodeNameToSankeyNodeMaps = {
    serviceSourceNodes: {},
    serviceTargetNodes: {},
    APINodes: {},
    eventNodes: {},
  };
  const nodeIdToIntermediateNodeMap: NodeIdToIntermediateNodeMap = {};

  const intermediateGraphLinks = convertServiceDocsToIntermediateGraph(
    serviceDocs,
    sankeyConfig.pivotService,
  );

  const result: SankeyData = {
    nodes: [],
    links: [],
  };

  for (const singleIntermediateLink of intermediateGraphLinks) {
    if (!shouldIncludeLink(singleIntermediateLink, sankeyConfig)) {
      continue;
    }

    const fromNodeCreationResult = getOrCreateNode(
      singleIntermediateLink.from,
      'from',
      nodeNameToSankeyNodeMaps,
      nodeIdToIntermediateNodeMap,
    );
    if (fromNodeCreationResult.isNewNode) {
      result.nodes.push(fromNodeCreationResult.node);
    }

    const toNodeCreationResult = getOrCreateNode(
      singleIntermediateLink.to,
      'to',
      nodeNameToSankeyNodeMaps,
      nodeIdToIntermediateNodeMap,
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
      !isNodeDirectlyRelatedToPivotService(singleIntermediateLink.from) ||
      !isNodeDirectlyRelatedToPivotService(singleIntermediateLink.to)
    ) {
      newLink.startColor = grey[300];
      newLink.endColor = grey[300];
    }

    result.links.push(newLink);
  }

  return result;
}

function getOrCreateNode(
  correspondingIntermediateNode:
    | IntermediateGraphServiceNode
    | IntermediateGraphAPINode
    | IntermediateGraphEventNode,
  mode: 'from' | 'to',
  nodeNameToSankeyNodeMaps: NodeNameToSankeyNodeMaps,
  nodeIdToIntermediateNodeMap: NodeIdToIntermediateNodeMap,
): { node: CustomSankeyNode; isNewNode: boolean } {
  let nodeName: string;
  let nodeType: keyof typeof nodeNameToSankeyNodeMaps;
  let nodePosition: NodePosition;
  if (correspondingIntermediateNode.type === 'service') {
    nodeName = correspondingIntermediateNode.serviceDoc.name;

    if (mode === 'from') {
      nodeType = 'serviceSourceNodes';
      nodePosition = NodePosition.Left;
    } else {
      nodeType = 'serviceTargetNodes';
      nodePosition = NodePosition.Right;
    }
  } else if (correspondingIntermediateNode.type === 'api') {
    nodeName = correspondingIntermediateNode.name;
    nodeType = 'APINodes';
    nodePosition = NodePosition.Middle;
  } else {
    nodeName = correspondingIntermediateNode.name;
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
      color: getColorForNode(correspondingIntermediateNode),
      position: nodePosition,
    },
  };

  nodeNameToSankeyNodeMaps[nodeType][nodeName] = newNode;
  nodeIdToIntermediateNodeMap[newNode.id] = correspondingIntermediateNode;

  return {
    node: newNode,
    isNewNode: true,
  };
}

function getColorForNode(
  node:
    | IntermediateGraphServiceNode
    | IntermediateGraphAPINode
    | IntermediateGraphEventNode,
): string {
  if (!isNodeDirectlyRelatedToPivotService(node)) {
    return grey[300];
  }

  if (node.type === 'api') {
    return cyan[500];
  }
  if (node.type === 'event') {
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
  for (const character of node.serviceDoc.name) {
    randomStableIdentifier += character.charCodeAt(0);
  }

  return COLORS_TO_USE[randomStableIdentifier % COLORS_TO_USE.length] as string;
}

function shouldIncludeLink(
  link: IntermediateGraphLink,
  sankeyConfig: SankeyConfig,
): boolean {
  let APIOrEvent: IntermediateGraphAPINode | IntermediateGraphEventNode;
  if (link.type === 'from-service') {
    APIOrEvent = link.to;
  } else {
    APIOrEvent = link.from;
  }

  if (APIOrEvent.type === 'api' && !sankeyConfig.includeAPIs) {
    return false;
  }
  if (APIOrEvent.type === 'event' && !sankeyConfig.includeEvents) {
    return false;
  }

  return true;
}

/**
 * Is the given node directly related to the Pivot Service?
 * We say that a node is directly related if:
 * - It is an API or Event and only one hop is needed to reach it (i.e. `PivotService --> OurNode`)
 * - It is a Service and at most two hops are needed to reach it (i.e. `PivotService --> SomeAPIOrEvent --> OurNode`)
 */
function isNodeDirectlyRelatedToPivotService(
  node:
    | IntermediateGraphServiceNode
    | IntermediateGraphAPINode
    | IntermediateGraphEventNode,
): boolean {
  if (node.type === 'service') {
    if (node.hopsNeededToReachPivotService > 2) {
      return false;
    }
    return true;
  }

  if (node.hopsNeededToReachPivotService > 1) {
    return false;
  }
  return true;
}
