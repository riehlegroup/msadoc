import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { MAIN_PAGE_ROUTES_ABS, MAIN_PAGE_ROUTES_REL } from '../../routes';

import { AuthTokensPage } from './api-keys-page';
import { DependencyGraph } from './graph-page/dependency-graph-view';
import { ServiceDocsExplorerPage } from './service-docs-explorer-page';

export const MainPageRouter: React.FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Navigate to={MAIN_PAGE_ROUTES_ABS.graph} />,
    },
    {
      path: MAIN_PAGE_ROUTES_REL.graph + '/*',
      element: <DependencyGraph />,
    },
    {
      path: MAIN_PAGE_ROUTES_REL.serviceDocsExplorer + '/*',
      element: <ServiceDocsExplorerPage />,
    },
    {
      path: MAIN_PAGE_ROUTES_REL.apiKeys,
      element: <AuthTokensPage />,
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
