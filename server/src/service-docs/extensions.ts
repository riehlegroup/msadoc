import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export type ExtensionKey = string;
export type ExtensionValueType =
  | ExtensionPrimitiveValueType
  | ExtensionPrimitiveValueType[];
export type ExtensionPrimitiveValueType = string | number | boolean;
export type ExtensionObject = Record<ExtensionKey, ExtensionValueType>;

export function isExtensionPrimitiveValueType(
  extensionValue: unknown,
): extensionValue is ExtensionPrimitiveValueType {
  return (
    typeof extensionValue === 'string' ||
    typeof extensionValue === 'number' ||
    typeof extensionValue === 'boolean'
  );
}

export function isExtensionValueType(
  extensionValue: unknown,
): extensionValue is ExtensionValueType {
  if (Array.isArray(extensionValue)) {
    for (const item of extensionValue) {
      if (!isExtensionPrimitiveValueType(item)) {
        return false;
      }
    }

    return true;
  }

  return isExtensionPrimitiveValueType(extensionValue);
}

export function isExtensionObject(
  extensionObject: unknown,
): extensionObject is ExtensionObject {
  if (typeof extensionObject !== 'object' || extensionObject == null) {
    return false;
  }

  const extensionKeys = Object.keys(extensionObject);
  for (const extensionKey of extensionKeys) {
    const extensionValue = (extensionObject as Record<string, unknown>)[
      extensionKey
    ];
    if (!isExtensionValueType(extensionValue)) {
      return false;
    }
  }
  return true;
}

export function IsExtensionObject(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IS_EXTENSION_OBJECT',
      constraints: [],
      validator: {
        validate: (value): boolean => isExtensionObject(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            `${eachPrefix} must be a valid extension object. Keys must be a string, values must be of type string, number, boolean, or their array types.`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
