import api from './axios';

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),
};
