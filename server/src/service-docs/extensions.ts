export type ExtensionKey = `x-${string}`;
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
  } else if (!isExtensionPrimitiveValueType(extensionValue)) {
    return false;
  }

  return true;
}

export function isExtensionObject(
  extensionObject: unknown,
): extensionObject is ExtensionObject {
  if (typeof extensionObject !== 'object' || extensionObject == null) {
    return false;
  }

  const extensionKeys = Object.keys(extensionObject).filter((key) =>
    key.startsWith('x-'),
  );
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

export function extractExtensions<T extends ExtensionObject>(
  extensionObject: T,
): ExtensionObject {
  const extensionKeys = Object.keys(extensionObject).filter((key) =>
    key.startsWith('x-'),
  );
  const extensions: Record<string, ExtensionValueType> = {};
  for (const extensionKey of extensionKeys) {
    extensions[extensionKey] = (
      extensionObject as Record<string, ExtensionValueType>
    )[extensionKey];
  }
  return extensions;
}
