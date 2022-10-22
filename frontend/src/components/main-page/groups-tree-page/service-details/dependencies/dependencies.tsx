import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Icons } from '../../../../../icons';
import { GROUPS_TREE_ROUTES_ABS } from '../../../../../routes';
import { ServiceDocsServiceTreeItem } from '../../../utils/service-docs-utils';

import { DependencyDetails } from './dependency-details';
import { VisualizationModal } from './visualization/visualization-modal';

interface Props {
  service: ServiceDocsServiceTreeItem;
}
export const Dependencies: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Typography variant="h3">Dependencies</Typography>

      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="outlined"
          onClick={(): void => controller.setShowVisualization(true)}
        >
          Open Visualization
        </Button>
      </Box>

      {controller.dependencyItems.map((dependencyItem) => (
        <Card key={dependencyItem.type} sx={{ marginTop: 3 }}>
          <CardContent>
            <Typography variant="h5" component="div" sx={{ marginBottom: 2 }}>
              {dependencyItem.type === 'provided-apis' && 'Provided APIs'}
              {dependencyItem.type === 'consumed-apis' && 'Consumed APIs'}
              {dependencyItem.type === 'produced-events' && 'Produced Events'}
              {dependencyItem.type === 'consumed-events' && 'Consumed Events'}
            </Typography>

            {dependencyItem.data.length < 1 && (
              <Alert severity="info">
                {dependencyItem.type === 'provided-apis' && 'No provided APIs'}
                {dependencyItem.type === 'consumed-apis' && 'No consumed APIs'}
                {dependencyItem.type === 'produced-events' &&
                  'No produced Events'}
                {dependencyItem.type === 'consumed-events' &&
                  'No consumed Events'}
              </Alert>
            )}

            {dependencyItem.data.length > 0 && (
              <List component="div">
                {dependencyItem.data.map((apiOrEventName) => (
                  <ListItemButton
                    key={apiOrEventName}
                    onClick={(): void =>
                      controller.showDependencyDialog({
                        dependencyType: dependencyItem.type,
                        itemName: apiOrEventName,
                      })
                    }
                  >
                    <ListItemIcon>
                      {dependencyItem.type === 'provided-apis' && (
                        <Icons.CloudUploadOutlined />
                      )}
                      {dependencyItem.type === 'consumed-apis' && (
                        <Icons.CloudDownloadOutlined />
                      )}
                      {dependencyItem.type === 'produced-events' && (
                        <Icons.UnarchiveOutlined />
                      )}
                      {dependencyItem.type === 'consumed-events' && (
                        <Icons.ArchiveOutlined />
                      )}
                    </ListItemIcon>
                    <ListItemText>{apiOrEventName}</ListItemText>
                  </ListItemButton>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      ))}

      {controller.state.dependencyDialogData && (
        <DependencyDetails
          dependencyType={
            controller.state.dependencyDialogData.dependencyType ===
              'provided-apis' ||
            controller.state.dependencyDialogData.dependencyType ===
              'consumed-apis'
              ? 'api'
              : 'event'
          }
          dependencyName={controller.state.dependencyDialogData.itemName}
          currentService={props.service}
          close={(): void => controller.hideDependencyDialog()}
          goToService={(serviceName: string): void => {
            controller.hideDependencyDialog();
            controller.goToService(serviceName);
          }}
        />
      )}

      {controller.state.showVisualization && (
        <VisualizationModal
          pivotService={props.service}
          close={(): void => controller.setShowVisualization(false)}
        />
      )}
    </React.Fragment>
  );
};

type DependencyType =
  | 'provided-apis'
  | 'consumed-apis'
  | 'produced-events'
  | 'consumed-events';
interface DependencyItem {
  type: DependencyType;
  data: string[];
}

interface DependencyDialogData {
  dependencyType: DependencyType;
  itemName: string;
}

interface State {
  dependencyDialogData: DependencyDialogData | undefined;

  showVisualization: boolean;
}
interface Controller {
  state: State;

  dependencyItems: DependencyItem[];

  showDependencyDialog: (data: DependencyDialogData) => void;
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

  const dataToShow: DependencyItem[] = [
    {
      type: 'provided-apis',
      data: props.service.providedAPIs ?? [],
    },
    {
      type: 'consumed-apis',
      data: props.service.consumedAPIs ?? [],
    },
    {
      type: 'produced-events',
      data: props.service.producedEvents ?? [],
    },
    {
      type: 'consumed-events',
      data: props.service.consumedEvents ?? [],
    },
  ];

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
        generatePath(GROUPS_TREE_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}
