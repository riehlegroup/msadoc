import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { MAIN_PAGE_ROUTES_ABS, MAIN_PAGE_ROUTES_REL } from '../../routes';

import { ApiKeysPage } from './api-keys-page';
import { ServiceDocsExplorerPage } from './service-docs-explorer-page';

export const MainPageRouter: React.FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Navigate to={MAIN_PAGE_ROUTES_ABS.serviceDocsExplorer} />,
    },
    {
      path: MAIN_PAGE_ROUTES_REL.serviceDocsExplorer + '/*',
      element: <ServiceDocsExplorerPage />,
    },
    {
      path: MAIN_PAGE_ROUTES_REL.apiKeys,
      element: <ApiKeysPage />,
    },

    // Fallback route in case an unknown route has been navigated to.
    {
      path: '*',
      element: <Navigate to={MAIN_PAGE_ROUTES_ABS.serviceDocsExplorer} />,
    },
  ];
  const routeElement = useRoutes(routes);

  return <React.Fragment>{routeElement}</React.Fragment>;
};
