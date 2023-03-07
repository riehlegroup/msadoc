/**
 * When dealing with function results, it is often very convenient to have a way to express success and failure.
 * This type helps expressing success and failure.
 *
 * Example:
 *
 * ``` ts
 * const result: Result<number> = {
 *  success: true,
 *  data: 123,
 * }
 * ```
 *
 * If the Generic is (potentially) `undefined`, the `data` field may be left out:
 *
 * ``` ts
 * const result: Result<number | undefined> = {
 *  success: true,
 * }
 * ```
 *
 */
export type Result<SuccessData = undefined, ErrorData = undefined> =
  | SuccessResult<SuccessData>
  | ErrorResult<ErrorData>;

export type SuccessResult<T = undefined> = T extends undefined
  ? SuccessResultWithOptionalData<T>
  : SuccessResultWithData<T>;

export interface SuccessResultWithOptionalData<T> {
  success: true;
  data?: T;
}
export interface SuccessResultWithData<T> {
  success: true;
  data: T;
}

export type ErrorResult<T = undefined> = T extends undefined
  ? ErrorResultWithOptionalData<T>
  : ErrorResultWithData<T>;

export interface ErrorResultWithOptionalData<T> {
  success: false;
  error?: T;
}

export interface ErrorResultWithData<T> {
  success: false;
  error: T;
}
