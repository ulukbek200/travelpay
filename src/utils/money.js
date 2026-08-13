export const DEFAULT_CURRENCY = 'KGS';
export const DEFAULT_CURRENCY_SYMBOL = 'сом';
export const DEFAULT_MINOR_UNIT_FACTOR = 100;

const currencySymbols = {
  KGS: 'сом',
  USD: '$',
  EUR: '€',
  KZT: '₸',
  UZS: 'сум',
  RUB: '₽',
};

export const toMinorUnits = (value, factor = DEFAULT_MINOR_UNIT_FACTOR) => {
  if (value === null || value === undefined || value === '') return 0;
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  const [whole = '0', fraction = ''] = normalized.split('.');
  const sign = whole.trim().startsWith('-') ? -1 : 1;
  const safeWhole = Math.abs(Number.parseInt(whole, 10)) || 0;
  const safeFraction = Number.parseInt(`${fraction}00`.slice(0, 2), 10) || 0;
  return sign * ((safeWhole * factor) + safeFraction);
};

export const fromMinorUnits = (minorValue, factor = DEFAULT_MINOR_UNIT_FACTOR) => (
  Number(minorValue || 0) / factor
);

export const addMoneyMinor = (...values) => values.reduce((sum, value) => sum + Number(value || 0), 0);

export const subtractMoneyMinor = (left, right) => Number(left || 0) - Number(right || 0);

export const formatMoneyMinor = (minorValue, {
  currency = DEFAULT_CURRENCY,
  locale = 'ru-RU',
  factor = DEFAULT_MINOR_UNIT_FACTOR,
  symbol = currencySymbols[currency] || currency,
} = {}) => `${fromMinorUnits(minorValue, factor).toLocaleString(locale, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})} ${symbol}`;

export const formatMoneyMajor = (value, options = {}) => (
  formatMoneyMinor(toMinorUnits(value), options)
);
