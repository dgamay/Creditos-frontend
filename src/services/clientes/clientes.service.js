// ============================================
// SERVICIO DE CLIENTES - VERSIÓN CORREGIDA
// ============================================

import httpClient from '../api/http-client';
import { API_ENDPOINTS } from '../../core/config/api.config';

const clientesService = {
  // Obtener todos los clientes
  getAll: async () => {
    try {
      console.log('📤 GET:', API_ENDPOINTS.CLIENTES.GET_ALL);
      const response = await httpClient.get(API_ENDPOINTS.CLIENTES.GET_ALL);
      return response;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Crear nuevo cliente
 create: async (clienteData) => {
  try {
    console.log('📤 POST a:', API_ENDPOINTS.CLIENTES.CREATE);
    const response = await httpClient.post(API_ENDPOINTS.CLIENTES.CREATE, clienteData);
    return response;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
},

  // Actualizar cliente
  update: async (id, clienteData) => {
    try {
      const url = API_ENDPOINTS.CLIENTES.UPDATE(id);
      console.log('📤 PUT a:', url);
      const response = await httpClient.put(url, clienteData);
      return response;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  // Eliminar cliente
  delete: async (id) => {
    try {
      const url = API_ENDPOINTS.CLIENTES.DELETE(id);
      console.log('📤 DELETE a:', url);
      await httpClient.delete(url);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
  }
};

export default clientesService;