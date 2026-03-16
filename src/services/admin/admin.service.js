// ============================================
// SERVICIO DE ADMINISTRACIÓN - SUPERADMIN
// FRONTEND — src/services/admin/admin.service.js
// ============================================

import axios from 'axios';
import { API_BASE_URL } from '../../core/config/api.config';

// Cliente HTTP exclusivo para admin
const adminClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Agrega X-Admin-Secret en cada petición
adminClient.interceptors.request.use(request => {
  const adminSecret = sessionStorage.getItem('adminSecret');
  if (adminSecret) {
    request.headers['X-Admin-Secret'] = adminSecret;
  }
  console.log('🔐 Admin request:', request.method.toUpperCase(), request.url);
  return request;
});

// Manejo centralizado de errores
adminClient.interceptors.response.use(
  response => {
    console.log('✅ Admin response:', response.status, response.config.url);
    return response.data;
  },
  error => {
    const status = error.response?.status;
    console.error('❌ Admin error:', status, error.message);
    if (status === 401 || status === 403) {
      sessionStorage.removeItem('adminSecret');
    }
    return Promise.reject(error);
  }
);

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================
const adminService = {

  // Verificar credenciales de superadmin
  login: async (secret) => {
    try {
      sessionStorage.setItem('adminSecret', secret);
      await adminClient.get('/admin/verify');
      console.log('✅ Admin autenticado');
      return true;
    } catch (error) {
      sessionStorage.removeItem('adminSecret');
      throw new Error('Credenciales incorrectas');
    }
  },

  // Cerrar sesión admin
  logout: () => {
    sessionStorage.removeItem('adminSecret');
    console.log('👋 Sesión admin cerrada');
  },

  // Verificar si hay sesión activa
  isAuthenticated: () => {
    return !!sessionStorage.getItem('adminSecret');
  },

  // Obtener todas las empresas
  getEmpresas: async () => {
    try {
      return await adminClient.get('/admin/empresas');
    } catch (error) {
      console.error('❌ Error al obtener empresas:', error.message);
      throw error;
    }
  },

  // Crear nueva empresa
  createEmpresa: async (empresaData) => {
    try {
      return await adminClient.post('/admin/empresas', empresaData);
    } catch (error) {
      console.error('❌ Error al crear empresa:', error.message);
      throw error;
    }
  },

  // Activar o desactivar empresa
  toggleEmpresa: async (id, activa) => {
    try {
      return await adminClient.put(`/admin/empresas/${id}/toggle`, { activa });
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error.message);
      throw error;
    }
  },

  // Eliminar empresa
  deleteEmpresa: async (id) => {
    try {
      return await adminClient.delete(`/admin/empresas/${id}`);
    } catch (error) {
      console.error('❌ Error al eliminar empresa:', error.message);
      throw error;
    }
  },

  // Estadísticas globales
  getStats: async () => {
    try {
      return await adminClient.get('/admin/stats');
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error.message);
      throw error;
    }
  }
};

export default adminService;