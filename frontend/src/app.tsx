import React from 'react';

import { AuthDataServiceContextProvider } from './services/auth-data-service';
import {
  HttpServiceContextProvider,
  useHttpServiceContext,
} from './services/http-service';

export const App: React.FC = () => {
  return (
    <AuthDataServiceContextProvider>
      <HttpServiceContextProvider>
        <Test />
      </HttpServiceContextProvider>
    </AuthDataServiceContextProvider>
  );
};

// This is just a temporary component to showcase how the HTTP Service works.
const Test: React.FC = () => {
  const httpService = useHttpServiceContext();

  React.useEffect(() => {
    void (async (): Promise<void> => {
      const loginResponse = await httpService.performLogin('myuser', '12345');
      if (loginResponse.status !== 200) {
        return;
      }
      const serviceDocsResponse = await httpService.listAllServiceDocs();
      if (serviceDocsResponse.status !== 200) {
        return;
      }
      console.log(serviceDocsResponse.data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>msadoc</div>;
};
