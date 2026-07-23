import api from './axios';

export const categoriasService = {
  getAll: () => api.get('/categorias').then((r) => r.data),
  getOne: (id) => api.get(`/categorias/${id}`).then((r) => r.data),
  create: (data) => api.post('/categorias', data).then((r) => r.data),
  update: (id, data) => api.patch(`/categorias/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categorias/${id}`).then((r) => r.data),
};
