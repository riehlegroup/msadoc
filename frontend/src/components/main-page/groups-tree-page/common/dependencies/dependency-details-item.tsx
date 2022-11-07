import {
  Alert,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';

import { Icons } from '../../../../../icons';
import {
  APINode,
  EventNode,
  MainNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../service-docs-tree';
import { sortServicesByName } from '../../../utils/service-docs-tree-utils';

interface BaseProps {
  currentServiceOrGroup: MainNode;

  goToService: (serviceName: string) => void;
}
interface APINodeProps extends BaseProps {
  dependency: APINode;
  mode: 'providers' | 'consumers';
}
interface EventNodeProps extends BaseProps {
  dependency: EventNode;
  mode: 'publishers' | 'subscribers';
}
type Props = APINodeProps | EventNodeProps;
export const DependencyDetailsItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Box sx={{ marginY: 2 }}>
      <Typography variant="h5">
        {props.dependency.type === ServiceDocsTreeNodeType.API &&
          props.mode === 'providers' &&
          'Providers'}
        {props.dependency.type === ServiceDocsTreeNodeType.Event &&
          props.mode === 'publishers' &&
          'Publishers'}
        {props.dependency.type === ServiceDocsTreeNodeType.API &&
          props.mode === 'consumers' &&
          'Consumers'}
        {props.dependency.type === ServiceDocsTreeNodeType.Event &&
          props.mode === 'subscribers' &&
          'Subscribers'}
      </Typography>

      {controller.servicesOfInterest.length < 1 && (
        <Alert severity="info" sx={{ marginTop: 1 }}>
          {props.dependency.type === ServiceDocsTreeNodeType.API &&
            props.mode === 'providers' &&
            'No Providers'}
          {props.dependency.type === ServiceDocsTreeNodeType.Event &&
            props.mode === 'publishers' &&
            'No Publishers'}
          {props.dependency.type === ServiceDocsTreeNodeType.API &&
            props.mode === 'consumers' &&
            'No Consumers'}
          {props.dependency.type === ServiceDocsTreeNodeType.Event &&
            props.mode === 'subscribers' &&
            'No Subscribers'}
        </Alert>
      )}

      {controller.servicesOfInterest.length > 0 && (
        <List>
          {controller.servicesOfInterest.map((service) => (
            <ListItemButton
              key={service.name}
              disabled={
                props.currentServiceOrGroup.type ===
                  ServiceDocsTreeNodeType.Service &&
                service === props.currentServiceOrGroup
              }
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
    </Box>
  );
};

interface Controller {
  servicesOfInterest: ServiceNode[];
}
function useController(props: Props): Controller {
  const servicesOfInterest = React.useMemo((): ServiceNode[] => {
    if (props.dependency.type === ServiceDocsTreeNodeType.API) {
      if (props.mode === 'providers') {
        return props.dependency.providedBy;
      }

      return props.dependency.consumedBy;
    }

    if (props.mode === 'publishers') {
      return props.dependency.publishedBy;
    }

    return props.dependency.subscribedBy;
  }, [props.dependency, props.mode]);

  const sortedServicesOfInterest = React.useMemo((): ServiceNode[] => {
    return sortServicesByName(servicesOfInterest);
  }, [servicesOfInterest]);

  return {
    servicesOfInterest: sortedServicesOfInterest,
  };
}
