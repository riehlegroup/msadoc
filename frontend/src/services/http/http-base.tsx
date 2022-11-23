import { Configuration } from 'msadoc-client';
import React from 'react';
import { AjaxConfig } from 'rxjs/ajax';

import { ENVIRONMENT } from '../../env';

interface HttpService {
  createConfiguration(accessToken?: string): Configuration;
  getErrorStatus(error: unknown): number | undefined;
}

function useHttpService(): HttpService {
  function createConfiguration(accessToken?: string): Configuration {
    if (accessToken === undefined) {
      return new Configuration({
        basePath: ENVIRONMENT.REACT_APP_BACKEND_URL,
      });
    }

    return new Configuration({
      basePath: ENVIRONMENT.REACT_APP_BACKEND_URL,

      /*
        The generated client is not capable of adding the "authorization: Bearer <access token>" header. 
        Thus, we add a custom Middleware to it in order to manually add this header.
      */
      middleware: [
        {
          pre: (requestConfig: AjaxConfig): AjaxConfig => {
            const newRequestConfig = { ...requestConfig };

            const bearer = `Bearer ${accessToken}`;
            newRequestConfig.headers = {
              ...newRequestConfig.headers,
              authorization: bearer,
            };

            return newRequestConfig;
          },
        },
      ],
    });
  }

  /**
   * Get the "status" field of an error object returned when a http request fails.
   */
  function getErrorStatus(error: unknown): number | undefined {
    if (typeof error !== 'object' || error == null) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const status = (error as any).status;

    if (typeof status !== 'number') {
      return undefined;
    }
    return status;
  }

  return {
    createConfiguration: createConfiguration,
    getErrorStatus: getErrorStatus,
  };
}

const HttpServiceContext = React.createContext<HttpService | undefined>(
  undefined,
);

interface Props {
  children?: React.ReactNode;
}
export const HttpServiceContextProvider: React.FC<Props> = (props) => {
  const httpService = useHttpService();

  return (
    <HttpServiceContext.Provider value={httpService}>
      {props.children}
    </HttpServiceContext.Provider>
  );
};

export const useHttpServiceContext = (): HttpService => {
  const context = React.useContext(HttpServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the HttpServiceContext!',
    );
  }

  return context;
};
