import {
  ApiKeysApi,
  CreateApiKeyResponseDto,
  GetApiKeysResponseDto,
} from 'msadoc-client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '../../env';
import {
  CreateApiKeyResponse,
  DeleteSingleApiKeyResponse,
  ListAllApiKeysHttpResponse,
  UnknownHttpError,
} from '../../models/api';
import { APP_ROUTES } from '../../routes';
import { useAuthDataServiceContext } from '../auth-data-service';

import { useHttpServiceContext } from './http-base';
import { ApiKeysMockData } from './mock-data/api-keys';

export interface ApiKeysHttpService {
  listAllApiKeys: () => Promise<ListAllApiKeysHttpResponse | UnknownHttpError>;
  createApiKey: (
    apiKeyName: string,
  ) => Promise<CreateApiKeyResponse | UnknownHttpError>;
  deleteSingleApiKey: (
    apiKeyId: number,
  ) => Promise<DeleteSingleApiKeyResponse | UnknownHttpError>;
}
function useApiKeysHttpService(): ApiKeysHttpService {
  const navigate = useNavigate();
  const authDataService = useAuthDataServiceContext();
  const httpService = useHttpServiceContext();

  async function listAllApiKeys(): Promise<
    ListAllApiKeysHttpResponse | UnknownHttpError
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
      const response = await doListAllApiKeys(accessToken);

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

  async function doListAllApiKeys(
    accessToken: string,
  ): Promise<GetApiKeysResponseDto> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
      return {
        apiKeys: ApiKeysMockData.allApiKeys,
      };
    }

    return await firstValueFrom(
      new ApiKeysApi(
        httpService.createConfiguration(accessToken),
      ).apiKeysControllerGetAllApiKeys(),
    );
  }

  async function createApiKey(
    apiKeyName: string,
  ): Promise<CreateApiKeyResponse | UnknownHttpError> {
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
      const response = await doCreateApiKey(accessToken, {
        apiKeyName: apiKeyName,
      });

      return {
        status: 201,
        data: response,
      };
    } catch (error) {
      return {
        status: 0,
        data: undefined,
      };
    }
  }

  async function doCreateApiKey(
    accessToken: string,
    data: {
      apiKeyName: string;
    },
  ): Promise<CreateApiKeyResponseDto> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
      return {
        ...ApiKeysMockData.apiKeyCreationResponse,
        keyName: data.apiKeyName,
      };
    }

    return await firstValueFrom(
      new ApiKeysApi(
        httpService.createConfiguration(accessToken),
      ).apiKeysControllerCreateApiKey({
        createApiKeyRequestDto: { keyName: data.apiKeyName },
      }),
    );
  }

  async function deleteSingleApiKey(
    apiKeyId: number,
  ): Promise<DeleteSingleApiKeyResponse | UnknownHttpError> {
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
      const response = await doDeleteSingleApiKey(accessToken, {
        apiKeyId: apiKeyId,
      });

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

  async function doDeleteSingleApiKey(
    accessToken: string,
    data: {
      apiKeyId: number;
    },
  ): Promise<void> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
      return;
    }

    return await firstValueFrom(
      new ApiKeysApi(
        httpService.createConfiguration(accessToken),
      ).apiKeysControllerDeleteApiKey({ keyId: data.apiKeyId }),
    );
  }

  return {
    listAllApiKeys: listAllApiKeys,
    createApiKey: createApiKey,
    deleteSingleApiKey: deleteSingleApiKey,
  };
}

const ApiKeysHttpServiceContext = React.createContext<
  ApiKeysHttpService | undefined
>(undefined);

interface Props {
  children?: React.ReactNode;
}
export const ApiKeysHttpServiceContextProvider: React.FC<Props> = (props) => {
  const httpService = useApiKeysHttpService();

  return (
    <ApiKeysHttpServiceContext.Provider value={httpService}>
      {props.children}
    </ApiKeysHttpServiceContext.Provider>
  );
};

export const useApiKeysHttpServiceContext = (): ApiKeysHttpService => {
  const context = React.useContext(ApiKeysHttpServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the ApiKeysHttpServiceContext!',
    );
  }

  return context;
};
