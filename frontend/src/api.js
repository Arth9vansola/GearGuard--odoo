import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('gearguard_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('gearguard_token');
  }
}

export default api;
