import axios from 'axios';
import { API_BASE_URL } from '../../core/config/api.config';

console.log('🌐 Conectando a API en:', API_BASE_URL); // <-- AÑADE ESTA LÍNEA

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para ver las peticiones
httpClient.interceptors.request.use(request => {
  console.log('📤 Petición:', request.method.toUpperCase(), request.url);
  return request;
});

// Interceptor para ver las respuestas
httpClient.interceptors.response.use(
  response => {
    console.log('📥 Respuesta:', response.status, response.config.url);
    return response.data;
  },
  error => {
    console.error('❌ Error en petición:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default httpClient;