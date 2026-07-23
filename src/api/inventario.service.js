import api from './axios';

export const inventarioService = {
  getAll: () => api.get('/inventario').then((r) => r.data),
  getByProducto: (id) => api.get(`/inventario/producto/${id}`).then((r) => r.data),
  registrarEntrada: (data) => api.post('/inventario/entrada', data).then((r) => r.data),
  registrarSalida: (data) => api.post('/inventario/salida', data).then((r) => r.data),
};
