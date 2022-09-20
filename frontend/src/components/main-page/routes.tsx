import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { GroupsTreePage } from './groups-tree-page/groups-tree-page';

export const MainPageRoutes: React.FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Navigate to="/main/groups-tree" />,
    },
    {
      path: '/groups-tree',
      element: <GroupsTreePage />,
    },

    // Fallback route in case an unknown route has been navigated to.
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ];
  const routeElement = useRoutes(routes);

  return <React.Fragment>{routeElement}</React.Fragment>;
};
