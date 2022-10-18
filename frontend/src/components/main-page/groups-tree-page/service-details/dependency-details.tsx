import {
  Alert,
  Dialog,
  DialogContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';

import { Icons } from '../../../../icons';
import { useServiceDocsServiceContext } from '../../services/service-docs-service';
import { ServiceDocsServiceTreeItem } from '../../utils/service-docs-utils';

interface Props {
  dependencyType: 'api' | 'event';
  dependencyName: string;

  currentService: ServiceDocsServiceTreeItem;

  close: () => void;
  goToService: (serviceName: string) => void;
}
export const DependencyDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog open onClose={(): void => props.close()}>
      <DialogContent sx={{ width: '500px' }}>
        <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
          {props.dependencyType === 'api' ? 'API Details' : 'Event Details'}
        </Typography>

        <Typography variant="subtitle1">
          {props.dependencyType === 'api'
            ? `API "${props.dependencyName}" has the following Providers and Consumers.`
            : `Event "${props.dependencyName}" has the following Producers and Consumers.`}
        </Typography>

        {controller.detailsItems.map((detailsDataItem) => (
          <React.Fragment key={detailsDataItem.type}>
            <Typography variant="h5" sx={{ marginTop: 2 }}>
              {detailsDataItem.type === 'providers-or-producers' &&
                props.dependencyType === 'api' &&
                'Providers'}
              {detailsDataItem.type === 'providers-or-producers' &&
                props.dependencyType === 'event' &&
                'Producers'}
              {detailsDataItem.type === 'consumers' && 'Consumers'}
            </Typography>

            {detailsDataItem.services.length < 1 && (
              <Alert severity="info" sx={{ marginTop: 1 }}>
                {detailsDataItem.type === 'providers-or-producers' &&
                  props.dependencyType === 'api' &&
                  'No Providers'}
                {detailsDataItem.type === 'providers-or-producers' &&
                  props.dependencyType === 'event' &&
                  'No Producers'}
                {detailsDataItem.type === 'consumers' && 'No Consumers'}
              </Alert>
            )}

            {detailsDataItem.services.length > 0 && (
              <List>
                {detailsDataItem.services.map((service) => (
                  <ListItemButton
                    key={service.name}
                    disabled={service.name === props.currentService.name}
                    onClick={(): void => props.goToService(service.name)}
                  >
                    <ListItemIcon>
                      <Icons.CenterFocusStrongOutlined />
                    </ListItemIcon>
                    <ListItemText>{service.name}</ListItemText>
                  </ListItemButton>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </DialogContent>
    </Dialog>
  );
};

interface DetailsItem {
  type: 'providers-or-producers' | 'consumers';
  services: ServiceDocsServiceTreeItem[];
}

interface Controller {
  detailsItems: DetailsItem[];
}
function useController(props: Props): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const [providingServices, consumingServices] = React.useMemo((): [
    ServiceDocsServiceTreeItem[],
    ServiceDocsServiceTreeItem[],
  ] => {
    const providingServices: ServiceDocsServiceTreeItem[] = [];
    const consumingServices: ServiceDocsServiceTreeItem[] = [];

    for (const singleService of serviceDocsService.serviceDocs) {
      if (props.dependencyType === 'api') {
        if (
          singleService.providedAPIs &&
          singleService.providedAPIs.includes(props.dependencyName)
        ) {
          providingServices.push(singleService);
        }
        if (
          singleService.consumedAPIs &&
          singleService.consumedAPIs.includes(props.dependencyName)
        ) {
          consumingServices.push(singleService);
        }

        continue;
      }

      if (
        singleService.producedEvents &&
        singleService.producedEvents.includes(props.dependencyName)
      ) {
        providingServices.push(singleService);
      }
      if (
        singleService.consumedEvents &&
        singleService.consumedEvents.includes(props.dependencyName)
      ) {
        consumingServices.push(singleService);
      }
    }

    return [providingServices, consumingServices];
  }, [
    props.dependencyName,
    props.dependencyType,
    serviceDocsService.serviceDocs,
  ]);

  const detailsData: DetailsItem[] = [
    {
      type: 'providers-or-producers',
      services: providingServices,
    },
    { type: 'consumers', services: consumingServices },
  ];

  return {
    detailsItems: detailsData,
  };
}
