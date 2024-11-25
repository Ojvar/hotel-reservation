export const randomNumber = (min = 0, max = 100): number =>
  Math.floor(Math.random() * (max - min) + min);

export const adjustRange = (value = 100, min = 0, max = 100) =>
  Math.max(min, Math.min(value, max));

export const adjustMin = (value: number = 0, min = 0) => Math.max(min, value);

