import axios from 'axios';

const apiViajes = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiViajes.interceptors.request.use(
  (config) => {
    // 💡 CAMBIO AQUÍ: Buscamos en AMBAS memorias
    const token = localStorage.getItem('token_acceso') || sessionStorage.getItem('token_acceso'); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiViajes;
