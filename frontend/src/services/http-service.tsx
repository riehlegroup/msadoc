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

interface State {
  isSignedIn: boolean;
}

function useHttpService(): HttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();

  const [state, setState] = React.useState<State>({
    isSignedIn:
      authDataService.state.accessAndRefreshToken?.refreshToken !== undefined,
  });

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
      const errorStatus = getErrorStatus(error);
      return {
        status: errorStatus === 401 ? 401 : 0,
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

  // Whenever the auth token are deleted from local storage, update the state accordingly.
  React.useEffect(() => {
    setState({
      isSignedIn:
        authDataService.state.accessAndRefreshToken?.refreshToken === undefined,
    });
  }, [authDataService.state.accessAndRefreshToken]);

  const TOKEN_REFRESH_INTERVAL_MS = 60000;
  // Whenever signed in, refresh the auth tokens regularly.
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!state.isSignedIn) {
        return;
      }
      void refreshAuthToken();
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  });

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
