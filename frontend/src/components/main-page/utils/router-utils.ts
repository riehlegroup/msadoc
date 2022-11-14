import React from 'react';
import { useMatch } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../routes';
import {
  MainNode,
  ServiceNode,
  getGroupByIdentifier,
} from '../service-docs-tree';
import { useServiceDocsServiceContext } from '../services/service-docs-service';

/**
 * Get the selected Tree Item using the Router.
 */
export function useSelectedTreeItem(): MainNode | undefined {
  const serviceRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.service);
  const groupRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.group);
  const rootRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.root);
  const serviceDocsService = useServiceDocsServiceContext();

  const result = React.useMemo((): MainNode | undefined => {
    if (serviceRouterMatch && serviceRouterMatch.params.service !== undefined) {
      return getServiceByName(
        serviceRouterMatch.params.service,
        serviceDocsService.serviceDocs,
      );
    }

    if (groupRouterMatch && groupRouterMatch.params.group !== undefined) {
      return getGroupByIdentifier(
        groupRouterMatch.params.group,
        serviceDocsService.groupsTree,
      );
    }
    if (rootRouterMatch) {
      return serviceDocsService.groupsTree;
    }
    return undefined;
  }, [
    groupRouterMatch,
    rootRouterMatch,
    serviceDocsService.groupsTree,
    serviceDocsService.serviceDocs,
    serviceRouterMatch,
  ]);

  return result;
}

function getServiceByName(
  serviceName: string,
  allServices: ServiceNode[],
): ServiceNode | undefined {
  return allServices.find((item) => {
    if (item.name === serviceName) {
      return true;
    }
    return false;
  });
}
