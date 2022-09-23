import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { LoginPage } from './components/login-page';
import { MainPage } from './components/main-page';
import { APP_ROUTES } from './routes';
import { useAuthDataServiceContext } from './services/auth-data-service';

export const AppRouter: React.FC = () => {
  const authService = useAuthDataServiceContext();

  const routes: RouteObject[] = [
    {
      path: '/',
      element: authService.state.accessAndRefreshToken ? (
        <Navigate to={APP_ROUTES.main} />
      ) : (
        <Navigate to={APP_ROUTES.login} />
      ),
    },
    {
      path: APP_ROUTES.login,
      element: <LoginPage />,
    },
    {
      path: APP_ROUTES.main + '/*',
      element: <MainPage />,
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
