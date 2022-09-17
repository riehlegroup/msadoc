import { CreateServiceDocRequest } from 'msadoc-client';

import { HttpResponse } from './common';

export type ListAllServiceDocsHttpResponse = HttpResponse<
  200,
  ListAllServiceDocs200ResponseData
>;

export type ListAllServiceDocs200ResponseData =
  ListAllServiceDocs200ResponseDataItem[];
interface ListAllServiceDocs200ResponseDataItem
  extends CreateServiceDocRequest {
  /**
   * This is a stringified JS Date object like "2022-09-15T13:15:34.455Z".
   */
  creationTimestamp: string;
  /**
   * This is a stringified JS Date object like "2022-09-15T13:15:34.455Z".
   */
  updateTimestamp: string;
}
