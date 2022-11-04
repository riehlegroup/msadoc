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

export type ServiceDocsTreeNode = MainNode | ConnectingNode;

/**
 * The "main" nodes that span the actual tree.
 */
export type MainNode = RootGroupNode | RegularGroupNode | ServiceNode;

/**
 * APIs and Events "connect" services with each other.
 * Which is why we call the corresponding nodes "connecting nodes".
 */
export type ConnectingNode = APINode | EventNode;

export interface ServiceNode
  extends Omit<
    GetServiceDocResponse,
    | 'group'
    | 'providedAPIs'
    | 'consumedAPIs'
    | 'producedEvents'
    | 'consumedEvents'
  > {
  type: ServiceDocsTreeNodeType.Service;

  group: RegularGroupNode | RootGroupNode;

  providedAPIs: APINode[];
  consumedAPIs: APINode[];
  producedEvents: EventNode[];
  consumedEvents: EventNode[];
}

export interface RegularGroupNode {
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
  childGroups: { [groupName: string]: RegularGroupNode };

  parent: RegularGroupNode | RootGroupNode;

  /**
   * The services that belong to this group.
   */
  services: ServiceNode[];
}
// Basically the same as a regular group, but without a name, identifier, or parent.
export interface RootGroupNode
  extends Omit<RegularGroupNode, 'name' | 'identifier' | 'parent' | 'type'> {
  type: ServiceDocsTreeNodeType.RootGroup;
}

export interface APINode {
  type: ServiceDocsTreeNodeType.API;
  name: string;

  providedBy: ServiceNode[];
  consumedBy: ServiceNode[];
}

export interface EventNode {
  type: ServiceDocsTreeNodeType.Event;
  name: string;

  producedBy: ServiceNode[];
  consumedBy: ServiceNode[];
}

export function buildServiceDocsTree(
  serviceDocs: GetServiceDocResponse[],
): RootGroupNode {
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

function buildGroups(groupIdentifiers: Set<string>): RootGroupNode {
  const rootGroup: RootGroupNode = {
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
  rootGroup: RootGroupNode,
): RegularGroupNode | RootGroupNode {
  const splitGroupIdentifier = groupIdentifier.split('.');
  if (splitGroupIdentifier[0] === undefined) {
    console.warn('This point should not be reached.');
    return rootGroup;
  }
  let currentGroup: RootGroupNode | RegularGroupNode = rootGroup;
  for (let i = 0; i < splitGroupIdentifier.length; i++) {
    const groupName = splitGroupIdentifier[i];
    if (groupName === undefined) {
      console.warn('This point should not be reached.');
      continue;
    }

    let childGroup: RegularGroupNode | undefined =
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
  rootGroup: RootGroupNode,
): void {
  /**
   * A Map from node name to its Node.
   */
  const APINodesMap: Record<string, APINode> = {};
  /**
   * A Map from node name to its Node.
   */
  const eventNodesMap: Record<string, EventNode> = {};

  for (const singleServiceDoc of serviceDocs) {
    let group: RootGroupNode | RegularGroupNode;

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

    const newServiceDocNode: ServiceNode = {
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
        theEventNode.consumedBy.push(newServiceDocNode);
      }
    }
  }
}

function getOrCreateAPINode(
  nodeName: string,
  APINodesMap: Record<string, APINode>,
): APINode {
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
  eventNodesMap: Record<string, EventNode>,
): EventNode {
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
  groupsTree: RootGroupNode,
): RegularGroupNode | undefined {
  const splitGroupIdentifier = groupIdentifier.split('.');
  let currentGroup: RootGroupNode | RegularGroupNode = groupsTree;
  for (const identifierPart of splitGroupIdentifier) {
    const nextGroup: RegularGroupNode | undefined =
      currentGroup.childGroups[identifierPart];
    if (!nextGroup) {
      return undefined;
    }
    currentGroup = nextGroup;
  }
  return currentGroup as RegularGroupNode;
}
