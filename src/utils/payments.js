export const formatSom = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const paymentStatusMeta = {
  pending: { label: 'Ожидает чека', color: 'default' },
  under_review: { label: 'На проверке', color: 'orange' },
  approved: { label: 'Подтверждён', color: 'green' },
  rejected: { label: 'Отклонён', color: 'red' },
  cancelled: { label: 'Отменён', color: 'default' },
};

export const transactionTypeMeta = {
  deposit: { label: 'Пополнение', color: 'green', sign: '+' },
  payment: { label: 'Оплата', color: 'blue', sign: '−' },
  reserve: { label: 'Резервирование', color: 'gold', sign: '−' },
  release: { label: 'Снятие резерва', color: 'cyan', sign: '+' },
  refund: { label: 'Возврат', color: 'green', sign: '+' },
  bonus: { label: 'Бонус', color: 'purple', sign: '+' },
  adjustment: { label: 'Корректировка', color: 'default', sign: '' },
};

export const paymentMethodMeta = {
  qr: { label: 'Оплата по QR', color: 'blue' },
  cash: { label: 'Наличные', color: 'green' },
  card: { label: 'Карта', color: 'purple' },
  transfer: { label: 'Перевод', color: 'cyan' },
  wallet: { label: 'TravelPay balance', color: 'gold' },
  savings: { label: 'TravelPay balance', color: 'gold' },
  manager: { label: 'Через менеджера', color: 'gold' },
  manual: { label: 'Manager payment', color: 'volcano' },
  mixed: { label: 'Смешанная оплата', color: 'magenta' },
};

export const receiptToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const isValidReceiptFile = (file) => {
  if (!file) return true;
  return ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type);
};
