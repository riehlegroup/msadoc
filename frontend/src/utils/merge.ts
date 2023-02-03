/**
 * Merge two objects in a type-safe way and return the merged object.
 *
 * This function essentially just returns `{...baseObject, ...patchObject}`.
 * But: This function ensures that {@link patchObject} only contains keys that are part of the type of {@link baseObject}.
 * Thus, it is particularly useful when you want to create a new "version" of an already existing object by patching some of its values.
 *
 * ### Why?
 *
 * When updating State in React, we typically use a pattern like this:
 *
 * ``` ts
 * setState(state => ({...state, foo: bar }));
 * ```
 *
 * The problem: We get no warning or the like if "foo" from the example above is not part of our State.
 *
 * A better solution is to use {@link merge}:
 * ``` ts
 * setState(state => merge(state, { foo: bar }));
 * ```
 * Here, we will get an error if the {@link patchObject} contains a key that is not available in the type of the {@link baseObject}.
 */
export function merge<T extends object>(
  baseObject: T,
  patchObject: Partial<T>,
): T {
  return { ...baseObject, ...patchObject };
}
