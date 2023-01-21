import { List } from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router';

import { Icons } from '../../../../../icons';
import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../../routes';
import { ServiceNode } from '../../../service-docs-tree';
import { NavigatorListItemButton } from '../common/navigator-list-item-button';
import { ServiceItem } from '../common/service-item';

export interface ResponsibleWithServiceDocs {
  responsibleName: string;
  correspondingServiceDocs: ServiceNode[];
}

interface Props {
  responsible: ResponsibleWithServiceDocs;
}
export const SingleResponsible: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <NavigatorListItemButton
        icon={
          controller.state.isCollapsed ? (
            <Icons.ChevronRight />
          ) : (
            <Icons.ExpandMore />
          )
        }
        text={props.responsible.responsibleName}
        onClick={(): void => controller.toggleIsCollapsed()}
      />

      {!controller.state.isCollapsed && (
        <List component="div" disablePadding>
          {controller.sortedServiceDocs.map((serviceDoc) => (
            <ServiceItem
              key={serviceDoc.name}
              service={serviceDoc}
              indent={1}
              autoScrollIntoView={false}
            />
          ))}
        </List>
      )}
    </React.Fragment>
  );
};

interface State {
  isCollapsed: boolean;
}
interface Controller {
  state: State;

  sortedServiceDocs: ServiceNode[];

  toggleIsCollapsed: () => void;
  navigateToService: (serviceName: string) => void;
}
function useController(props: Props): Controller {
  const navigate = useNavigate();

  const [state, setState] = React.useState<State>({
    isCollapsed: true,
  });

  const sortedServiceDocs = React.useMemo((): ServiceNode[] => {
    const result = [...props.responsible.correspondingServiceDocs];
    result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [props.responsible.correspondingServiceDocs]);

  return {
    state: state,

    sortedServiceDocs: sortedServiceDocs,

    toggleIsCollapsed: (): void => {
      setState((state) => ({ ...state, isCollapsed: !state.isCollapsed }));
    },
    navigateToService: (serviceName): void => {
      navigate(
        generatePath(SERVICE_DOCS_EXPLORER_ROUTES_ABS.service, {
          service: serviceName,
        }),
      );
    },
  };
}
