import api from '../../api';
import { endpoints } from '../endpoints';

export const clientService = {
  list: (params) => api.get(endpoints.clients.list, { params }).then((response) => response.data || []),
  detail: (id) => api.get(endpoints.clients.detail(id)).then((response) => response.data),
  update: (id, payload) => api.put(endpoints.clients.detail(id), payload).then((response) => response.data),
};
