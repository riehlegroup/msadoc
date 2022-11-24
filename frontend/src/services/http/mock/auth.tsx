import React from 'react';
import { useNavigate } from 'react-router-dom';

import { LoginHttpResponse, UnknownHttpError } from '../../../models/api';
import { APP_ROUTES } from '../../../routes';
import {
  AccessAndRefreshToken,
  useAuthDataServiceContext,
} from '../../auth-data-service';
import type { AuthHttpService } from '../auth';

function useMockAuthHttpService(): AuthHttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();

  const dummyTokenResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  };

  function performLogin(): Promise<LoginHttpResponse | UnknownHttpError> {
    authDataService.setAccessAndRefreshToken({
      accessToken: dummyTokenResponse.access_token,
      refreshToken: dummyTokenResponse.refresh_token,
    });

    return Promise.resolve({
      status: 200,
      data: dummyTokenResponse,
    });
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

    return Promise.resolve({
      accessToken: dummyTokenResponse.access_token,
      refreshToken: dummyTokenResponse.refresh_token,
    });
  }

  return {
    performLogin: performLogin,
    refreshAuthToken: refreshAuthToken,
  };
}

const MockAuthHttpServiceContext = React.createContext<
  AuthHttpService | undefined
>(undefined);

interface Props {
  children?: React.ReactNode;
}
export const MockAuthHttpServiceContextProvider: React.FC<Props> = (props) => {
  const authHttpService = useMockAuthHttpService();

  return (
    <MockAuthHttpServiceContext.Provider value={authHttpService}>
      {props.children}
    </MockAuthHttpServiceContext.Provider>
  );
};

export const useAuthHttpServiceContext = (): AuthHttpService => {
  const context = React.useContext(MockAuthHttpServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the MockAuthHttpServiceContext!',
    );
  }

  return context;
};
