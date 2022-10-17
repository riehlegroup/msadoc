import {
  ArchiveOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  UnarchiveOutlined,
} from '@mui/icons-material';
import {
  Alert,
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

import { GROUPS_TREE_ROUTES_ABS } from '../../../../routes';
import { ServiceDocsServiceTreeItem } from '../../utils/service-docs-utils';

import { DependencyDetails } from './dependency-details';

interface Props {
  service: ServiceDocsServiceTreeItem;
}
export const Dependencies: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Typography variant="h3">Dependencies</Typography>

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
                        <CloudUploadOutlined />
                      )}
                      {dependencyItem.type === 'consumed-apis' && (
                        <CloudDownloadOutlined />
                      )}
                      {dependencyItem.type === 'produced-events' && (
                        <UnarchiveOutlined />
                      )}
                      {dependencyItem.type === 'consumed-events' && (
                        <ArchiveOutlined />
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
}
interface Controller {
  state: State;

  dependencyItems: DependencyItem[];

  showDependencyDialog: (data: DependencyDialogData) => void;
  hideDependencyDialog: () => void;
  goToService: (serviceName: string) => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();

  const [state, setState] = React.useState<State>({
    dependencyDialogData: undefined,
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
    goToService: (serviceName: string): void => {
      navigate(
        generatePath(GROUPS_TREE_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}
