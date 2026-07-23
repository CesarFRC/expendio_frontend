import api from './axios';

export const empleadosService = {
  getAll: () => api.get('/empleados').then((r) => r.data),
  getOne: (id) => api.get(`/empleados/${id}`).then((r) => r.data),
  create: (data) => api.post('/empleados', data).then((r) => r.data),
  update: (id, data) => api.patch(`/empleados/${id}`, data).then((r) => r.data),
  asignarRol: (id, rol_id) => api.patch(`/empleados/${id}/rol`, { rol_id }).then((r) => r.data),
  remove: (id) => api.delete(`/empleados/${id}`).then((r) => r.data),
};
