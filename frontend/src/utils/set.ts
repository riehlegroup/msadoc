export function addMultipleItemsToSet<T>(items: T[], theSet: Set<T>): void {
  for (const singleItem of items) {
    theSet.add(singleItem);
  }
}
