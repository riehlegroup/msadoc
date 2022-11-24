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

import { useHttpServiceContext } from './http-base';

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

interface State {
  isSignedIn: boolean;
}

function useAuthHttpService(): AuthHttpService {
  const navigate = useNavigate();
  const httpService = useHttpServiceContext();
  const authDataService = useAuthDataServiceContext();

  const [state, setState] = React.useState<State>({
    isSignedIn:
      authDataService.state.accessAndRefreshToken?.refreshToken !== undefined,
  });

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
      const errorStatus = httpService.getErrorStatus(error);
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
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
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
      // In the future, we might want to distinguish cases like "the client currently has no internet connection" and "the token is invalid". However, the following should be fine for now.
      authDataService.deleteAccessAndRefreshToken();
      navigate(APP_ROUTES.login);
      return undefined;
    }
  }

  async function doRefreshAuthToken(
    refreshToken: string,
  ): Promise<LoginResponseDto> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
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
