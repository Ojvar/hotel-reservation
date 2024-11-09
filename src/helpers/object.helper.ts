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

export function setPropertyByString(
  obj: AnyObject,
  path: string,
  value: unknown,
) {
  // Split the path string into an array of keys
  const keys = path.split('.');
  let current = obj;

  // Iterate through the keys, except for the last one
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    // If the key doesn't exist or isn't an object, create an empty object at that key
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }

    // Move to the next level in the object
    current = current[key];
  }

  // Set the final key to the specified value
  current[keys[keys.length - 1]] = value;
}
