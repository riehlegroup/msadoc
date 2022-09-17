import { HttpResponse } from './common';

export type LoginHttpResponse =
  | HttpResponse<200, Login200ResponseData>
  | HttpResponse<401>;

export interface Login200ResponseData {
  access_token: string;
  refresh_token: string;
}
