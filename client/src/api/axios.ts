import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Tu backend operativo
});

export default api;
