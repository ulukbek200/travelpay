import api from '../../api';
import { endpoints } from '../endpoints';

export const tourService = {
  list: (params) => api.get(endpoints.tours.list, { params }).then((response) => response.data || []),
  create: (payload) => api.post(endpoints.tours.list, payload).then((response) => response.data),
  update: (id, payload) => api.put(endpoints.tours.detail(id), payload).then((response) => response.data),
  delete: (id) => api.delete(endpoints.tours.detail(id)).then((response) => response.data),
  updateDepartureOperations: ({ tourId, slotId, payload }) => api.put(endpoints.bookings.tourDepartureOperations(tourId, slotId), payload).then((response) => response.data),
};
