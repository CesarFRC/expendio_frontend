import api from './axios';

export const proveedoresService = {
  getAll: () => api.get('/proveedores').then((r) => r.data),
  getOne: (id) => api.get(`/proveedores/${id}`).then((r) => r.data),
  getProductos: (id) => api.get(`/proveedores/${id}/productos`).then((r) => r.data),
  create: (data) => api.post('/proveedores', data).then((r) => r.data),
  update: (id, data) => api.patch(`/proveedores/${id}`, data).then((r) => r.data),
};
