import { GetServiceDocResponse } from 'msadoc-client';

export interface ServiceDocsGroup {
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
  childGroups: { [groupName: string]: ServiceDocsGroup };

  /**
   * The services that belong to this group.
   */
  services: GetServiceDocResponse[];
}
export type ServiceDocsRootGroup = Omit<
  ServiceDocsGroup,
  'name' | 'identifier'
>;

export function buildGroupsTree(
  serviceDocs: GetServiceDocResponse[],
): ServiceDocsRootGroup {
  const rootGroup: ServiceDocsRootGroup = {
    childGroups: {},
    services: [],
  };

  for (const singleServiceDoc of serviceDocs) {
    let group = rootGroup;

    // By default, we add the service to the root group. But if the service has the `group` attribute, then we want to add it to this specified group instead.
    if (singleServiceDoc.group !== undefined) {
      group = addGroupIfNotExists(singleServiceDoc.group, rootGroup);
    }

    group.services.push(singleServiceDoc);
  }

  return rootGroup;
}

export function getGroupByIdentifier(
  groupIdentifier: string,
  groupsTree: ServiceDocsRootGroup,
): ServiceDocsGroup | undefined {
  const splitGroupIdentifier = groupIdentifier.split('.');
  let currentGroup = groupsTree;
  for (const identifierPart of splitGroupIdentifier) {
    const nextGroup = currentGroup.childGroups[identifierPart];
    if (!nextGroup) {
      return undefined;
    }
    currentGroup = nextGroup;
  }
  return currentGroup as ServiceDocsGroup;
}

function addGroupIfNotExists(
  groupIdentifier: string,
  rootGroup: ServiceDocsRootGroup,
): ServiceDocsGroup | ServiceDocsRootGroup {
  const splitGroupIdentifier = groupIdentifier.split('.');
  if (splitGroupIdentifier[0] === undefined) {
    // This should not happen.
    return rootGroup;
  }
  let currentGroup = rootGroup;
  for (let i = 0; i < splitGroupIdentifier.length; i++) {
    const groupName = splitGroupIdentifier[i];
    if (groupName === undefined) {
      // This should not happen.
      continue;
    }

    let childGroup = currentGroup.childGroups[groupName];
    if (!childGroup) {
      const identifier = splitGroupIdentifier.slice(0, i + 1).join('.');
      childGroup = {
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
