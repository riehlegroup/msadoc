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
  mode: 'producers' | 'consumers';
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
        {props.dependency.type === ServiceDocsTreeNodeType.API &&
          props.mode === 'producers' &&
          'Producers'}
        {props.mode === 'consumers' && 'Consumers'}
      </Typography>

      {controller.servicesOfInterest.length < 1 && (
        <Alert severity="info" sx={{ marginTop: 1 }}>
          {props.dependency.type === ServiceDocsTreeNodeType.API &&
            props.mode === 'providers' &&
            'No Providers'}
          {props.dependency.type === ServiceDocsTreeNodeType.API &&
            props.mode === 'producers' &&
            'No Producers'}
          {props.mode === 'consumers' && 'No Consumers'}
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

    if (props.mode === 'producers') {
      return props.dependency.producedBy;
    }

    return props.dependency.consumedBy;
  }, [props.dependency, props.mode]);

  const sortedServicesOfInterest = React.useMemo((): ServiceNode[] => {
    const result = [...servicesOfInterest];

    sortServicesInPlace(result);

    return result;
  }, [servicesOfInterest]);

  return {
    servicesOfInterest: sortedServicesOfInterest,
  };
}

/**
 * Sort the given Services by their name.
 * This function sorts in-place, i.e. it directly modifies the given array.
 */
function sortServicesInPlace(services: ServiceNode[]): void {
  services.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
}
