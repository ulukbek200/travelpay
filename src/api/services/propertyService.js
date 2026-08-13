import api from '../../api';
import { endpoints } from '../endpoints';

export const propertyService = {
  list: (params) => api.get(endpoints.properties.list, { params }).then((response) => response.data || []),
  create: (payload) => api.post(endpoints.properties.list, payload).then((response) => response.data),
  update: (id, payload) => api.put(endpoints.properties.detail(id), payload).then((response) => response.data),
  delete: (id) => api.delete(endpoints.properties.detail(id)).then((response) => response.data),
  availability: (params) => api.get(endpoints.bookings.stayAvailability, { params }).then((response) => response.data),
};
