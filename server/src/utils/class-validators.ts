import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

type FilterByValueType<Container, ExpectedType> = {
  [Key in keyof Container]: Container[Key] extends ExpectedType ? Key : never;
}[keyof Container];

type FilterByOptionalKeys<Container> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [Key in keyof Container]: {} extends Pick<Container, Key> ? Key : never;
}[keyof Container];

/**
 * Combines class-validator decorators "@IsString", and "@IsNotEmpty"
 */
export function IsNonEmptyString() {
  const isStringFn = IsString();
  const isNotEmptyFn = IsNotEmpty();

  return function IsNonEmptyString<T extends object>(
    target: T,
    key: FilterByValueType<T, string>,
  ) {
    isStringFn(target, key as any);
    isNotEmptyFn(target, key as any);
  };
}

/**
 * Combines class-validator decorators "@IsString", "@IsNotEmpty", and "@IsOptional"
 */
export function IsNonEmptyOptionalString() {
  const isStringFn = IsString();
  const isNotEmptyFn = IsNotEmpty();
  const isOptionalFn = IsOptional();

  return function IsNonEmptyString<T extends object>(
    target: T,
    key: FilterByValueType<Required<T>, string> & FilterByOptionalKeys<T>,
  ) {
    isStringFn(target, key as any);
    isNotEmptyFn(target, key as any);
    isOptionalFn(target, key as any);
  };
}

/**
 * Combines class-validator decorators "@IsArray", "@IsString", and "@IsNotEmpty"
 */
export function IsNonEmptyStringArray() {
  const isArrayFn = IsArray();
  const isStringFn = IsString({ each: true });
  const isNotEmptyFn = IsNotEmpty({ each: true });

  return function IsNonEmptyString<T extends object>(
    target: T,
    key: FilterByValueType<T, string[]>,
  ) {
    isArrayFn(target, key as any);
    isStringFn(target, key as any);
    isNotEmptyFn(target, key as any);
  };
}

/**
 * Combines class-validator decorators "@IsArray", "@IsString", "@IsNotEmpty", and "IsOptional"
 */
export function IsNonEmptyOptionalStringArray() {
  const isArrayFn = IsArray();
  const isStringFn = IsString({ each: true });
  const isNotEmptyFn = IsNotEmpty({ each: true });
  const isOptionalFn = IsOptional();

  return function IsNonEmptyString<T extends object>(
    target: T,
    key: FilterByValueType<Required<T>, string[]> & FilterByOptionalKeys<T>,
  ) {
    isArrayFn(target, key as any);
    isStringFn(target, key as any);
    isNotEmptyFn(target, key as any);
    isOptionalFn(target, key as any);
  };
}
