import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ENVIRONMENT } from './env';
import { AppRouter } from './router';
import { AuthDataServiceContextProvider } from './services/auth-data-service';
import { HttpServiceFacadeProvider } from './services/http';
import { SnackbarServiceContextProvider } from './services/snackbar-service';

export const App: React.FC = () => {
  return (
    // When serving the page from a subfolder (e.g. example.com/foo), the Router by default simply rewrites the URLs so that the subfolder ("foo") gets removed from the URL. To fix this, we need to explicitly set the `basename` (here: "foo").
    <BrowserRouter basename={ENVIRONMENT.ROUTER_BASE}>
      <AuthDataServiceContextProvider>
        <HttpServiceFacadeProvider>
          <SnackbarServiceContextProvider>
            <AppRouter />
          </SnackbarServiceContextProvider>
        </HttpServiceFacadeProvider>
      </AuthDataServiceContextProvider>
    </BrowserRouter>
  );
};
