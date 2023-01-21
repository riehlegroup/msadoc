import React from 'react';
import {
  Navigate,
  RouteObject,
  useNavigate,
  useRoutes,
} from 'react-router-dom';

import {
  SERVICE_DOCS_EXPLORER_ROUTES_ABS,
  SERVICE_DOCS_EXPLORER_ROUTES_REL,
} from '../../../routes';
import { useSelectedTreeItem } from '../utils/router-utils';

import { GroupDetails } from './group-details';
import { ServiceDetails } from './service-details';

interface Props {
  /**
   * This function is called whenever the selected tree item changes (e.g. when a different service is selected).
   */
  onChangeTreeItem: () => void;
}
export const ServiceDocsExplorerPageRouter: React.FC<Props> = (props) => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Navigate to={SERVICE_DOCS_EXPLORER_ROUTES_ABS.root} />,
    },
    {
      path: SERVICE_DOCS_EXPLORER_ROUTES_REL.root,
      element: <GroupDetails />,
    },
    {
      path: SERVICE_DOCS_EXPLORER_ROUTES_REL.group,
      element: <GroupDetails />,
    },
    {
      path: SERVICE_DOCS_EXPLORER_ROUTES_REL.service,
      element: <ServiceDetails />,
    },

    // Fallback route in case an unknown route has been navigated to.
    {
      path: '*',
      element: <Navigate to={SERVICE_DOCS_EXPLORER_ROUTES_ABS.root} />,
    },
  ];
  const routeElement = useRoutes(routes);

  const navigate = useNavigate();
  const selectedTreeItem = useSelectedTreeItem();
  // The tree item as found in the URL does not exist? Then navigate to the root.
  React.useEffect(() => {
    if (!selectedTreeItem) {
      navigate(SERVICE_DOCS_EXPLORER_ROUTES_ABS.root);
    }
  }, [navigate, selectedTreeItem]);

  // Whenever a new Tree Item is selected, call the function passed in Props.
  React.useEffect(() => {
    props.onChangeTreeItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTreeItem]);

  return <React.Fragment>{routeElement}</React.Fragment>;
};
