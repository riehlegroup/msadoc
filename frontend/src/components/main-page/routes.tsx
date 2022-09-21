import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { AuthTokensPage } from './auth-tokens-page';
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
    {
      path: '/auth-tokens',
      element: <AuthTokensPage />,
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
