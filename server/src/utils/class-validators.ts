import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

/**
 * Combines class-validator decorators "@IsString", "@IsNotEmpty", and "@IsOptional" if configured
 */
export function IsNonEmptyString(options?: {
  isOptional?: boolean;
}): PropertyDecorator {
  const isStringFn = IsString();
  const isNotEmptyFn = IsNotEmpty();
  const isOptionalFn = IsOptional();
  return function (target: any, key: string) {
    isStringFn(target, key);
    isNotEmptyFn(target, key);
    if (options?.isOptional === true) {
      isOptionalFn(target, key);
    }
  };
}

/**
 * Combines class-validator decorators "@IsArray", "@IsString", "@IsNotEmpty", and "@IsOptional" if configured
 */
export function IsNonEmptyStringArray(options?: {
  isOptional?: boolean;
}): PropertyDecorator {
  const isArrayFn = IsArray();
  const isStringFn = IsString({ each: true });
  const isNotEmptyFn = IsNotEmpty({ each: true });
  const isOptionalFn = IsOptional();
  return function (target: any, key: string) {
    isArrayFn(target, key);
    isStringFn(target, key);
    isNotEmptyFn(target, key);
    if (options?.isOptional === true) {
      isOptionalFn(target, key);
    }
  };
}
