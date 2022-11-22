import {
  Alert,
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
import { ServiceDocsTreeNodeType, ServiceNode } from '../../service-docs-tree';
import { useSelectedTreeItem } from '../../utils/router-utils';
import { DataContainer } from '../common/data-container';
import { Dependencies } from '../common/dependencies';
import { Responsibilities } from '../common/responsibilities';
import { Tags } from '../common/tags';

export const ServiceDetails: React.FC = () => {
  const controller = useController();

  return (
    <React.Fragment>
      {controller.service && (
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
            <Typography variant="h4">Base Information</Typography>

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
                    primary={controller.service.group.identifier}
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
          </DataContainer>

          <DataContainer>
            <Typography variant="h4">Documentation</Typography>

            {controller.service.developmentDocumentation === undefined &&
            controller.service.deploymentDocumentation === undefined &&
            controller.service.apiDocumentation === undefined ? (
              <Alert severity="info" sx={{ marginTop: 2 }}>
                No documentation URLs defined
              </Alert>
            ) : (
              <List component="div">
                {controller.service.developmentDocumentation !== undefined && (
                  <ListItemButton
                    divider
                    onClick={(): void =>
                      openURLIfPossible(
                        controller.service?.developmentDocumentation,
                      )
                    }
                  >
                    <ListItemIcon>
                      <Icons.IntegrationInstructions />
                    </ListItemIcon>
                    <ListItemText
                      primary={controller.service.developmentDocumentation}
                      secondary="Development Documentation"
                    />
                  </ListItemButton>
                )}
                {controller.service.deploymentDocumentation !== undefined && (
                  <ListItemButton
                    divider
                    onClick={(): void =>
                      openURLIfPossible(
                        controller.service?.deploymentDocumentation,
                      )
                    }
                  >
                    <ListItemIcon>
                      <Icons.CloudUpload />
                    </ListItemIcon>
                    <ListItemText
                      primary={controller.service.deploymentDocumentation}
                      secondary="Deployment Documentation"
                    />
                  </ListItemButton>
                )}

                {controller.service.apiDocumentation !== undefined && (
                  <ListItemButton
                    divider
                    onClick={(): void =>
                      openURLIfPossible(controller.service?.apiDocumentation)
                    }
                  >
                    <ListItemIcon>
                      <Icons.Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary={controller.service.apiDocumentation}
                      secondary="API Documentation"
                    />
                  </ListItemButton>
                )}
              </List>
            )}
          </DataContainer>

          <DataContainer>
            <Tags showTagsFor={controller.service} />
          </DataContainer>

          <DataContainer>
            <Responsibilities showResponsibilitiesFor={controller.service} />
          </DataContainer>

          <DataContainer>
            <Dependencies showDependenciesFor={controller.service} />
          </DataContainer>
        </Box>
      )}
    </React.Fragment>
  );
};

interface Controller {
  service: ServiceNode | undefined;
}
function useController(): Controller {
  const selectedTreeItem = useSelectedTreeItem();

  let service: ServiceNode | undefined = undefined;
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
