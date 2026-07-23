import api from './axios';

export const productosService = {
  getAll: (categoriaId) => {
    const params = categoriaId ? { categoria_id: categoriaId } : {};
    return api.get('/productos', { params }).then((r) => r.data);
  },
  getOne: (id) => api.get(`/productos/${id}`).then((r) => r.data),
  getByCodigo: (codigo) => api.get(`/productos/buscar/${codigo}`).then((r) => r.data),
  getAlertas: () => api.get('/productos/stock/alertas').then((r) => r.data),
  create: (data) => api.post('/productos', data).then((r) => r.data),
  update: (id, data) => api.patch(`/productos/${id}`, data).then((r) => r.data),
  descontinuar: (id) => api.delete(`/productos/${id}`).then((r) => r.data),
};
