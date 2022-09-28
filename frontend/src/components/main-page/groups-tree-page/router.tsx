import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import {
  GROUPS_TREE_ROUTES_ABS,
  GROUPS_TREE_ROUTES_REL,
} from '../../../routes';

import { GroupDetails } from './group-details';
import { ServiceDetails } from './service-details';

export const GroupsTreePageRouter: React.FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Navigate to={GROUPS_TREE_ROUTES_ABS.root} />,
    },
    {
      path: GROUPS_TREE_ROUTES_REL.root,
      element: <GroupDetails />,
    },
    {
      path: GROUPS_TREE_ROUTES_REL.group,
      element: <GroupDetails />,
    },
    {
      path: GROUPS_TREE_ROUTES_REL.service,
      element: <ServiceDetails />,
    },

    // Fallback route in case an unknown route has been navigated to.
    {
      path: '*',
      element: <Navigate to={GROUPS_TREE_ROUTES_ABS.root} />,
    },
  ];
  const routeElement = useRoutes(routes);

  return <React.Fragment>{routeElement}</React.Fragment>;
};
