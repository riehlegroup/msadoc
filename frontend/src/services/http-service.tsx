import { AuthApi, Configuration } from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firstValueFrom } from 'rxjs';
import { AjaxConfig } from 'rxjs/ajax';

import { ENVIRONMENT } from '../env';
import { LoginHttpResponse, UnknownHttpError } from '../models/api';
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

  refreshAuthToken(): Promise<AccessAndRefreshToken | undefined>;

  createConfiguration(accessToken?: string): Configuration;
  getErrorStatus(error: unknown): number | undefined;
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

  async function performLogin(
    username: string,
    password: string,
  ): Promise<LoginHttpResponse | UnknownHttpError> {
    try {
      const response = await firstValueFrom(
        new AuthApi(createConfiguration()).authControllerLogin({
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
        new AuthApi(
          createConfiguration(
            authDataService.state.accessAndRefreshToken.refreshToken,
          ),
        ).authControllerRefreshToken({
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
    performLogin: performLogin,
    refreshAuthToken: refreshAuthToken,
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
