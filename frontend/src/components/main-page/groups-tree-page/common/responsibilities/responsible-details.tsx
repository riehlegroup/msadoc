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
  responsible: string;

  currentServiceOrGroup: MainNode;

  close: () => void;
  goToService: (serviceName: string) => void;
}
export const ResponsibleDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog open onClose={(): void => props.close()}>
      <DialogContent sx={{ width: '500px' }}>
        <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
          Responsible Details
        </Typography>

        <Typography variant="subtitle1">
          {`Responsible "${props.responsible}" is listed in the following services.`}
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
        if (
          !service.responsibles ||
          !service.responsibles.includes(props.responsible)
        ) {
          return false;
        }

        return true;
      },
    );

    result = sortServicesByName(result);

    return result;
  }, [props.responsible, serviceDocsService.serviceDocs]);

  return {
    servicesOfInterest: servicesOfInterest,
  };
}
