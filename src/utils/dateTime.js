export const BUSINESS_TIMEZONE = 'Asia/Bishkek';
export const BUSINESS_LOCALE = 'ru-RU';

const dateTimeFormatCache = new Map();

const getFormatter = (options = {}) => {
  const key = JSON.stringify({ locale: BUSINESS_LOCALE, timeZone: BUSINESS_TIMEZONE, ...options });
  if (!dateTimeFormatCache.has(key)) {
    dateTimeFormatCache.set(key, new Intl.DateTimeFormat(BUSINESS_LOCALE, {
      timeZone: BUSINESS_TIMEZONE,
      ...options,
    }));
  }
  return dateTimeFormatCache.get(key);
};

export const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatBusinessDate = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return '—';
  return getFormatter({ day: '2-digit', month: 'short', year: 'numeric', ...options }).format(date);
};

export const formatBusinessTime = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return '—';
  return getFormatter({ hour: '2-digit', minute: '2-digit', ...options }).format(date);
};

export const formatBusinessDateTime = (value, options = {}) => {
  const date = toDate(value);
  if (!date) return '—';
  return getFormatter({
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
};

export const getBusinessDateParts = (value) => {
  const date = toDate(value);
  if (!date) return null;
  const parts = getFormatter({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  return parts;
};

export const getBusinessDateKey = (value) => {
  const parts = getBusinessDateParts(value);
  if (!parts) return '';
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const isSameBusinessDay = (left, right) => (
  Boolean(left && right) && getBusinessDateKey(left) === getBusinessDateKey(right)
);

export const nowInBusinessTimezone = () => new Date();

export const getBusinessTimezoneLabel = () => BUSINESS_TIMEZONE;
