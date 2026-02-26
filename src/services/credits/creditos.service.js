// ============================================
// SERVICIO DE CRÉDITOS
// Adaptado a la estructura real del backend
// ============================================

import httpClient from '../api/http-client';
import { API_ENDPOINTS } from '../../core/config/api.config';

const creditsService = {
  /**
   * Obtiene todos los créditos de un cliente específico
   * @param {string} clienteId - ID del cliente
   */
  // Obtener créditos por cliente
getByCliente: async (clienteId) => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.CREDITOS.GET_BY_CLIENTE(clienteId));
    return response;
  } catch (error) {
    console.error(`Error al obtener créditos del cliente ${clienteId}:`, error);
    return []; // Retornar array vacío en caso de error
  }
},

  /**
   * Obtiene créditos pendientes por cobrador
   * @param {string} cobradorId - ID del cobrador
   */
  getPendientesByCobrador: async (cobradorId) => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.CREDITOS.GET_BY_COBRADOR(cobradorId));
      return response;
    } catch (error) {
      console.error('Error al obtener créditos por cobrador:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo crédito
   * @param {Object} creditData - Datos del crédito según el modelo
   */
  create: async (creditData) => {
    try {
      // Transformar datos del frontend al formato del backend
      const backendData = {
        fecha_origen: creditData.fecha_origen || creditData.loanDate,
        fecha_pago: creditData.fecha_pago || creditData.paymentDate,
        monto_prestado: creditData.monto_prestado || creditData.amount,
        monto_por_pagar: creditData.monto_por_pagar || (creditData.amount * 1.3),
        estado: creditData.estado || 'pendiente',
        cliente_id: creditData.cliente_id || creditData.clientId,
        cobrador_id: creditData.cobrador_id || creditData.collectorId
      };

      const response = await httpClient.post(API_ENDPOINTS.CREDITOS.CREATE, backendData);
      return response;
    } catch (error) {
      console.error('Error al crear crédito:', error);
      throw error;
    }
  },

  /**
   * Helper para obtener créditos de múltiples clientes
   * Útil para la vista general de todos los créditos
   * @param {Array} clientes - Lista de clientes
   */
  getAllFromClientes: async (clientes) => {
    try {
      const promises = clientes.map(cliente => 
        creditsService.getByCliente(cliente._id)
          .then(creditos => creditos.map(c => ({
            ...c,
            clienteNombre: cliente.nombre,
            clienteCedula: cliente.cedula
          })))
          .catch(() => []) // Si falla un cliente, continuar con los demás
      );

      const resultados = await Promise.all(promises);
      // Aplanar array y ordenar por fecha
      return resultados
        .flat()
        .sort((a, b) => new Date(b.fecha_origen) - new Date(a.fecha_origen));
    } catch (error) {
      console.error('Error al obtener todos los créditos:', error);
      throw error;
    }
  }
};

export default creditsService;