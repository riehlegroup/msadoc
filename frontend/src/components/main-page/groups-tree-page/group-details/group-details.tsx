import {
  Badge,
  CenterFocusStrongOutlined,
  DatasetOutlined,
  Group,
} from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';

import { useSelectedTreeItem } from '../../utils/router-utils';
import {
  ServiceDocsRegularGroupTreeItem,
  ServiceDocsRootTreeItem,
  ServiceDocsTreeItemType,
} from '../../utils/service-docs-utils';

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

          {controller.group.treeItemType ===
            ServiceDocsTreeItemType.RegularGroup && (
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Badge />
                </ListItemIcon>
                <ListItemText
                  primary={controller.group.name}
                  secondary="Name"
                />
              </ListItem>
            </List>
          )}

          {controller.group.treeItemType ===
            ServiceDocsTreeItemType.RegularGroup && (
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText
                  primary={controller.group.identifier}
                  secondary="Full identifier"
                />
              </ListItem>
            </List>
          )}

          <List>
            <ListItem divider>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <CenterFocusStrongOutlined />
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
          </List>

          <List>
            <ListItem divider>
              <ListItemIcon sx={{ color: 'inherit' }}>
                <DatasetOutlined />
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
  group: ServiceDocsRegularGroupTreeItem | ServiceDocsRootTreeItem | undefined;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let group:
    | ServiceDocsRegularGroupTreeItem
    | ServiceDocsRootTreeItem
    | undefined = undefined;
  if (
    selectedTreeItem &&
    (selectedTreeItem.treeItemType === ServiceDocsTreeItemType.RootGroup ||
      selectedTreeItem.treeItemType === ServiceDocsTreeItemType.RegularGroup)
  ) {
    group = selectedTreeItem;
  }

  return {
    group: group,
  };
}
