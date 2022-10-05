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
      {controller.groupWithType !== undefined && (
        <Box
          sx={{
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 4,
            maxWidth: '700px',
          }}
        >
          <Typography variant="h3">Group Information</Typography>

          {controller.groupWithType.type === 'regular-group' && (
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Badge />
                </ListItemIcon>
                <ListItemText
                  primary={controller.groupWithType.group.name}
                  secondary="Name"
                />
              </ListItem>
            </List>
          )}

          {controller.groupWithType.type === 'regular-group' && (
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <Group />
                </ListItemIcon>
                <ListItemText
                  primary={controller.groupWithType.group.identifier}
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
                primary={`${controller.groupWithType.group.services.length} ${
                  controller.groupWithType.group.services.length === 1
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
                primary={`${
                  Object.keys(controller.groupWithType.group.childGroups).length
                } ${
                  Object.keys(controller.groupWithType.group.childGroups)
                    .length === 1
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

type GroupWithType = RootGroupWithType | RegularGroupWithType;
interface RootGroupWithType {
  type: 'root-group';
  group: ServiceDocsRootGroup;
}
interface RegularGroupWithType {
  type: 'regular-group';
  group: ServiceDocsGroup;
}

interface Controller {
  groupWithType: GroupWithType | undefined;
}

function useController(): Controller {
  const groupRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.group);
  const rootRouterMatch = useMatch(GROUPS_TREE_ROUTES_ABS.root);
  const serviceDocsService = useServiceDocsServiceContext();

  const groupWithType = React.useMemo((): GroupWithType | undefined => {
    if (groupRouterMatch && groupRouterMatch.params.group !== undefined) {
      const theGroup = getGroupByIdentifier(
        groupRouterMatch.params.group,
        serviceDocsService.groupsTree,
      );
      if (!theGroup) {
        return undefined;
      }
      return { type: 'regular-group', group: theGroup };
    }

    if (rootRouterMatch) {
      return { type: 'root-group', group: serviceDocsService.groupsTree };
    }

    console.warn(
      'Neither the group route nor the root route matched. This should not happen.',
    );
    return undefined;
  }, [groupRouterMatch, rootRouterMatch, serviceDocsService.groupsTree]);

  return { groupWithType: groupWithType };
}
