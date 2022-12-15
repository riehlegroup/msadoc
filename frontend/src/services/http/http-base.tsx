import { Configuration } from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router';
import { AjaxConfig } from 'rxjs/ajax';

import { ENVIRONMENT } from '../../env';
import {
  ErrorResultWithData,
  SuccessResultWithData,
} from '../../models/result';
import { APP_ROUTES } from '../../routes';
import { useAuthDataServiceContext } from '../auth-data-service';

interface ErrorResponseResult {
  httpStatus: number | undefined;
}

interface HttpService {
  createConfiguration: (accessToken?: string) => Configuration;

  performRegularApiRequest: <TSuccessResponseData>(
    handler: (configuration: Configuration) => Promise<TSuccessResponseData>,
  ) => Promise<
    | SuccessResultWithData<TSuccessResponseData>
    | ErrorResultWithData<ErrorResponseResult>
  >;
}

function useHttpService(): HttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();

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

  async function performRegularApiRequest<TSuccessResponseData>(
    handler: (configuration: Configuration) => Promise<TSuccessResponseData>,
  ): Promise<
    | SuccessResultWithData<TSuccessResponseData>
    | ErrorResultWithData<ErrorResponseResult>
  > {
    const accessToken =
      authDataService.state.accessAndRefreshToken?.accessToken;
    if (accessToken === undefined) {
      navigate(APP_ROUTES.login);
      return {
        success: false,
        error: {
          httpStatus: undefined,
        },
      };
    }

    const configuration = createConfiguration(accessToken);

    try {
      const handlerResponse = await handler(configuration);

      return {
        success: true,
        data: handlerResponse,
      };
    } catch (error) {
      const errorStatus = getErrorStatus(error);

      /*
        We got a 401? 
        At the moment, this always means that the used access token is, for some reason, invalid.
        The server is currently not expected to return 401 when something else happens.
      */
      if (errorStatus === 401) {
        authDataService.deleteAccessAndRefreshToken();
        navigate(APP_ROUTES.login);
      }

      return {
        success: false,
        error: {
          httpStatus: errorStatus,
        },
      };
    }
  }

  return {
    createConfiguration: createConfiguration,
    performRegularApiRequest: performRegularApiRequest,
  };
}

/**
 * A helper function to get the "status" field of an error object returned when a http request fails.
 */
export function getErrorStatus(error: unknown): number | undefined {
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
