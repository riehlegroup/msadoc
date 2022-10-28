import { GetServiceDocResponse } from 'msadoc-client';

/*
  Technically, the "Service Docs Tree" is a graph (and not a tree).
  But the main structure (outline) of this graph has the shape of a tree, and this entire structure does have one single root node, which is why we call it a tree.
*/

export enum ServiceDocsTreeNodeType {
  Service,
  RegularGroup,
  RootGroup,
  API,
  Event,
}

export type ServiceDocsTreeNode =
  | ServiceDocsTreeMainNode
  | ServiceDocsTreeConnectingNode;

/**
 * The "main" nodes that span the actual tree.
 */
export type ServiceDocsTreeMainNode =
  | ServiceDocsTreeRootNode
  | ServiceDocsTreeRegularGroup
  | ServiceDocsTreeServiceNode;

/**
 * APIs and Events "connect" services with each other.
 * Which is why we call the corresponding nodes "connecting nodes".
 */
export type ServiceDocsTreeConnectingNode =
  | ServiceDocsTreeAPINode
  | ServiceDocsTreeEventNode;

export interface ServiceDocsTreeServiceNode
  extends Omit<
    GetServiceDocResponse,
    | 'group'
    | 'providedAPIs'
    | 'consumedAPIs'
    | 'producedEvents'
    | 'consumedEvents'
  > {
  type: ServiceDocsTreeNodeType.Service;

  group: ServiceDocsTreeRegularGroup | ServiceDocsTreeRootNode;

  providedAPIs: ServiceDocsTreeAPINode[];
  consumedAPIs: ServiceDocsTreeAPINode[];
  producedEvents: ServiceDocsTreeEventNode[];
  consumedEvents: ServiceDocsTreeEventNode[];
}

export interface ServiceDocsTreeRegularGroup {
  type: ServiceDocsTreeNodeType.RegularGroup;

  /**
   * The `name` of a group is the last part of its `identifier`.
   *
   * Example: If the `identifier` is `foo.bar.baz`, then the `name` is `baz`.
   */
  name: string;
  /**
   * The unique identifier of this group like `foo.bar.baz`.
   */
  identifier: string;

  /**
   * The direct children of this group.
   *
   * The object keys are the names of the respective child group.
   * (Compared to just using an array, this enables a faster lookup of groups.)
   */
  childGroups: { [groupName: string]: ServiceDocsTreeRegularGroup };

  parent: ServiceDocsTreeRegularGroup | ServiceDocsTreeRootNode;

  /**
   * The services that belong to this group.
   */
  services: ServiceDocsTreeServiceNode[];
}
// Basically the same as a regular group, but without a name, identifier, or parent.
export interface ServiceDocsTreeRootNode
  extends Omit<
    ServiceDocsTreeRegularGroup,
    'name' | 'identifier' | 'parent' | 'type'
  > {
  type: ServiceDocsTreeNodeType.RootGroup;
}

export interface ServiceDocsTreeAPINode {
  type: ServiceDocsTreeNodeType.API;
  name: string;

  providedBy: ServiceDocsTreeServiceNode[];
  consumedBy: ServiceDocsTreeServiceNode[];
}

export interface ServiceDocsTreeEventNode {
  type: ServiceDocsTreeNodeType.Event;
  name: string;

  producedBy: ServiceDocsTreeServiceNode[];
  consumedBy: ServiceDocsTreeServiceNode[];
}

export function buildServiceDocsTree(
  serviceDocs: GetServiceDocResponse[],
): ServiceDocsTreeRootNode {
  const allGroupIdentifiers = getAllGroupIdentifiers(serviceDocs);

  const theTree = buildGroups(allGroupIdentifiers);

  buildAndInsertServiceItems(serviceDocs, theTree);

  return theTree;
}

function getAllGroupIdentifiers(
  serviceDocs: GetServiceDocResponse[],
): Set<string> {
  const result = new Set<string>();

  for (const singleServiceDoc of serviceDocs) {
    if (singleServiceDoc.group === undefined) {
      continue;
    }
    result.add(singleServiceDoc.group);
  }

  return result;
}

function buildGroups(groupIdentifiers: Set<string>): ServiceDocsTreeRootNode {
  const rootGroup: ServiceDocsTreeRootNode = {
    type: ServiceDocsTreeNodeType.RootGroup,
    childGroups: {},
    services: [],
  };

  for (const singleIdentifier of Array.from(groupIdentifiers)) {
    createGroupIfNotExists(singleIdentifier, rootGroup);
  }

  return rootGroup;
}

function createGroupIfNotExists(
  groupIdentifier: string,
  rootGroup: ServiceDocsTreeRootNode,
): ServiceDocsTreeRegularGroup | ServiceDocsTreeRootNode {
  const splitGroupIdentifier = groupIdentifier.split('.');
  if (splitGroupIdentifier[0] === undefined) {
    console.warn('This point should not be reached.');
    return rootGroup;
  }
  let currentGroup: ServiceDocsTreeRootNode | ServiceDocsTreeRegularGroup =
    rootGroup;
  for (let i = 0; i < splitGroupIdentifier.length; i++) {
    const groupName = splitGroupIdentifier[i];
    if (groupName === undefined) {
      console.warn('This point should not be reached.');
      continue;
    }

    let childGroup: ServiceDocsTreeRegularGroup | undefined =
      currentGroup.childGroups[groupName];
    if (!childGroup) {
      const identifier = splitGroupIdentifier.slice(0, i + 1).join('.');
      childGroup = {
        type: ServiceDocsTreeNodeType.RegularGroup,
        name: groupName,
        identifier: identifier,
        childGroups: {},
        parent: currentGroup,
        services: [],
      };
      currentGroup.childGroups[groupName] = childGroup;
    }

    currentGroup = childGroup;
  }

  return currentGroup;
}

function buildAndInsertServiceItems(
  serviceDocs: GetServiceDocResponse[],
  rootGroup: ServiceDocsTreeRootNode,
): void {
  /**
   * A Map from node name to its Node.
   */
  const APINodesMap: Record<string, ServiceDocsTreeAPINode> = {};
  /**
   * A Map from node name to its Node.
   */
  const eventNodesMap: Record<string, ServiceDocsTreeEventNode> = {};

  for (const singleServiceDoc of serviceDocs) {
    let group: ServiceDocsTreeRootNode | ServiceDocsTreeRegularGroup;

    if (singleServiceDoc.group === undefined) {
      // If the group is missing, add this service to the root group.
      group = rootGroup;
    } else {
      const foundGroup = getGroupByIdentifier(
        singleServiceDoc.group,
        rootGroup,
      );
      if (!foundGroup) {
        console.warn(
          'Did not find the group for the following Service Doc. This should not happen.',
          singleServiceDoc,
        );
        continue;
      }
      group = foundGroup;
    }

    const newServiceDocNode: ServiceDocsTreeServiceNode = {
      ...singleServiceDoc,

      type: ServiceDocsTreeNodeType.Service,

      group: group,
      providedAPIs: [],
      consumedAPIs: [],
      producedEvents: [],
      consumedEvents: [],
    };
    group.services.push(newServiceDocNode);

    if (singleServiceDoc.providedAPIs !== undefined) {
      for (const singleProvidedApiName of singleServiceDoc.providedAPIs) {
        const theAPINode = getOrCreateAPINode(
          singleProvidedApiName,
          APINodesMap,
        );

        newServiceDocNode.providedAPIs.push(theAPINode);
        theAPINode.providedBy.push(newServiceDocNode);
      }
    }

    if (singleServiceDoc.consumedAPIs !== undefined) {
      for (const singleConsumedApiName of singleServiceDoc.consumedAPIs) {
        const theAPINode = getOrCreateAPINode(
          singleConsumedApiName,
          APINodesMap,
        );

        newServiceDocNode.consumedAPIs.push(theAPINode);
        theAPINode.consumedBy.push(newServiceDocNode);
      }
    }

    if (singleServiceDoc.producedEvents !== undefined) {
      for (const singleProducedEventName of singleServiceDoc.producedEvents) {
        const theEventNode = getOrCreateEventNode(
          singleProducedEventName,
          eventNodesMap,
        );

        newServiceDocNode.producedEvents.push(theEventNode);
        theEventNode.producedBy.push(newServiceDocNode);
      }
    }

    if (singleServiceDoc.consumedEvents !== undefined) {
      for (const singleProducedEventName of singleServiceDoc.consumedEvents) {
        const theEventNode = getOrCreateEventNode(
          singleProducedEventName,
          eventNodesMap,
        );

        newServiceDocNode.consumedEvents.push(theEventNode);
        theEventNode.producedBy.push(newServiceDocNode);
      }
    }
  }
}

function getOrCreateAPINode(
  nodeName: string,
  APINodesMap: Record<string, ServiceDocsTreeAPINode>,
): ServiceDocsTreeAPINode {
  let theAPINode = APINodesMap[nodeName];
  if (!theAPINode) {
    theAPINode = {
      type: ServiceDocsTreeNodeType.API,
      name: nodeName,
      providedBy: [],
      consumedBy: [],
    };
    APINodesMap[nodeName] = theAPINode;
  }

  return theAPINode;
}

function getOrCreateEventNode(
  nodeName: string,
  eventNodesMap: Record<string, ServiceDocsTreeEventNode>,
): ServiceDocsTreeEventNode {
  let theEventNode = eventNodesMap[nodeName];
  if (!theEventNode) {
    theEventNode = {
      type: ServiceDocsTreeNodeType.Event,
      name: nodeName,
      producedBy: [],
      consumedBy: [],
    };
    eventNodesMap[nodeName] = theEventNode;
  }

  return theEventNode;
}

export function getGroupByIdentifier(
  groupIdentifier: string,
  groupsTree: ServiceDocsTreeRootNode,
): ServiceDocsTreeRegularGroup | undefined {
  const splitGroupIdentifier = groupIdentifier.split('.');
  let currentGroup: ServiceDocsTreeRootNode | ServiceDocsTreeRegularGroup =
    groupsTree;
  for (const identifierPart of splitGroupIdentifier) {
    const nextGroup: ServiceDocsTreeRegularGroup | undefined =
      currentGroup.childGroups[identifierPart];
    if (!nextGroup) {
      return undefined;
    }
    currentGroup = nextGroup;
  }
  return currentGroup as ServiceDocsTreeRegularGroup;
}
