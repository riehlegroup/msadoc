import { List } from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router';

import { Icons } from '../../../../../icons';
import { SERVICE_DOCS_EXPLORER_ROUTES_ABS } from '../../../../../routes';
import { merge } from '../../../../../utils/merge';
import { ServiceNode } from '../../../service-docs-tree';
import { NavigatorListItemButton } from '../common/navigator-list-item-button';
import { ServiceItem } from '../common/service-item';

interface Props {
  /**
   * The name of the Responsible the {@link serviceDocs} belong to.
   *
   * Special case: This value is `undefined` if no Responsible has been defined for the given {@link serviceDocs}.
   */
  responsibleName: string | undefined;
  serviceDocs: ServiceNode[];
}
export const ResponsibleItem: React.FC<Props> = (props) => {
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
        text={props.responsibleName ?? 'No Responsible'}
        isFallbackElement={props.responsibleName === undefined}
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
    const result = [...props.serviceDocs];
    result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [props.serviceDocs]);

  return {
    state: state,

    sortedServiceDocs: sortedServiceDocs,

    toggleIsCollapsed: (): void => {
      setState((state) => merge(state, { isCollapsed: !state.isCollapsed }));
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
