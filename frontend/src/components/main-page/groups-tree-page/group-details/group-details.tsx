import {
  CenterFocusStrongOutlined,
  DatasetOutlined,
  Group,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
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
      {controller.group && (
        <Box
          sx={{
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 4,
            maxWidth: '700px',
          }}
        >
          <Typography variant="h3">Group Information</Typography>

          {Object.keys(controller.group).includes('name') && (
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Badge />
                </ListItemIcon>
                <ListItemText
                  primary={(controller.group as ServiceDocsGroup).name}
                  secondary="Name"
                />
              </ListItem>
            </List>
          )}

          {Object.keys(controller.group).includes('identifier') && (
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText
                  primary={(controller.group as ServiceDocsGroup).identifier}
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
                primary={`${controller.group.services.length} Services`}
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
                primary={`${
                  Object.keys(controller.group.childGroups).length
                } Groups`}
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
