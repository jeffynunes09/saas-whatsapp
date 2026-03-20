import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const token = data.session.access_token;
    localStorage.setItem('access_token', token);
    document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    return data;
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; max-age=0';
    window.location.href = '/login';
  },
};
