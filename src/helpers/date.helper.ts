export const getPersianDate = (date = new Date()) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'persian',
    numberingSystem: 'latn',
  };
  const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', options);
  return formatter.format(date);
};

export const getPersianDateParts = (date = new Date()): string[] =>
  getPersianDate(date).split('/');

export const addMonth = (date = new Date(), monthValue = 1): Date => {
  date = new Date(date);
  return new Date(date.setMonth(date.getMonth() + monthValue));
};
