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
        serviceDocs: [
          {
            name: 'ExtractionService',
            group: 'etl',
            tags: ['app=ods'],

            repository: 'https://github.com/jvalue/ods.git',
            taskBoard: 'https://github.com/jvalue/ods/projects',

            providedAPIs: [
              '/extractions/config',
              '/extractions/execution-stats',
            ],

            subscribedEvents: ['extraction.execution.triggered'],
            publishedEvents: [
              'extraction.config.created',
              'extraction.config.updated',
              'extraction.config.deleted',
              'extraction.execution.success',
              'extraction.execution.failure',
            ],

            deploymentDocumentation: 'https://github.com/jvalue/ods-deployment',

            responsibles: ['schwarz@group.riehle.org'],
            responsibleTeam: 'jvalue-core',
            creationTimestamp: new Date().toISOString(),
            updateTimestamp: new Date().toISOString(),
            extensions: {},
          },
        ],
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
