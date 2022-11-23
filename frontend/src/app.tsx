import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from './router';
import { AuthDataServiceContextProvider } from './services/auth-data-service';
import {
  AuthHttpServiceContextProvider,
  HttpServiceContextProvider,
  ServiceDocsHttpServiceContextProvider,
} from './services/http';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthDataServiceContextProvider>
        <HttpServiceContextProvider>
          <AuthHttpServiceContextProvider>
            <ServiceDocsHttpServiceContextProvider>
              <AppRouter />
            </ServiceDocsHttpServiceContextProvider>
          </AuthHttpServiceContextProvider>
        </HttpServiceContextProvider>
      </AuthDataServiceContextProvider>
    </BrowserRouter>
  );
};
