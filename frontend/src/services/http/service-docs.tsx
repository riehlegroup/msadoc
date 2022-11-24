import { ListServiceDocResponse, ServiceDocsApi } from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '../../env';
import {
  ListAllServiceDocsHttpResponse,
  UnknownHttpError,
} from '../../models/api';
import { APP_ROUTES } from '../../routes';
import { useAuthDataServiceContext } from '../auth-data-service';

import { useHttpServiceContext } from './http-base';
import { ServiceDocsMockData } from './mock-data/service-docs';

export interface ServiceDocsHttpService {
  listAllServiceDocs: () => Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  >;
}
function useServiceDocsHttpService(): ServiceDocsHttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();
  const httpService = useHttpServiceContext();

  async function listAllServiceDocs(): Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  > {
    const accessToken =
      authDataService.state.accessAndRefreshToken?.accessToken;
    if (accessToken === undefined) {
      navigate(APP_ROUTES.login);
      return {
        status: 0,
        data: undefined,
      };
    }

    try {
      const response = await doListAllServiceDocs(accessToken);

      return {
        status: 200,
        data: response,
      };
    } catch (error) {
      return {
        status: 0,
        data: undefined,
      };
    }
  }

  async function doListAllServiceDocs(
    accessToken: string,
  ): Promise<ListServiceDocResponse> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
      return {
        serviceDocs: ServiceDocsMockData.allServiceDocs,
      };
    }

    return await firstValueFrom(
      new ServiceDocsApi(
        httpService.createConfiguration(accessToken),
      ).serviceDocsControllerListAllServiceDocs(),
    );
  }

  return {
    listAllServiceDocs: (): Promise<
      ListAllServiceDocsHttpResponse | UnknownHttpError
    > => {
      return listAllServiceDocs();
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
