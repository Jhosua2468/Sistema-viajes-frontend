import axios from 'axios';

const apiViajes = axios.create({
  //baseURL: 'http://localhost:3000', //local
  //baseURL: 'http://52.54.242.122', // nube ip api viajes
  //baseURL: 'https://api-sistema-viajes.rootcode.com.bo', // nube dominio api viajes
  baseURL: 'https://alb-viajes-backend-1486483178.us-east-1.elb.amazonaws.com/', //nube con balanceador de carga"
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
