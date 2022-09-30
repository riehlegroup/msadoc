import { Badge, Code, Group, TaskAlt } from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { GetServiceDocResponse } from 'msadoc-client';
import React from 'react';
import { useMatch } from 'react-router-dom';

import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';

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
                <Badge />
              </ListItemIcon>
              <ListItemText
                primary={controller.service.name}
                secondary="Name"
              />
            </ListItem>

            {controller.service.group !== undefined && (
              <ListItem divider>
                <ListItemIcon>
                  <Group />
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
                  <Code />
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
                  <TaskAlt />
                </ListItemIcon>
                <ListItemText
                  primary={controller.service.taskBoard}
                  secondary="Task Board"
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}
    </React.Fragment>
  );
};

interface Controller {
  service: GetServiceDocResponse | undefined;
}
function useController(): Controller {
  const routerMatch = useMatch(GROUPS_TREE_ROUTES_ABS.service);

  const serviceDocsService = useServiceDocsServiceContext();

  const service = React.useMemo((): GetServiceDocResponse | undefined => {
    if (!routerMatch || routerMatch.params.service === undefined) {
      console.warn(
        'The service route was not matched. This should not happen.',
      );
      return undefined;
    }

    return serviceDocsService.serviceDocs.find((item) => {
      if (item.name !== routerMatch.params.service) {
        return false;
      }
      return true;
    });
  }, [routerMatch, serviceDocsService.serviceDocs]);

  return {
    service: service,
  };
}
