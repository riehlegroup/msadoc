import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from './router';
import { AuthDataServiceContextProvider } from './services/auth-data-service';
import { HttpServiceFacadeProvider } from './services/http';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthDataServiceContextProvider>
        <HttpServiceFacadeProvider>
          <AppRouter />
        </HttpServiceFacadeProvider>
      </AuthDataServiceContextProvider>
    </BrowserRouter>
  );
};
