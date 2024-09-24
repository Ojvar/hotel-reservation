import {AnyObject} from '@loopback/repository';

export function getObjectDifferences<T extends object>(obj1: T, obj2: T): T {
  const differences = {} as T;

  // Check properties in obj1
  for (const key in obj1) {
    if (
      Object.prototype.hasOwnProperty.call(obj1, key) &&
      obj1[key] !== obj2[key]
    ) {
      differences[key] = obj1[key];
    }
  }

  // Check properties in obj2
  for (const key in obj2) {
    if (
      Object.prototype.hasOwnProperty.call(obj2, key) &&
      obj1[key] !== obj2[key] &&
      obj1[key]
    ) {
      differences[key] = obj1[key];
    }
  }

  return differences as T;
}

export function getPropertyByString(obj: AnyObject, path: string): unknown {
  return (path ?? '')
    .split('.')
    .reduce(
      (acc, key) =>
        Object.prototype.hasOwnProperty.call(acc, key)
          ? acc[key as keyof typeof acc]
          : undefined,
      obj,
    );
}
