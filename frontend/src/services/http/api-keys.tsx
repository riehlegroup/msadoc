import {
  ApiKeysApi,
  Configuration,
  CreateApiKeyResponseDto,
  GetApiKeysResponseDto,
} from 'msadoc-client';
import React from 'react';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '../../env';
import {
  CreateApiKeyResponse,
  DeleteSingleApiKeyResponse,
  ListAllApiKeysHttpResponse,
  UnknownHttpError,
} from '../../models/api';

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
  const httpService = useHttpServiceContext();

  async function listAllApiKeys(): Promise<
    ListAllApiKeysHttpResponse | UnknownHttpError
  > {
    const response = await httpService.performRegularApiRequest((accessToken) =>
      doListAllApiKeys(accessToken),
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

  async function doListAllApiKeys(
    configuration: Configuration,
  ): Promise<GetApiKeysResponseDto> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
      return {
        apiKeys: ApiKeysMockData.allApiKeys,
      };
    }

    return await firstValueFrom(
      new ApiKeysApi(configuration).apiKeysControllerGetAllApiKeys(),
    );
  }

  async function createApiKey(
    apiKeyName: string,
  ): Promise<CreateApiKeyResponse | UnknownHttpError> {
    const response = await httpService.performRegularApiRequest(
      (configuration) =>
        doCreateApiKey(configuration, { apiKeyName: apiKeyName }),
    );

    if (response.success) {
      return {
        status: 201,
        data: response.data,
      };
    }
    return {
      status: 0,
      data: undefined,
    };
  }

  async function doCreateApiKey(
    configuration: Configuration,
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
      new ApiKeysApi(configuration).apiKeysControllerCreateApiKey({
        createApiKeyRequestDto: { keyName: data.apiKeyName },
      }),
    );
  }

  async function deleteSingleApiKey(
    apiKeyId: number,
  ): Promise<DeleteSingleApiKeyResponse | UnknownHttpError> {
    const response = await httpService.performRegularApiRequest(
      (configuration) =>
        doDeleteSingleApiKey(configuration, { apiKeyId: apiKeyId }),
    );

    if (response.success) {
      return {
        status: 200,
        data: undefined,
      };
    }
    return {
      status: 0,
      data: undefined,
    };
  }

  async function doDeleteSingleApiKey(
    configuration: Configuration,
    data: {
      apiKeyId: number;
    },
  ): Promise<void> {
    if (ENVIRONMENT.REACT_APP_DEMO_MODE) {
      return;
    }

    return await firstValueFrom(
      new ApiKeysApi(configuration).apiKeysControllerDeleteApiKey({
        keyId: data.apiKeyId,
      }),
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
