// ============================================
// SERVICIO DE CLIENTES - Aquí se hacen las llamadas
// ============================================

import httpClient from '../api/http-client';
import { API_ENDPOINTS } from '../../core/config/api.config';

const clientesService = {

  // --- Para LISTAR todos los clientes (GET /api/clientes) ---
  getAll: async () => {
    try {
      // httpClient.get(API_ENDPOINTS.CLIENTES.BASE) hará una petición GET a la URL + '/clientes'
      const response = await httpClient.get(API_ENDPOINTS.CLIENTES.BASE);
      // ¡Ojo! Como tu API devuelve el array directamente, la respuesta YA es el array.
      return response; 
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error; // Lanzamos el error para que quien llame a esta función sepa que falló
    }
  },

  // --- Para CREAR un nuevo cliente (POST /api/clientes) ---
  create: async (clienteData) => {
    try {
      // clienteData debe ser un objeto como { nombre, cedula, direccion, celular, cobrador_id }
      const response = await httpClient.post(API_ENDPOINTS.CLIENTES.BASE, clienteData);
      return response; // La respuesta será el cliente creado (con su _id)
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // --- Para ACTUALIZAR un cliente (PUT /api/clientes/:id) ---
  update: async (id, clienteData) => {
    try {
      const response = await httpClient.put(API_ENDPOINTS.CLIENTES.UPDATE(id), clienteData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar cliente ${id}:`, error);
      throw error;
    }
  },

  // --- Para ELIMINAR un cliente (DELETE /api/clientes/:id) ---
  delete: async (id) => {
    try {
      await httpClient.delete(API_ENDPOINTS.CLIENTES.DELETE(id));
      // No necesitas retornar nada cuando es DELETE, solo saber que fue exitoso
    } catch (error) {
      console.error(`Error al eliminar cliente ${id}:`, error);
      throw error;
    }
  }
};

export default clientesService;