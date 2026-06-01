const DAY_MS = 24 * 60 * 60 * 1000;

export const SAVINGS_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const DEFAULT_SAVINGS = {
  goalAmount: 0,
  currentAmount: 0,
  durationMonths: 0,
  startDate: '',
  endDate: '',
  monthlyPayment: 0,
  status: SAVINGS_STATUSES.CANCELLED,
};

const toPositiveNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

const toIsoDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

export const addMonths = (value, months) => {
  const date = value ? new Date(value) : new Date();
  const next = new Date(date);
  next.setMonth(next.getMonth() + Number(months || 0));
  return next.toISOString();
};

export const deriveSavingsStatus = (savings, now = new Date()) => {
  const goalAmount = toPositiveNumber(savings?.goalAmount);
  const currentAmount = toPositiveNumber(savings?.currentAmount);
  const endDate = toIsoDate(savings?.endDate);
  const currentStatus = savings?.status;

  if (!goalAmount || !savings?.durationMonths || !savings?.startDate) {
    return SAVINGS_STATUSES.CANCELLED;
  }

  if (currentStatus === SAVINGS_STATUSES.CANCELLED) {
    return SAVINGS_STATUSES.CANCELLED;
  }

  if (currentAmount >= goalAmount) {
    return SAVINGS_STATUSES.COMPLETED;
  }

  if (endDate && new Date(endDate).getTime() < now.getTime()) {
    return SAVINGS_STATUSES.EXPIRED;
  }

  return SAVINGS_STATUSES.ACTIVE;
};

export const normalizeSavings = (savings) => {
  if (!savings || typeof savings !== 'object') {
    return { ...DEFAULT_SAVINGS };
  }

  const goalAmount = toPositiveNumber(savings.goalAmount);
  const currentAmount = toPositiveNumber(savings.currentAmount);
  const durationMonths = toPositiveNumber(savings.durationMonths);
  const startDate = toIsoDate(savings.startDate);
  const endDate = toIsoDate(savings.endDate);
  const monthlyPayment = toPositiveNumber(savings.monthlyPayment);

  const normalized = {
    goalAmount,
    currentAmount,
    durationMonths,
    startDate,
    endDate,
    monthlyPayment,
    status: savings.status || DEFAULT_SAVINGS.status,
  };

  return {
    ...normalized,
    status: deriveSavingsStatus(normalized),
  };
};

export const createSavingsPlan = ({
  goalAmount,
  durationMonths,
  currentAmount = 0,
  startDate = new Date().toISOString(),
}) => {
  const normalizedGoal = toPositiveNumber(goalAmount);
  const normalizedDuration = toPositiveNumber(durationMonths);
  const normalizedCurrent = toPositiveNumber(currentAmount);
  const safeStartDate = toIsoDate(startDate) || new Date().toISOString();
  const monthlyPayment = normalizedDuration
    ? Math.ceil(Math.max(normalizedGoal - normalizedCurrent, 0) / normalizedDuration)
    : 0;

  return normalizeSavings({
    goalAmount: normalizedGoal,
    currentAmount: normalizedCurrent,
    durationMonths: normalizedDuration,
    startDate: safeStartDate,
    endDate: addMonths(safeStartDate, normalizedDuration),
    monthlyPayment,
    status: SAVINGS_STATUSES.ACTIVE,
  });
};

export const getSavingsMetrics = (savings, now = new Date()) => {
  const normalized = normalizeSavings(savings);
  const goalAmount = normalized.goalAmount;
  const currentAmount = normalized.currentAmount;
  const remainingAmount = Math.max(goalAmount - currentAmount, 0);
  const progressPercent = goalAmount ? Math.min(Math.round((currentAmount / goalAmount) * 100), 100) : 0;
  const endTime = normalized.endDate ? new Date(normalized.endDate).getTime() : 0;
  const startTime = normalized.startDate ? new Date(normalized.startDate).getTime() : 0;
  const msLeft = endTime ? Math.max(endTime - now.getTime(), 0) : 0;
  const daysLeft = endTime ? Math.max(Math.ceil((endTime - now.getTime()) / DAY_MS), 0) : 0;
  const totalDays = startTime && endTime ? Math.max(Math.ceil((endTime - startTime) / DAY_MS), 0) : 0;
  const hoursLeft = Math.floor((msLeft % DAY_MS) / (60 * 60 * 1000));
  const minutesLeft = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));

  return {
    ...normalized,
    remainingAmount,
    progressPercent,
    daysLeft,
    hoursLeft,
    minutesLeft,
    msLeft,
    totalDays,
    isReadyToBuy: normalized.status === SAVINGS_STATUSES.COMPLETED,
    hasPlan: Boolean(goalAmount && normalized.durationMonths && normalized.startDate),
  };
};

export const buildSavingsChartData = (topUps = [], savings = DEFAULT_SAVINGS) => {
  const normalizedTopUps = Array.isArray(topUps) ? [...topUps] : [];
  normalizedTopUps.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningTotal = 0;
  const points = normalizedTopUps.map((entry) => {
    runningTotal += Number(entry.amount) || 0;
    const date = new Date(entry.date);
    return {
      month: date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
      amount: runningTotal,
      topUp: Number(entry.amount) || 0,
    };
  });

  if (!points.length && savings?.startDate) {
    points.push({
      month: new Date(savings.startDate).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
      amount: Number(savings.currentAmount) || 0,
      topUp: 0,
    });
  }

  return points;
};

export const formatSavingsStatus = (status) => {
  const labels = {
    [SAVINGS_STATUSES.ACTIVE]: 'Активно',
    [SAVINGS_STATUSES.COMPLETED]: 'Завершено',
    [SAVINGS_STATUSES.EXPIRED]: 'Просрочено',
    [SAVINGS_STATUSES.CANCELLED]: 'Не создано',
  };

  return labels[status] || labels[SAVINGS_STATUSES.CANCELLED];
};

export const getSavingsStatusColor = (status) => {
  const colors = {
    [SAVINGS_STATUSES.ACTIVE]: 'processing',
    [SAVINGS_STATUSES.COMPLETED]: 'success',
    [SAVINGS_STATUSES.EXPIRED]: 'error',
    [SAVINGS_STATUSES.CANCELLED]: 'default',
  };

  return colors[status] || colors[SAVINGS_STATUSES.CANCELLED];
};
