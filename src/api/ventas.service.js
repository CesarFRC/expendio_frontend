import api from './axios';

export const ventasService = {
  getAll: () => api.get('/ventas').then((r) => r.data),
  getOne: (id) => api.get(`/ventas/${id}`).then((r) => r.data),
  getTicket: (id) => api.get(`/ventas/${id}/ticket`).then((r) => r.data),
  create: (data) => api.post('/ventas', data).then((r) => r.data),
};
