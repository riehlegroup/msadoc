import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ListAllServiceDocsHttpResponse,
  UnknownHttpError,
} from '../../../models/api';
import { APP_ROUTES } from '../../../routes';
import { useAuthDataServiceContext } from '../../auth-data-service';
import type { ServiceDocsHttpService } from '../service-docs';

function useMockServiceDocsHttpService(): ServiceDocsHttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();

  function listAllServiceDocs(): Promise<
    ListAllServiceDocsHttpResponse | UnknownHttpError
  > {
    const accessToken =
      authDataService.state.accessAndRefreshToken?.accessToken;
    if (accessToken === undefined) {
      navigate(APP_ROUTES.login);
      return Promise.resolve({
        status: 0,
        data: undefined,
      });
    }

    return Promise.resolve({
      status: 200,
      data: {
        serviceDocs: [],
      },
    });
  }

  return {
    listAllServiceDocs: (): Promise<
      ListAllServiceDocsHttpResponse | UnknownHttpError
    > => {
      return listAllServiceDocs();
    },
  };
}

export const MockServiceDocsHttpServiceContext = React.createContext<
  ServiceDocsHttpService | undefined
>(undefined);

interface Props {
  children?: React.ReactNode;
}
export const MockServiceDocsHttpServiceContextProvider: React.FC<Props> = (
  props,
) => {
  const httpService = useMockServiceDocsHttpService();

  return (
    <MockServiceDocsHttpServiceContext.Provider value={httpService}>
      {props.children}
    </MockServiceDocsHttpServiceContext.Provider>
  );
};

export const useServiceDocsHttpServiceContext = (): ServiceDocsHttpService => {
  const context = React.useContext(MockServiceDocsHttpServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the MockServiceDocsHttpServiceContext!',
    );
  }

  return context;
};
