export const getUniqueItems = <T = unknown>(array: T[]): T[] =>
  Array.from(new Set(array));
