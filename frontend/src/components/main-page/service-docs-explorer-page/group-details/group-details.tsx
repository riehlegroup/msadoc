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
  RegularGroupNode,
  RootGroupNode,
  ServiceDocsTreeNodeType,
} from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';
import { DataContainer } from '../common/data-container';
import { Dependencies } from '../common/dependencies';
import { Responsibilities } from '../common/responsibilities';
import { Tags } from '../common/tags';

import { DependencyGraphCardContent } from './dependency-graph';

export const GroupDetails: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.group !== undefined && (
        <Box
          sx={{
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingX: 8,
            paddingBottom: 10,
            paddingTop: 3,
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <DataContainer>
            <Typography variant="h4">Group Information</Typography>

            <List component="div">
              {controller.group.type ===
                ServiceDocsTreeNodeType.RegularGroup && (
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

              {controller.group.type ===
                ServiceDocsTreeNodeType.RegularGroup && (
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
                  primary={`${
                    Object.keys(controller.group.childGroups).length
                  } ${
                    Object.keys(controller.group.childGroups).length === 1
                      ? 'Group'
                      : 'Groups'
                  }`}
                  secondary="Number of owned groups"
                />
              </ListItem>
            </List>
          </DataContainer>

          {controller.group.type === ServiceDocsTreeNodeType.RootGroup && (
            <DataContainer>
              <DependencyGraphCardContent />
            </DataContainer>
          )}
          <DataContainer>
            <Responsibilities showResponsibilitiesFor={controller.group} />
          </DataContainer>

          <DataContainer>
            <Responsibilities showResponsibilitiesFor={controller.group} />
          </DataContainer>

          <DataContainer>
            <Tags showTagsFor={controller.group} />
          </DataContainer>

          <DataContainer>
            <Dependencies showDependenciesFor={controller.group} />
          </DataContainer>
        </Box>
      )}
    </React.Fragment>
  );
};

interface Controller {
  group: RegularGroupNode | RootGroupNode | undefined;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let group: RegularGroupNode | RootGroupNode | undefined = undefined;
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
