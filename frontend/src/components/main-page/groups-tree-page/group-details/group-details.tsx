import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';

import { Icons } from '../../../../icons';
import {
  ServiceDocsTreeNodeType,
  ServiceDocsTreeRegularGroup,
  ServiceDocsTreeRootNode,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';

export const GroupDetails: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.group !== undefined && (
        <Box
          sx={{
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 4,
            maxWidth: '700px',
          }}
        >
          <Typography variant="h3">Group Information</Typography>

          <List component="div">
            {controller.group.type === ServiceDocsTreeNodeType.RegularGroup && (
              <ListItem component="div" divider>
                <ListItemIcon>
                  <Icons.Badge />
                </ListItemIcon>
                <ListItemText
                  primary={controller.group.name}
                  secondary="Name"
                />
              </ListItem>
            )}

            {controller.group.type === ServiceDocsTreeNodeType.RegularGroup && (
              <ListItem component="div" divider>
                <ListItemIcon>
                  <Icons.Group />
                </ListItemIcon>
                <ListItemText
                  primary={controller.group.identifier}
                  secondary="Full identifier"
                />
              </ListItem>
            )}

            <ListItem component="div" divider>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Icons.CenterFocusStrongOutlined />
              </ListItemIcon>
              <ListItemText
                primary={`${controller.group.services.length} ${
                  controller.group.services.length === 1
                    ? 'Service'
                    : 'Services'
                }`}
                secondary="Number of owned services"
              />
            </ListItem>

            <ListItem component="div" divider>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Icons.DatasetOutlined />
              </ListItemIcon>
              <ListItemText
                primary={`${Object.keys(controller.group.childGroups).length} ${
                  Object.keys(controller.group.childGroups).length === 1
                    ? 'Group'
                    : 'Groups'
                }`}
                secondary="Number of owned groups"
              />
            </ListItem>
          </List>
        </Box>
      )}
    </React.Fragment>
  );
};

interface Controller {
  group: ServiceDocsTreeRegularGroup | ServiceDocsTreeRootNode | undefined;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let group: ServiceDocsTreeRegularGroup | ServiceDocsTreeRootNode | undefined =
    undefined;
  if (
    selectedTreeItem &&
    (selectedTreeItem.type === ServiceDocsTreeNodeType.RootGroup ||
      selectedTreeItem.type === ServiceDocsTreeNodeType.RegularGroup)
  ) {
    group = selectedTreeItem;
  }

  return {
    group: group,
  };
}
