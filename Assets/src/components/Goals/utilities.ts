export const dateInputWrapper = (value?: string): string => {
  if (value) {
    const date = new Date(value);
    const [dateValue, ...rest] = date.toISOString().split('T');
    return dateValue;
  }
  return '';
};
