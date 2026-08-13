export const AUDIT_ACTIONS = {
  CANCEL_BOOKING: 'CANCEL_BOOKING',
  RESCHEDULE_BOOKING: 'RESCHEDULE_BOOKING',
  REFUND_PAYMENT: 'REFUND_PAYMENT',
  DELETE_ENTITY: 'DELETE_ENTITY',
  BLOCK_DATES: 'BLOCK_DATES',
};

export const auditSafetyRules = {
  [AUDIT_ACTIONS.CANCEL_BOOKING]: {
    destructive: false,
    historyRequired: true,
    message: 'Cancellation изменяет статус брони и сохраняет историю. Это не delete.',
  },
  [AUDIT_ACTIONS.RESCHEDULE_BOOKING]: {
    destructive: false,
    historyRequired: true,
    message: 'Reschedule должен сохранять исходную бронь и историю переноса.',
  },
  [AUDIT_ACTIONS.REFUND_PAYMENT]: {
    destructive: false,
    historyRequired: true,
    message: 'Refund создаёт отдельную операцию. Исходный платёж не удаляется.',
  },
  [AUDIT_ACTIONS.DELETE_ENTITY]: {
    destructive: true,
    historyRequired: true,
    message: 'Физическое удаление допустимо только для нефинансовых сущностей и после явного подтверждения.',
  },
  [AUDIT_ACTIONS.BLOCK_DATES]: {
    destructive: false,
    historyRequired: true,
    message: 'Блокировка дат должна сохранять причину и автора.',
  },
};

export const getAuditSafetyRule = (action) => auditSafetyRules[action] || {
  destructive: false,
  historyRequired: true,
  message: 'Действие должно сохранять историю изменений.',
};

export const assertAuditSafeAction = (action, payload = {}) => {
  const rule = getAuditSafetyRule(action);
  if (rule.historyRequired && payload.skipHistory) {
    throw new Error(rule.message);
  }
  if (rule.destructive && !payload.confirmed) {
    throw new Error(rule.message);
  }
  return true;
};
