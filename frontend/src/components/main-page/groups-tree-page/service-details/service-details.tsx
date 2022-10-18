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
import { useSelectedTreeItem } from '../../utils/router-utils';
import {
  ServiceDocsServiceTreeItem,
  ServiceDocsTreeItemType,
} from '../../utils/service-docs-utils';

import { Dependencies } from './dependencies';

export const ServiceDetails: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.service && (
        <Box
          sx={{
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 4,
            maxWidth: '700px',
          }}
        >
          <Typography variant="h3">Base Information</Typography>

          <List>
            <ListItem divider>
              <ListItemIcon>
                <Icons.Badge />
              </ListItemIcon>
              <ListItemText
                primary={controller.service.name}
                secondary="Name"
              />
            </ListItem>

            {controller.service.group !== undefined && (
              <ListItem divider>
                <ListItemIcon>
                  <Icons.Group />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.group}
                  secondary="Group"
                />
              </ListItem>
            )}

            {controller.service.repository !== undefined && (
              <ListItem divider>
                <ListItemIcon>
                  <Icons.Code />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.repository}
                  secondary="Repository"
                />
              </ListItem>
            )}

            {controller.service.taskBoard !== undefined && (
              <ListItem divider>
                <ListItemIcon>
                  <Icons.TaskAlt />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.taskBoard}
                  secondary="Task Board"
                />
              </ListItem>
            )}
          </List>

          <Box sx={{ marginTop: 3 }}>
            <Dependencies service={controller.service} />
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

interface Controller {
  service: ServiceDocsServiceTreeItem | undefined;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let service: ServiceDocsServiceTreeItem | undefined = undefined;
  if (
    selectedTreeItem &&
    selectedTreeItem.treeItemType === ServiceDocsTreeItemType.Service
  ) {
    service = selectedTreeItem;
  }

  return {
    service: service,
  };
}
