export interface HttpResponse<TStatus extends number, TData = undefined> {
  status: TStatus;
  data: TData;
}

export type UnknownHttpError = HttpResponse<0>;
