import React from 'react';

import { merge } from '../utils/merge';

const ACCESS_TOKEN_LOCALSTORAGE_KEY = 'msadoc--access-token';
const REFRESH_TOKEN_LOCALSTORAGE_KEY = 'msadoc--refresh-token';

export interface AccessAndRefreshToken {
  accessToken: string;
  refreshToken: string;
}

interface State {
  accessAndRefreshToken: AccessAndRefreshToken | undefined;
}
interface AuthDataService {
  state: State;

  /**
   * Set/Update the Access and Refresh Token.
   * This will not only update our State, but also store these tokens in LocalStorage.
   */
  setAccessAndRefreshToken: (newTokens: AccessAndRefreshToken) => void;
  /**
   * Delete the Access and Refresh Token.
   * This will not only update our State, but also delete these tokens from LocalStorage.
   */
  deleteAccessAndRefreshToken: () => void;
}
function useAuthDataService(): AuthDataService {
  const [state, setState] = React.useState<State>((): State => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_LOCALSTORAGE_KEY);
    if (accessToken == null || refreshToken == null) {
      return {
        accessAndRefreshToken: undefined,
      };
    }

    return {
      accessAndRefreshToken: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  });

  // Whenever the Access/Refresh Tokens in our State change, remember this in LocalStorage.
  React.useEffect(() => {
    if (!state.accessAndRefreshToken) {
      localStorage.removeItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_LOCALSTORAGE_KEY);
      return;
    }

    localStorage.setItem(
      ACCESS_TOKEN_LOCALSTORAGE_KEY,
      state.accessAndRefreshToken.accessToken,
    );
    localStorage.setItem(
      REFRESH_TOKEN_LOCALSTORAGE_KEY,
      state.accessAndRefreshToken.refreshToken,
    );
  }, [state.accessAndRefreshToken]);

  return {
    state: state,

    setAccessAndRefreshToken: (newTokens): void => {
      setState((state) => merge(state, { accessAndRefreshToken: newTokens }));
    },

    deleteAccessAndRefreshToken: (): void => {
      setState((state) => merge(state, { accessAndRefreshToken: undefined }));
    },
  };
}

const AuthDataServiceContext = React.createContext<AuthDataService | undefined>(
  undefined,
);

interface Props {
  children?: React.ReactNode;
}
export const AuthDataServiceContextProvider: React.FC<Props> = (props) => {
  const authDataService = useAuthDataService();

  return (
    <AuthDataServiceContext.Provider value={authDataService}>
      {props.children}
    </AuthDataServiceContext.Provider>
  );
};

export const useAuthDataServiceContext = (): AuthDataService => {
  const context = React.useContext(AuthDataServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the AuthDataServiceContext!',
    );
  }

  return context;
};
