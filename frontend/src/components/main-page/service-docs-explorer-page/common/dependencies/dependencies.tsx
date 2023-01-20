import {
  Alert,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Icons } from '../../../../../icons';
import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../../routes';
import {
  APINode,
  EventNode,
  MainNode,
  ServiceDocsTreeNodeType,
} from '../../../service-docs-tree';
import { getAllAPIsAndEvents } from '../../../utils/service-docs-tree-utils';

import { DependencyDetails } from './dependency-details';
import { VisualizationModal } from './visualization/visualization-modal';

interface Props {
  showDependenciesFor: MainNode;
}
export const Dependencies: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Typography variant="h4">
        {props.showDependenciesFor.type === ServiceDocsTreeNodeType.Service
          ? 'Service Dependencies'
          : 'Aggregated Dependencies'}
      </Typography>

      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="outlined"
          onClick={(): void => controller.setShowVisualization(true)}
        >
          Open Visualization
        </Button>
      </Box>

      {controller.dependencyItems.map((dependencyItem) => (
        <Box key={dependencyItem.type} sx={{ marginTop: 3 }}>
          <Typography variant="h5" component="div" sx={{ marginBottom: 2 }}>
            {dependencyItem.type === 'provided-apis' && 'Provided APIs'}
            {dependencyItem.type === 'consumed-apis' && 'Consumed APIs'}
            {dependencyItem.type === 'published-events' && 'Published Events'}
            {dependencyItem.type === 'subscribed-events' && 'Subscribed Events'}
          </Typography>

          {dependencyItem.data.length < 1 && (
            <Alert severity="info">
              {dependencyItem.type === 'provided-apis' && 'No provided APIs'}
              {dependencyItem.type === 'consumed-apis' && 'No consumed APIs'}
              {dependencyItem.type === 'published-events' &&
                'No published events'}
              {dependencyItem.type === 'subscribed-events' &&
                'No subscribed events'}
            </Alert>
          )}

          {dependencyItem.data.length > 0 && (
            <List component="div">
              {dependencyItem.data.map((apiOrEvent) => (
                <ListItemButton
                  key={apiOrEvent.name}
                  onClick={(): void =>
                    controller.showDependencyDialog(apiOrEvent)
                  }
                >
                  <ListItemIcon>
                    {dependencyItem.type === 'provided-apis' && (
                      <Icons.CloudUploadOutlined />
                    )}
                    {dependencyItem.type === 'consumed-apis' && (
                      <Icons.CloudDownloadOutlined />
                    )}
                    {dependencyItem.type === 'published-events' && (
                      <Icons.UnarchiveOutlined />
                    )}
                    {dependencyItem.type === 'subscribed-events' && (
                      <Icons.ArchiveOutlined />
                    )}
                  </ListItemIcon>
                  <ListItemText>{apiOrEvent.name}</ListItemText>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      ))}

      {controller.state.dependencyDialogData && (
        <DependencyDetails
          dependency={controller.state.dependencyDialogData}
          currentServiceOrGroup={props.showDependenciesFor}
          close={(): void => controller.hideDependencyDialog()}
          goToService={(serviceName: string): void => {
            controller.hideDependencyDialog();
            controller.goToService(serviceName);
          }}
        />
      )}

      {controller.state.showVisualization && (
        <VisualizationModal
          pivotNode={props.showDependenciesFor}
          close={(): void => controller.setShowVisualization(false)}
        />
      )}
    </React.Fragment>
  );
};

type DependencyType =
  | 'provided-apis'
  | 'consumed-apis'
  | 'published-events'
  | 'subscribed-events';
interface DependencyItem {
  type: DependencyType;
  data: APINode[] | EventNode[];
}

interface State {
  dependencyDialogData: APINode | EventNode | undefined;

  showVisualization: boolean;
}
interface Controller {
  state: State;

  dependencyItems: DependencyItem[];

  showDependencyDialog: (data: APINode | EventNode) => void;
  hideDependencyDialog: () => void;

  setShowVisualization: (show: boolean) => void;

  goToService: (serviceName: string) => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();

  const [state, setState] = React.useState<State>({
    dependencyDialogData: undefined,

    showVisualization: false,
  });

  const dataToShow = React.useMemo((): DependencyItem[] => {
    const APIsAndEvents = getAllAPIsAndEvents(props.showDependenciesFor);

    const result: DependencyItem[] = [
      {
        type: 'provided-apis',
        data: Array.from(APIsAndEvents.providedAPIs),
      },
      {
        type: 'consumed-apis',
        data: Array.from(APIsAndEvents.consumedAPIs),
      },
      {
        type: 'published-events',
        data: Array.from(APIsAndEvents.publishedEvents),
      },
      {
        type: 'subscribed-events',
        data: Array.from(APIsAndEvents.subscribedEvents),
      },
    ];

    for (const item of result) {
      sortAPIsOrEventsInPlace(item.data);
    }

    return result;
  }, [props.showDependenciesFor]);

  return {
    state: state,

    dependencyItems: dataToShow,

    showDependencyDialog: (data): void => {
      setState((state) => ({ ...state, dependencyDialogData: data }));
    },
    hideDependencyDialog: (): void => {
      setState((state) => ({ ...state, dependencyDialogData: undefined }));
    },

    setShowVisualization: (show): void => {
      setState((state) => ({ ...state, showVisualization: show }));
    },

    goToService: (serviceName: string): void => {
      navigate(
        generatePath(SERVICE_DOCS_EXPLORER_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}

/**
 * Sort the given APIs or Events by their name.
 * This function sorts in-place, i.e. it directly modifies the given array.
 */
function sortAPIsOrEventsInPlace(APIsOrEvents: APINode[] | EventNode[]): void {
  APIsOrEvents.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}
