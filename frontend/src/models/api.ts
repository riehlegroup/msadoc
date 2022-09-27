import { ListServiceDocResponse, LoginResponseDto } from 'msadoc-client';

export interface HttpResponse<TStatus extends number, TData = undefined> {
  status: TStatus;
  data: TData;
}

export type UnknownHttpError = HttpResponse<0>;

export type LoginHttpResponse =
  | HttpResponse<200, LoginResponseDto>
  | HttpResponse<401>;

export type ListAllServiceDocsHttpResponse = HttpResponse<
  200,
  ListServiceDocResponse
>;
