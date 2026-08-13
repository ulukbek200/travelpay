import api from '../../api';
import { endpoints } from '../endpoints';
import { AUDIT_ACTIONS, assertAuditSafeAction } from '../../utils/auditSafety';

export const paymentService = {
  listRequests: (params) => api.get(endpoints.payments.requests, { params }).then((response) => response.data || []),
  approveRequest: (id, payload) => api.put(endpoints.payments.approveRequest(id), payload).then((response) => response.data),
  rejectRequest: (id, payload) => api.put(endpoints.payments.rejectRequest(id), payload).then((response) => response.data),
  createRefund: (payload) => {
    assertAuditSafeAction(AUDIT_ACTIONS.REFUND_PAYMENT, payload);
    return api.post(endpoints.bookings.refund, payload).then((response) => response.data);
  },
  getSettings: (params) => api.get(endpoints.payments.settings, { params }).then((response) => response.data),
  updateSettings: (payload) => api.put(endpoints.payments.settings, payload).then((response) => response.data),
};
