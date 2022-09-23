import { AuthApi, Configuration, ServiceDocsApi } from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firstValueFrom } from 'rxjs';
import { AjaxConfig } from 'rxjs/ajax';

import { ENVIRONMENT } from '../env';
import {
  ListAllServiceDocsHttpResponse,
  LoginHttpResponse,
  UnknownHttpError,
} from '../models/api';
import { APP_ROUTES } from '../routes';

import {
  AccessAndRefreshToken,
  useAuthDataServiceContext,
} from './auth-data-service';

interface HttpService {
  /**
   * Login using the given username and password.
   * If the login succeeds, the returned auth/refresh tokens will automatically be stored.
   */
  performLogin: (
    username: string,
    password: string,
  ) => Promise<LoginHttpResponse | UnknownHttpError>;

  listAllServiceDocs: () => Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  >;
}
function useHttpService(): HttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();

  function getAuthApi(): AuthApi {
    const apiConfig = new Configuration({
      basePath: ENVIRONMENT.REACT_APP_BACKEND_URL,
    });

    return new AuthApi(apiConfig);
  }

  function getServiceDocsApi(accessToken: string): ServiceDocsApi {
    const apiConfigWithAuth = new Configuration({
      basePath: ENVIRONMENT.REACT_APP_BACKEND_URL,

      /*
        `ServiceDocsApi` is not capable of adding the "authorization: Bearer <access token>" header. 
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

    return new ServiceDocsApi(apiConfigWithAuth);
  }

  async function performLogin(
    username: string,
    password: string,
  ): Promise<LoginHttpResponse | UnknownHttpError> {
    try {
      const response = await firstValueFrom(
        getAuthApi().authControllerLogin({
          loginRequestDto: {
            username: username,
            password: password,
          },
        }),
      );

      authDataService.setAccessAndRefreshToken({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });

      return {
        status: 200,
        data: response,
      };
    } catch (error) {
      let status: 0 | 401 = 0;
      const errorStatus = getErrorStatus(error);
      if (errorStatus === 401) {
        status = 401;
      }

      return {
        status: status,
        data: undefined,
      };
    }
  }

  /**
   * Use the Refresh Token to generate a new Auth Token.
   */
  async function refreshAuthToken(): Promise<
    AccessAndRefreshToken | undefined
  > {
    if (
      authDataService.state.accessAndRefreshToken?.refreshToken === undefined
    ) {
      navigate(APP_ROUTES.login);
      return undefined;
    }

    try {
      const response = await firstValueFrom(
        getAuthApi().authControllerRefreshToken({
          refreshTokenRequestDto: {
            refresh_token:
              authDataService.state.accessAndRefreshToken.refreshToken,
          },
        }),
      );

      authDataService.setAccessAndRefreshToken({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });

      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };
    } catch (error) {
      // In the future, we might want to distinguish cases like "the client currently has no internet connection" and "the token is invalid". However, the following should be fine for now.
      authDataService.deleteAccessAndRefreshToken();
      navigate(APP_ROUTES.login);
      return undefined;
    }
  }

  /**
   * @param refreshOn401 Should we try to refresh the Access Token if the server returns 401?
   * @param accessToken The Access Token to use when performing the request. If no token is specified, the one provided by the AuthDataService is used.
   */
  async function listAllServiceDocs(
    refreshOn401: boolean,
    accessToken?: string,
  ): Promise<ListAllServiceDocsHttpResponse | UnknownHttpError> {
    if (accessToken === undefined) {
      accessToken = authDataService.state.accessAndRefreshToken?.accessToken;
    }
    if (accessToken === undefined) {
      navigate(APP_ROUTES.login);
      return {
        status: 0,
        data: undefined,
      };
    }

    try {
      const response = await firstValueFrom(
        getServiceDocsApi(
          accessToken,
        ).serviceDocsControllerListAllServiceDocs(),
      );

      return {
        status: 200,
        data: response,
      };
    } catch (error) {
      if (!refreshOn401) {
        return {
          status: 0,
          data: undefined,
        };
      }

      const errorStatus = getErrorStatus(error);

      if (errorStatus !== 401) {
        return {
          status: 0,
          data: undefined,
        };
      }

      // We might have an expired Access Token. --> Try refreshing it and then retry.

      const refreshResult = await refreshAuthToken();
      if (!refreshResult) {
        return {
          status: 0,
          data: undefined,
        };
      }

      return await listAllServiceDocs(false, refreshResult.accessToken);
    }
  }

  return {
    performLogin: performLogin,

    listAllServiceDocs: (): Promise<
      ListAllServiceDocsHttpResponse | UnknownHttpError
    > => {
      return listAllServiceDocs(true);
    },
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
