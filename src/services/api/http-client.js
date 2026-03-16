import axios from 'axios';
import { API_BASE_URL } from '../../core/config/api.config';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ Interceptor lee el tenant en CADA petición — siempre actualizado
httpClient.interceptors.request.use(request => {
  const tenantId = localStorage.getItem('tenantId') || 
                   process.env.REACT_APP_TENANT_ID || 
                   'empresa1';
  
  request.headers['X-Tenant-ID'] = tenantId;
  
  console.log('📤', request.method.toUpperCase(), request.url);
  console.log('🏢 Tenant:', tenantId);
  return request;
});

httpClient.interceptors.response.use(
  response => {
    console.log('📥', response.status, response.config.url);
    return response.data;
  },
  error => {
    console.error('❌ Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default httpClient;