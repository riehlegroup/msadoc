import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from './router';
import { AuthDataServiceContextProvider } from './services/auth-data-service';
import { HttpServiceContextProvider } from './services/http-service';
import { ServiceDocsHttpServiceContextProvider } from './services/service-docs.http-service';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthDataServiceContextProvider>
        <HttpServiceContextProvider>
          <ServiceDocsHttpServiceContextProvider>
            <AppRouter />
          </ServiceDocsHttpServiceContextProvider>
        </HttpServiceContextProvider>
      </AuthDataServiceContextProvider>
    </BrowserRouter>
  );
};
