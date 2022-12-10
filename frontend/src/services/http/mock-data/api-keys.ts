import { CreateApiKeyResponseDto, GetApiKeyResponseDto } from 'msadoc-client';

/**
 * The response returned when creating a single API key.
 * We omit `keyName` here because we want to use user-defined key names here.
 */
const apiKeyCreationResponse: Omit<CreateApiKeyResponseDto, 'keyName'> = {
  id: 4,
  apiKey:
    '4096ec087ddcf0f634baabbc994eaa107ca0df996e5168d18df77258c487bc481abbcdc3',
  creationTimestamp: '2022-11-24T09:35:06.358Z',
};

const allApiKeys: GetApiKeyResponseDto[] = [
  {
    id: 1,
    keyName: 'WebClient Key',
    creationTimestamp: '2022-11-24T09:35:06.358Z',
  },
  {
    id: 2,
    keyName: 'ExtractionService Key',
    creationTimestamp: '2022-11-24T09:35:06.358Z',
  },
  {
    id: 3,
    keyName: 'Additional Key',
    creationTimestamp: '2022-11-24T09:35:06.358Z',
  },
];

export const ApiKeysMockData = {
  apiKeyCreationResponse: apiKeyCreationResponse,
  allApiKeys: allApiKeys,
};
