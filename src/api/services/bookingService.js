import api from '../../api';
import { endpoints } from '../endpoints';
import { AUDIT_ACTIONS, assertAuditSafeAction } from '../../utils/auditSafety';

export const bookingService = {
  listStayBookings: (params) => api.get(endpoints.bookings.stay, { params }).then((response) => response.data || []),
  listTourBookings: (params) => api.get(endpoints.bookings.tour, { params }).then((response) => response.data || []),
  getTourAvailability: (params) => api.get(endpoints.bookings.tourAvailability, { params }).then((response) => response.data || []),
  getStayAvailability: (params) => api.get(endpoints.bookings.stayAvailability, { params }).then((response) => response.data || []),
  createTourBooking: (payload) => api.post(endpoints.bookings.tour, payload).then((response) => response.data),
  createStayBooking: (payload) => api.post(endpoints.bookings.stay, payload).then((response) => response.data),
  updateBooking: ({ type, id, payload, auditAction }) => {
    if (auditAction) assertAuditSafeAction(auditAction, payload);
    if (['cancelled', 'CANCELLED'].includes(payload?.status)) assertAuditSafeAction(AUDIT_ACTIONS.CANCEL_BOOKING, payload);
    return api.put(`${type === 'stay' || type === 'stay_booking' ? endpoints.bookings.stay : endpoints.bookings.tour}/${id}`, payload).then((response) => response.data);
  },
  addToWaitlist: (payload) => api.post(endpoints.bookings.waitlist, payload).then((response) => response.data),
};
