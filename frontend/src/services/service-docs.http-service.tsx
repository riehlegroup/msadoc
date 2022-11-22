import { ServiceDocsApi } from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firstValueFrom } from 'rxjs';

import {
  ListAllServiceDocsHttpResponse,
  UnknownHttpError,
} from '../models/api';
import { APP_ROUTES } from '../routes';

import { useAuthDataServiceContext } from './auth-data-service';
import { useHttpServiceContext } from './http-service';

interface ServiceDocsHttpService {
  listAllServiceDocs: () => Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  >;
}
function useServiceDocsHttpService(): ServiceDocsHttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();
  const httpService = useHttpServiceContext();

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
        new ServiceDocsApi(
          httpService.createConfiguration(accessToken),
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

      const errorStatus = httpService.getErrorStatus(error);

      if (errorStatus !== 401) {
        return {
          status: 0,
          data: undefined,
        };
      }

      // We might have an expired Access Token. --> Try refreshing it and then retry.

      const refreshResult = await httpService.refreshAuthToken();
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
    listAllServiceDocs: (): Promise<
      ListAllServiceDocsHttpResponse | UnknownHttpError
    > => {
      return listAllServiceDocs(true);
    },
  };
}

const ServiceDocsHttpServiceContext = React.createContext<
  ServiceDocsHttpService | undefined
>(undefined);

interface Props {
  children?: React.ReactNode;
}
export const ServiceDocsHttpServiceContextProvider: React.FC<Props> = (
  props,
) => {
  const httpService = useServiceDocsHttpService();

  return (
    <ServiceDocsHttpServiceContext.Provider value={httpService}>
      {props.children}
    </ServiceDocsHttpServiceContext.Provider>
  );
};

export const useServiceDocsHttpServiceContext = (): ServiceDocsHttpService => {
  const context = React.useContext(ServiceDocsHttpServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the ServiceDocsHttpServiceContext!',
    );
  }

  return context;
};
