import { AuthApi, LoginResponseDto } from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '../../env';
import { LoginHttpResponse, UnknownHttpError } from '../../models/api';
import { APP_ROUTES } from '../../routes';
import {
  AccessAndRefreshToken,
  useAuthDataServiceContext,
} from '../auth-data-service';

import { getErrorStatus, useHttpServiceContext } from './http-base';

export interface AuthHttpService {
  /**
   * Login using the given username and password.
   * If the login succeeds, the returned auth/refresh tokens will automatically be stored.
   */
  performLogin: (
    username: string,
    password: string,
  ) => Promise<LoginHttpResponse | UnknownHttpError>;

  refreshAuthToken(): Promise<AccessAndRefreshToken | undefined>;
}

function useAuthHttpService(): AuthHttpService {
  const navigate = useNavigate();
  const httpService = useHttpServiceContext();
  const authDataService = useAuthDataServiceContext();

  async function performLogin(
    username: string,
    password: string,
  ): Promise<LoginHttpResponse | UnknownHttpError> {
    try {
      const response = await doPerformLogin(username, password);

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

  async function doPerformLogin(
    username: string,
    password: string,
  ): Promise<LoginResponseDto> {
    if (ENVIRONMENT.DEMO_MODE) {
      return {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
    }

    return await firstValueFrom(
      new AuthApi(httpService.createConfiguration()).authControllerLogin({
        loginRequestDto: {
          username: username,
          password: password,
        },
      }),
    );
  }

  const doRefreshAuthToken = React.useCallback(
    async (refreshToken: string): Promise<LoginResponseDto> => {
      if (ENVIRONMENT.DEMO_MODE) {
        return {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        };
      }

      return await firstValueFrom(
        new AuthApi(
          httpService.createConfiguration(refreshToken),
        ).authControllerRefreshToken({
          refreshTokenRequestDto: {
            refresh_token: refreshToken,
          },
        }),
      );
    },
    [httpService],
  );
  /**
   * Use the Refresh Token to generate a new Auth Token.
   */
  const refreshAuthToken = React.useCallback(async (): Promise<
    AccessAndRefreshToken | undefined
  > => {
    if (
      authDataService.state.accessAndRefreshToken?.refreshToken === undefined
    ) {
      navigate(APP_ROUTES.login);
      return undefined;
    }

    try {
      const response = await doRefreshAuthToken(
        authDataService.state.accessAndRefreshToken.refreshToken,
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
      const errorStatus = getErrorStatus(error);

      if (errorStatus === 401) {
        authDataService.deleteAccessAndRefreshToken();
        navigate(APP_ROUTES.login);
        return undefined;
      }

      // Something unexpected happened, e.g. the internet connection was lost.
      return undefined;
    }
  }, [authDataService, doRefreshAuthToken, navigate]);

  const TOKEN_REFRESH_INTERVAL_MS = 60000;
  // Whenever signed in, refresh the auth tokens regularly.
  React.useEffect(() => {
    const interval = setInterval(() => {
      const isSignedIn =
        authDataService.state.accessAndRefreshToken?.refreshToken !== undefined;

      if (!isSignedIn) {
        return;
      }
      void refreshAuthToken();
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [
    authDataService.state.accessAndRefreshToken?.refreshToken,
    refreshAuthToken,
  ]);

  return {
    performLogin: performLogin,
    refreshAuthToken: refreshAuthToken,
  };
}

const AuthHttpServiceContext = React.createContext<AuthHttpService | undefined>(
  undefined,
);

interface Props {
  children?: React.ReactNode;
}
export const AuthHttpServiceContextProvider: React.FC<Props> = (props) => {
  const authHttpService = useAuthHttpService();

  return (
    <AuthHttpServiceContext.Provider value={authHttpService}>
      {props.children}
    </AuthHttpServiceContext.Provider>
  );
};

export const useAuthHttpServiceContext = (): AuthHttpService => {
  const context = React.useContext(AuthHttpServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the AuthHttpServiceContext!',
    );
  }

  return context;
};
