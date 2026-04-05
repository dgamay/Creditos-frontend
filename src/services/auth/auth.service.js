// ============================================
// SERVICIO DE AUTENTICACIÓN - FRONTEND
// src/services/auth/auth.service.js
// Maneja el login de cobradores y el
// almacenamiento de su sesión en localStorage
// ============================================

import httpClient from '../api/http-client';

const authService = {

  // ------------------------------------------
  // LOGIN COBRADOR
  // Envía cédula + password al backend
  // Guarda los datos del cobrador en localStorage
  // @param {string} cedula
  // @param {string} password
  // @returns {Promise<Object>} datos del cobrador
  // ------------------------------------------
  loginCobrador: async (cedula, password) => {
    try {
      const response = await httpClient.post('/auth/cobrador/login', {
        cedula,
        password
      });

      // Guardar datos del cobrador en localStorage
      localStorage.setItem('cobradorData', JSON.stringify(response.cobrador));
      localStorage.setItem('userRole', 'cobrador');

      console.log('✅ Cobrador autenticado:', response.cobrador.nombre);
      return response.cobrador;

    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al iniciar sesión';
      console.error('❌ Error login cobrador:', mensaje);
      throw new Error(mensaje);
    }
  },

  // ------------------------------------------
  // CERRAR SESIÓN COBRADOR
  // Limpia localStorage
  // ------------------------------------------
  logoutCobrador: () => {
    localStorage.removeItem('cobradorData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tenantId');
    console.log('👋 Sesión cobrador cerrada');
  },

  // ------------------------------------------
  // OBTENER DATOS DEL COBRADOR LOGUEADO
  // @returns {Object|null}
  // ------------------------------------------
  getCobradorActual: () => {
    try {
      const data = localStorage.getItem('cobradorData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // ------------------------------------------
  // VERIFICAR SI HAY SESIÓN DE COBRADOR ACTIVA
  // @returns {boolean}
  // ------------------------------------------
  isCobradorAuthenticated: () => {
    return localStorage.getItem('userRole') === 'cobrador' &&
           !!localStorage.getItem('cobradorData');
  },

  // ------------------------------------------
  // ASIGNAR CONTRASEÑA A UN COBRADOR
  // Solo lo puede llamar el admin
  // @param {string} cobradorId
  // @param {string} password
  // @returns {Promise<Object>}
  // ------------------------------------------
  setPasswordCobrador: async (cobradorId, password) => {
    try {
      const response = await httpClient.put(
        `/auth/cobrador/${cobradorId}/password`,
        { password }
      );
      console.log('🔑 Contraseña asignada:', response.message);
      return response;
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al asignar contraseña';
      throw new Error(mensaje);
    }
  }
};

export default authService;