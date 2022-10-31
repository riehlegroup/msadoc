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
  ConnectingNode,
  MainNode,
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../../service-docs-tree';

import { HopsGetterFn, buildHopsGetterFn } from './graph-hops';
import { RawLink, buildRawLinks } from './sankey-links';

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

    correspondingTreeNode: ServiceNode | RegularGroupNode | ConnectingNode;
  };
}
export type CustomSankeyLink = DefaultLink;

export interface SankeyData {
  nodes: CustomSankeyNode[];
  links: CustomSankeyLink[];
}

export interface SankeyConfig {
  /**
   * This Pivot Node has two main purposes:
   * 1. It defines how nodes/links are colored (nodes/links not directly related to the Pivot Node are colored differently).
   * 2. It defines whether and how nodes are grouped: If a service is passed, then no grouping takes place. However, if a group is passed, then some of the nodes are combined on a per-group basis.
   */
  pivotNode: MainNode;

  includeAPIs: boolean;
  includeEvents: boolean;
}

/**
 * A map from node ID to its Sankey Node.
 */
type NodeIdMap = Record<string, CustomSankeyNode>;

export function buildSankeyData(
  rootGroup: RootGroupNode,
  sankeyConfig: SankeyConfig,
): SankeyData {
  const result: SankeyData = {
    nodes: [],
    links: [],
  };

  const nodeIdMap: NodeIdMap = {};

  let rawLinks: RawLink[];
  if (sankeyConfig.pivotNode.type === ServiceDocsTreeNodeType.Service) {
    rawLinks = buildRawLinks(rootGroup, {
      mode: 'include-all-services-separately',
    });
  } else {
    rawLinks = buildRawLinks(rootGroup, {
      mode: 'build-around-group',
      group: sankeyConfig.pivotNode,
    });
  }

  const hopsGetterFn = buildHopsGetterFn(rootGroup, sankeyConfig.pivotNode);

  for (const singleRawLink of rawLinks) {
    if (!shouldIncludeLink(singleRawLink, sankeyConfig)) {
      continue;
    }

    const fromNodeCreationResult = getOrCreateNode(
      singleRawLink.from,
      'from',
      nodeIdMap,
      hopsGetterFn,
    );
    if (fromNodeCreationResult.isNewNode) {
      result.nodes.push(fromNodeCreationResult.node);
    }

    const toNodeCreationResult = getOrCreateNode(
      singleRawLink.to,
      'to',
      nodeIdMap,
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
      !isNodeDirectlyRelatedToPivotNode(singleRawLink.from, hopsGetterFn) ||
      !isNodeDirectlyRelatedToPivotNode(singleRawLink.to, hopsGetterFn)
    ) {
      newLink.startColor = grey[300];
      newLink.endColor = grey[300];
    }

    result.links.push(newLink);
  }

  return result;
}

function shouldIncludeLink(link: RawLink, sankeyConfig: SankeyConfig): boolean {
  let connectingNode: ConnectingNode;
  if (link.type === 'from-service-or-group') {
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
  correspondingTreeNode: ServiceNode | RegularGroupNode | ConnectingNode,
  mode: 'from' | 'to',
  nodeIdMap: NodeIdMap,
  hopsGetterFn: HopsGetterFn,
): { node: CustomSankeyNode; isNewNode: boolean } {
  let nodeName: string;
  let nodeType:
    | 'ServiceSourceNode'
    | 'ServiceTargetNode'
    | 'GroupSourceNode'
    | 'GroupTargetNode'
    | 'APINode'
    | 'EventNode';
  let nodePosition: NodePosition;
  if (correspondingTreeNode.type === ServiceDocsTreeNodeType.Service) {
    nodeName = correspondingTreeNode.name;

    if (mode === 'from') {
      nodeType = 'ServiceSourceNode';
      nodePosition = NodePosition.Left;
    } else {
      nodeType = 'ServiceTargetNode';
      nodePosition = NodePosition.Right;
    }
  } else if (
    correspondingTreeNode.type === ServiceDocsTreeNodeType.RegularGroup
  ) {
    nodeName = `[Group] ${correspondingTreeNode.identifier}`;

    if (mode === 'from') {
      nodeType = 'GroupSourceNode';
      nodePosition = NodePosition.Left;
    } else {
      nodeType = 'GroupTargetNode';
      nodePosition = NodePosition.Right;
    }
  } else if (correspondingTreeNode.type === ServiceDocsTreeNodeType.API) {
    nodeName = `[API] ${correspondingTreeNode.name}`;
    nodeType = 'APINode';
    nodePosition = NodePosition.Middle;
  } else {
    nodeName = `[Event] ${correspondingTreeNode.name}`;
    nodeType = 'EventNode';
    nodePosition = NodePosition.Middle;
  }

  const nodeId = `${nodeType}-${nodeName}`;
  const mapEntry = nodeIdMap[nodeId];

  if (mapEntry) {
    return {
      node: mapEntry,
      isNewNode: false,
    };
  }

  const newSankeyNode: CustomSankeyNode = {
    id: nodeId,
    customData: {
      label: nodeName,
      color: getColorForNode(correspondingTreeNode, hopsGetterFn),
      position: nodePosition,

      correspondingTreeNode: correspondingTreeNode,
    },
  };

  nodeIdMap[nodeId] = newSankeyNode;

  return {
    node: newSankeyNode,
    isNewNode: true,
  };
}

function getColorForNode(
  node: ServiceNode | RegularGroupNode | ConnectingNode,
  hopsGetterFn: HopsGetterFn,
): string {
  if (!isNodeDirectlyRelatedToPivotNode(node, hopsGetterFn)) {
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
 * Is the given node directly related to the Pivot Node?
 * We say that a node is directly related if:
 * - It is an API or Event and only one hop is needed to reach it (i.e. `PivotNode --> OurNode`)
 * - It is a Service or Group and at most two hops are needed to reach it (i.e. `PivotNode --> SomeAPIOrEvent --> OurNode`)
 */
function isNodeDirectlyRelatedToPivotNode(
  node: ServiceNode | RegularGroupNode | ConnectingNode,
  hopsGetterFn: HopsGetterFn,
): boolean {
  const hops = hopsGetterFn(node);

  if (
    node.type === ServiceDocsTreeNodeType.Service ||
    node.type === ServiceDocsTreeNodeType.RegularGroup
  ) {
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
