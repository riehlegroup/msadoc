import { List } from '@mui/material';
import React from 'react';

import { useServiceDocsServiceContext } from '../../services/service-docs-service';
import { ServiceDocsRootTreeItem } from '../../utils/service-docs-utils';

import { RootItem } from './root-item';

export const Tree: React.FC = () => {
  const controller = useController();

  return (
    <List sx={{ minWidth: 'min-content' }} component="div">
      <RootItem rootGroup={controller.rootGroup} />
    </List>
  );
};

interface Controller {
  rootGroup: ServiceDocsRootTreeItem;
}
function useController(): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  return {
    rootGroup: serviceDocsService.groupsTree,
  };
}
