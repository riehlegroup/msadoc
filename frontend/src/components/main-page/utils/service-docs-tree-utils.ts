import {
  ServiceDocsTreeRegularGroup,
  ServiceDocsTreeRootNode,
  ServiceDocsTreeServiceNode,
} from '../service-docs-tree';

export function isGroupXDescendantOfGroupY(params: {
  xGroup: ServiceDocsTreeRegularGroup;
  yGroup: ServiceDocsTreeRegularGroup;
}): boolean {
  /*  
    A trick: We use the identifiers of the two groups in order to determine whether X is the descendant of Y.

    Example: 
    `XIdentifier`: "foo.bar.baz"
    `YIdentifier`: "foo.bar"

    Now, we simply check if `XIdentifier` starts with `YIdentifier`.

    There is one edge case. Imagine the following:
    `XIdentifier`: "foo.bars"
    `YIdentifier`: "foo.bar"
    Now, the check would return `true`, because `XIdentifier` starts with `YIdentifier`.
    Because of this, we add a group delimiter (".") to `YIdentifier` before checking.
  */

  const yIdentifierForChecking = params.yGroup.identifier + '.';

  if (params.xGroup.identifier.startsWith(yIdentifierForChecking)) {
    return true;
  }
  return false;
}

export function extractAllServices(
  group: ServiceDocsTreeRegularGroup | ServiceDocsTreeRootNode,
): ServiceDocsTreeServiceNode[] {
  const result: ServiceDocsTreeServiceNode[] = [...group.services];

  for (const singleChildGroup of Object.values(group.childGroups)) {
    const recursivelyExtractedServices = extractAllServices(singleChildGroup);
    result.push(...recursivelyExtractedServices);
  }

  return result;
}
