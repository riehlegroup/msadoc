import React from 'react';

import { ApiKeysHttpServiceContextProvider } from './api-keys';
import { AuthHttpServiceContextProvider } from './auth';
import { HttpServiceContextProvider } from './http-base';
import { ServiceDocsHttpServiceContextProvider } from './service-docs';

interface Props {
  children: React.ReactNode;
}
export const HttpServiceFacadeProvider: React.FC<Props> = (props) => {
  return (
    <HttpServiceContextProvider>
      <ApiKeysHttpServiceContextProvider>
        <AuthHttpServiceContextProvider>
          <ServiceDocsHttpServiceContextProvider>
            {props.children}
          </ServiceDocsHttpServiceContextProvider>
        </AuthHttpServiceContextProvider>
      </ApiKeysHttpServiceContextProvider>
    </HttpServiceContextProvider>
  );
};
