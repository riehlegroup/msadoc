import {
  Configuration,
  DeleteServiceDocResponse,
  ListServiceDocResponse,
  ServiceDocsApi,
} from 'msadoc-client';
import React from 'react';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '../../env';
import {
  DeleteSingleServiceDocResponse,
  ListAllServiceDocsHttpResponse,
  UnknownHttpError,
} from '../../models/api';

import { useHttpServiceContext } from './http-base';
import { ServiceDocsMockData } from './mock-data/service-docs';

export interface ServiceDocsHttpService {
  listAllServiceDocs: () => Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  >;
  deleteSingleServiceDoc: (
    serviceName: string,
  ) => Promise<DeleteSingleServiceDocResponse | UnknownHttpError>;
}
function useServiceDocsHttpService(): ServiceDocsHttpService {
  const httpService = useHttpServiceContext();

  async function listAllServiceDocs(): Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  > {
    const response = await httpService.performRegularApiRequest(
      (configuration) => doListAllServiceDocs(configuration),
    );
    if (response.success) {
      return {
        status: 200,
        data: response.data,
      };
    }
    return {
      status: 0,
      data: undefined,
    };
  }

  async function doListAllServiceDocs(
    configuration: Configuration,
  ): Promise<ListServiceDocResponse> {
    if (ENVIRONMENT.DEMO_MODE) {
      return {
        serviceDocs: ServiceDocsMockData.allServiceDocs,
      };
    }

    return await firstValueFrom(
      new ServiceDocsApi(
        configuration,
      ).serviceDocsControllerListAllServiceDocs(),
    );
  }

  async function deleteSingleServiceDoc(
    serviceName: string,
  ): Promise<DeleteSingleServiceDocResponse | UnknownHttpError> {
    const response = await httpService.performRegularApiRequest(
      (configuration) =>
        doDeleteSingleServiceDoc(configuration, { serviceName: serviceName }),
    );

    if (response.success) {
      return {
        status: 200,
        data: response.data,
      };
    }
    return {
      status: 0,
      data: undefined,
    };
  }

  async function doDeleteSingleServiceDoc(
    configuration: Configuration,
    data: {
      serviceName: string;
    },
  ): Promise<DeleteServiceDocResponse> {
    if (ENVIRONMENT.DEMO_MODE) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return ServiceDocsMockData.allServiceDocs[0]!;
    }

    return await firstValueFrom(
      new ServiceDocsApi(
        configuration,
      ).serviceDocsControllerDeleteServiceDocByName({
        serviceName: data.serviceName,
      }),
    );
  }

  return {
    listAllServiceDocs: listAllServiceDocs,
    deleteSingleServiceDoc: deleteSingleServiceDoc,
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
