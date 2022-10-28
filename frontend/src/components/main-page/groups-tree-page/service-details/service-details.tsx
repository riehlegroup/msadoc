import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';

import { Icons } from '../../../../icons';
import {
  ServiceDocsTreeNodeType,
  ServiceDocsTreeServiceNode,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';

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

          <List component="div">
            <ListItem component="div" divider>
              <ListItemIcon>
                <Icons.Badge />
              </ListItemIcon>
              <ListItemText
                primary={controller.service.name}
                secondary="Name"
              />
            </ListItem>

            {controller.service.group.type ===
              ServiceDocsTreeNodeType.RegularGroup && (
              <ListItem component="div" divider>
                <ListItemIcon>
                  <Icons.Group />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.group.name}
                  secondary="Group"
                />
              </ListItem>
            )}

            {controller.service.repository !== undefined && (
              <ListItemButton
                divider
                onClick={(): void =>
                  openURLIfPossible(controller.service?.repository)
                }
              >
                <ListItemIcon>
                  <Icons.Code />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.repository}
                  secondary="Repository"
                />
              </ListItemButton>
            )}

            {controller.service.taskBoard !== undefined && (
              <ListItemButton
                divider
                onClick={(): void =>
                  openURLIfPossible(controller.service?.taskBoard)
                }
              >
                <ListItemIcon>
                  <Icons.TaskAlt />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.taskBoard}
                  secondary="Task Board"
                />
              </ListItemButton>
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
  service: ServiceDocsTreeServiceNode | undefined;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let service: ServiceDocsTreeServiceNode | undefined = undefined;
  if (
    selectedTreeItem &&
    selectedTreeItem.type === ServiceDocsTreeNodeType.Service
  ) {
    service = selectedTreeItem;
  }

  return {
    service: service,
  };
}

/**
 * If the given URL is (probably) a valid web URL, open it in a new tab.
 * Otherwise, do nothing.
 *
 * (We allow `undefined` to be passed as well, because this is needed in our template pretty often.)
 */
function openURLIfPossible(linkUrl: string | undefined): void {
  if (
    linkUrl === undefined ||
    (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://'))
  ) {
    return;
  }

  window.open(linkUrl, '_blank');
}
