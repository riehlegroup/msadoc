import {
  Dialog,
  DialogContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';

import { Icons } from '../../../../../icons';
import {
  MainNode,
  ServiceDocsTreeNodeType,
  ServiceNode,
} from '../../../service-docs-tree';
import { useServiceDocsServiceContext } from '../../../services/service-docs-service';
import { sortServicesByName } from '../../../utils/service-docs-tree-utils';

interface Props {
  team: string;

  currentServiceOrGroup: MainNode;

  close: () => void;
  goToService: (serviceName: string) => void;
}
export const TeamDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog open onClose={(): void => props.close()}>
      <DialogContent sx={{ width: '500px' }}>
        <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
          Team Details
        </Typography>

        <Typography variant="subtitle1">
          {`Team "${props.team}" is listed in the following services.`}
        </Typography>

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
      </DialogContent>
    </Dialog>
  );
};

interface Controller {
  servicesOfInterest: ServiceNode[];
}
function useController(props: Props): Controller {
  const serviceDocsService = useServiceDocsServiceContext();

  const servicesOfInterest = React.useMemo((): ServiceNode[] => {
    let result: ServiceNode[] = serviceDocsService.serviceDocs.filter(
      (service) => {
        if (service.responsibleTeam === props.team) {
          return true;
        }

        return false;
      },
    );

    result = sortServicesByName(result);

    return result;
  }, [props.team, serviceDocsService.serviceDocs]);

  return {
    servicesOfInterest: servicesOfInterest,
  };
}
