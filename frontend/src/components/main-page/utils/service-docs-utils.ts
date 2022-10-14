import { GetServiceDocResponse } from 'msadoc-client';

export enum ServiceDocsTreeItemType {
  Service,
  RegularGroup,
  RootGroup,
}

export type ServiceDocsTreeItem =
  | ServiceDocsRootTreeItem
  | ServiceDocsRegularGroupTreeItem
  | ServiceDocsServiceTreeItem;

export type ServiceDocsServiceTreeItem = GetServiceDocResponse & {
  treeItemType: ServiceDocsTreeItemType.Service;
};

export interface ServiceDocsRegularGroupTreeItem {
  treeItemType: ServiceDocsTreeItemType.RegularGroup;

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
  childGroups: { [groupName: string]: ServiceDocsRegularGroupTreeItem };

  /**
   * The services that belong to this group.
   */
  services: ServiceDocsServiceTreeItem[];
}
// Basically the same as a regular group, but without a name or identifier.
export type ServiceDocsRootTreeItem = Omit<
  ServiceDocsRegularGroupTreeItem,
  'name' | 'identifier' | 'treeItemType'
> & {
  treeItemType: ServiceDocsTreeItemType.RootGroup;
};

export function buildGroupsTree(
  serviceDocs: ServiceDocsServiceTreeItem[],
): ServiceDocsRootTreeItem {
  const rootGroup: ServiceDocsRootTreeItem = {
    treeItemType: ServiceDocsTreeItemType.RootGroup,
    childGroups: {},
    services: [],
  };

  for (const singleServiceDoc of serviceDocs) {
    let group: ServiceDocsRootTreeItem | ServiceDocsRegularGroupTreeItem =
      rootGroup;

    // By default, we add the service to the root group. But if the service has the `group` attribute, then we want to add it to this specified group instead.
    if (singleServiceDoc.group !== undefined) {
      group = addGroupIfNotExists(singleServiceDoc.group, rootGroup);
    }

    group.services.push({
      ...singleServiceDoc,
      treeItemType: ServiceDocsTreeItemType.Service,
    });
  }

  return rootGroup;
}

export function getGroupByIdentifier(
  groupIdentifier: string,
  groupsTree: ServiceDocsRootTreeItem,
): ServiceDocsRegularGroupTreeItem | undefined {
  const splitGroupIdentifier = groupIdentifier.split('.');
  let currentGroup: ServiceDocsRootTreeItem | ServiceDocsRegularGroupTreeItem =
    groupsTree;
  for (const identifierPart of splitGroupIdentifier) {
    const nextGroup: ServiceDocsRegularGroupTreeItem | undefined =
      currentGroup.childGroups[identifierPart];
    if (!nextGroup) {
      return undefined;
    }
    currentGroup = nextGroup;
  }
  return currentGroup as ServiceDocsRegularGroupTreeItem;
}

function addGroupIfNotExists(
  groupIdentifier: string,
  rootGroup: ServiceDocsRootTreeItem,
): ServiceDocsRegularGroupTreeItem | ServiceDocsRootTreeItem {
  const splitGroupIdentifier = groupIdentifier.split('.');
  if (splitGroupIdentifier[0] === undefined) {
    console.warn('This point should not be reached.');
    return rootGroup;
  }
  let currentGroup: ServiceDocsRootTreeItem | ServiceDocsRegularGroupTreeItem =
    rootGroup;
  for (let i = 0; i < splitGroupIdentifier.length; i++) {
    const groupName = splitGroupIdentifier[i];
    if (groupName === undefined) {
      console.warn('This point should not be reached.');
      continue;
    }

    let childGroup: ServiceDocsRegularGroupTreeItem | undefined =
      currentGroup.childGroups[groupName];
    if (!childGroup) {
      const identifier = splitGroupIdentifier.slice(0, i + 1).join('.');
      childGroup = {
        treeItemType: ServiceDocsTreeItemType.RegularGroup,
        name: groupName,
        identifier: identifier,
        childGroups: {},
        services: [],
      };
      currentGroup.childGroups[groupName] = childGroup;
    }

    currentGroup = childGroup;
  }

  return currentGroup;
}
