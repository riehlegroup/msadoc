import React from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { LoginPage } from './components/login-page';
import { MainPage } from './components/main-page';
import { useAuthDataServiceContext } from './services/auth-data-service';

export const AppRoutes: React.FC = () => {
  const authService = useAuthDataServiceContext();

  const routes: RouteObject[] = [
    {
      path: '/',
      element: authService.state.accessAndRefreshToken ? (
        <Navigate to="/main" />
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/main/*',
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
