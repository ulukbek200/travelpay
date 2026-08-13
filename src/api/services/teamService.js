import api from '../../api';
import { endpoints } from '../endpoints';

export const teamService = {
  list: (params) => api.get(endpoints.team.list, { params }).then((response) => response.data || []),
  create: (payload) => api.post(endpoints.team.list, payload).then((response) => response.data),
  update: (id, payload) => api.put(endpoints.team.detail(id), payload).then((response) => response.data),
};
