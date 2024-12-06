export const getBeginTime = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getEndTime = (date = new Date()) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
