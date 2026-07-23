import api from './axios';

export const clientesService = {
  getAll: () => api.get('/clientes').then((r) => r.data),
  getFrecuentes: () => api.get('/clientes/frecuentes').then((r) => r.data),
  getOne: (id) => api.get(`/clientes/${id}`).then((r) => r.data),
  getHistorial: (id) => api.get(`/clientes/${id}/historial`).then((r) => r.data),
  create: (data) => api.post('/clientes', data).then((r) => r.data),
  update: (id, data) => api.patch(`/clientes/${id}`, data).then((r) => r.data),
  clasificar: (id) => api.patch(`/clientes/${id}/clasificar`).then((r) => r.data),
};
