import { Configuration, DefaultApi } from 'msadoc-client';
import React from 'react';
import { AjaxConfig } from 'rxjs/ajax';

import { ENVIRONMENT } from '../env';
import {
  AuthTokenRefresh200ResponseData,
  ListAllServiceDocs200ResponseData,
  ListAllServiceDocsHttpResponse,
  Login200ResponseData,
  LoginHttpResponse,
  UnknownHttpError,
} from '../models/api';

import { useAuthDataServiceContext } from './auth-data-service';

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
  const authDataService = useAuthDataServiceContext();

  /*
    We create two APIs here.
    The latter always includes the "authorization: Bearer <auth token>" header, the first does not include this header and can thus be used for login and similar actions.

    We need to distinguish these two because, by default, `DefaultApi` is not capable of adding such an auth header. Thus, we add a custom Middleware to it in order to manually add this header.
  */
  const [apiWithoutAuth, apiWithAuth] = React.useMemo((): [
    DefaultApi,
    DefaultApi,
  ] => {
    const apiConfigWithoutAuth = new Configuration({
      basePath: ENVIRONMENT.REACT_APP_BACKEND_URL,
    });

    const apiConfigWithAuth = new Configuration({
      basePath: ENVIRONMENT.REACT_APP_BACKEND_URL,
      middleware: [
        // The Middleware that adds the auth header.
        {
          pre: (requestConfig: AjaxConfig): AjaxConfig => {
            const newRequestConfig = { ...requestConfig };

            const accessToken =
              authDataService.state.accessAndRefreshToken?.accessToken ?? '';

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

    const withoutAuth = new DefaultApi(apiConfigWithoutAuth);

    // It would be pretty elegant to write something like `withoutAuth.withPreMiddleware(...)`. However, due to a bug in the generated client, this is not possible. See https://github.com/OpenAPITools/openapi-generator/issues/9098
    const withAuth = new DefaultApi(apiConfigWithAuth);

    return [withoutAuth, withAuth];
  }, [authDataService.state.accessAndRefreshToken?.accessToken]);

  function performLogin(
    username: string,
    password: string,
  ): Promise<LoginHttpResponse | UnknownHttpError> {
    const result = new Promise<LoginHttpResponse | UnknownHttpError>(
      (resolve) => {
        apiWithoutAuth
          .authControllerLogin({
            loginRequestDto: {
              username: username,
              password: password,
            },
          })
          .subscribe({
            next: (response: unknown) => {
              // This is not ideal since we trust our server to return properly shaped data.
              const responseData = response as Login200ResponseData;

              authDataService.setAccessAndRefreshToken({
                accessToken: responseData.access_token,
                refreshToken: responseData.refresh_token,
              });

              resolve({
                status: 200,
                data: responseData,
              });
            },
            error: (error) => {
              let status: 0 | 401 = 0;
              const errorStatus = getErrorStatus(error);
              if (errorStatus === 401) {
                status = 401;
              }
              resolve({
                status: status,
                data: undefined,
              });
            },
          });
      },
    );

    return result;
  }

  /**
   * Use the Refresh Token to generate a new Auth Token.
   *
   * The returned Promise is resolved to `true` if refreshing succeeded.
   * Otherwise, the Promise is resolved to `false`.
   */
  function refreshAuthToken(): Promise<boolean> {
    const result = new Promise<boolean>((resolve) => {
      if (
        authDataService.state.accessAndRefreshToken?.refreshToken === undefined
      ) {
        resolve(false);
        return;
      }

      apiWithoutAuth
        .authControllerRefreshToken({
          refreshTokenRequestDto: {
            refresh_token:
              authDataService.state.accessAndRefreshToken.refreshToken,
          },
        })
        .subscribe({
          next: (response: unknown) => {
            // This is not ideal since we trust our server to return properly shaped data.
            const responseData = response as AuthTokenRefresh200ResponseData;

            authDataService.setAccessAndRefreshToken({
              accessToken: responseData.access_token,
              refreshToken: responseData.refresh_token,
            });

            resolve(true);
          },
          error: () => {
            // In the future, we might want to distinguish cases like "the client currently has no internet connection" and "the token is invalid". However, the following should be fine for now.
            authDataService.deleteAccessAndRefreshToken();
            resolve(false);
          },
        });
    });

    return result;
  }

  /**
   * @param refreshOn401 Should we try to refresh the Access Token if the server returns 401?
   */
  function listAllServiceDocs(
    refreshOn401: boolean,
  ): Promise<ListAllServiceDocsHttpResponse | UnknownHttpError> {
    const result = new Promise<
      ListAllServiceDocsHttpResponse | UnknownHttpError
    >((resolve) => {
      apiWithAuth.serviceDocsControllerListAllServiceDocs().subscribe({
        next: (response: unknown) => {
          // This is not ideal since we trust our server to return properly shaped data.
          const responseData = response as ListAllServiceDocs200ResponseData;

          resolve({
            status: 200,
            data: responseData,
          });
        },
        error: (error) => {
          if (!refreshOn401) {
            resolve({
              status: 0,
              data: undefined,
            });
            return;
          }

          const errorStatus = getErrorStatus(error);

          if (errorStatus !== 401) {
            resolve({
              status: 0,
              data: undefined,
            });
            return;
          }

          // We might have an expired Access Token. --> Try refreshing it and then retry.

          refreshAuthToken()
            .then((success) => {
              if (!success) {
                resolve({
                  status: 0,
                  data: undefined,
                });
                return;
              }

              listAllServiceDocs(false)
                .then((secondTryResult) => {
                  resolve(secondTryResult);
                })
                .catch(() => {
                  throw Error('This point should not be reached.');
                });
            })
            .catch(() => {
              throw Error('This point should not be reached.');
            });
        },
      });
    });

    return result;
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
  const kernelService = useHttpService();

  return (
    <HttpServiceContext.Provider value={kernelService}>
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
