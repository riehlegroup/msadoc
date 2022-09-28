import React from 'react';
import { useMatch } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';
import {
  ServiceDocsGroup,
  ServiceDocsRootGroup,
  getGroupByIdentifier,
} from '../../utils/service-docs-utils';

export const GroupDetails: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      Group Details {JSON.stringify(controller.group)}
    </React.Fragment>
  );
};

interface Controller {
  group: ServiceDocsRootGroup | ServiceDocsGroup | undefined;
}
function useController(): Controller {
  const groupRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.group);
  const rootRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.root);

  const serviceDocsService = useServiceDocsServiceContext();

  const group = React.useMemo(():
    | ServiceDocsRootGroup
    | ServiceDocsGroup
    | undefined => {
    if (groupRouterMatch && groupRouterMatch.params.group !== undefined) {
      return getGroupByIdentifier(
        groupRouterMatch.params.group,
        serviceDocsService.groupsTree,
      );
    }
    if (rootRouterMatch) {
      return serviceDocsService.groupsTree;
    }

    console.warn(
      'Neither the group route nor the root route matched. This should not happen.',
    );
    return undefined;
  }, [groupRouterMatch, rootRouterMatch, serviceDocsService.groupsTree]);

  return {
    group: group,
  };
}
