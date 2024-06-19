export const randomNumber = (min = 0, max = 100): number =>
  Math.floor(Math.random() * (max - min) + min);
