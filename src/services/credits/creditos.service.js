// ============================================
// SERVICIO DE CRÉDITOS - VERSIÓN MEJORADA
// Incluye cálculo de comisión para cobradores (20%)
// ============================================

import httpClient from '../api/http-client';
import { API_ENDPOINTS } from '../../core/config/api.config';

/**
 * Servicio para manejar todas las operaciones relacionadas con créditos
 * Incluye integración con cobradores para cálculo de comisiones
 */
const creditsService = {
  /**
   * Obtiene todos los créditos de un cliente específico
   * @param {string} clienteId - ID del cliente
   * @returns {Promise<Array>} Lista de créditos del cliente
   */
  getByCliente: async (clienteId) => {
    try {
      console.log(`📤 GET: ${API_ENDPOINTS.CREDITOS.GET_BY_CLIENTE(clienteId)}`);
      const response = await httpClient.get(API_ENDPOINTS.CREDITOS.GET_BY_CLIENTE(clienteId));
      return response;
    } catch (error) {
      console.error(`Error al obtener créditos del cliente ${clienteId}:`, error);
      return []; // Retornar array vacío en caso de error
    }
  },

  /**
   * Obtiene créditos por cobrador
   * @param {string} cobradorId - ID del cobrador
   * @returns {Promise<Array>} Lista de créditos del cobrador
   */
  getByCobrador: async (cobradorId) => {
    try {
      console.log(`📤 GET: ${API_ENDPOINTS.CREDITOS.GET_BY_COBRADOR(cobradorId)}`);
      const response = await httpClient.get(API_ENDPOINTS.CREDITOS.GET_BY_COBRADOR(cobradorId));
      return response;
    } catch (error) {
      console.error(`Error al obtener créditos del cobrador ${cobradorId}:`, error);
      return [];
    }
  },

  /**
   * Crea un nuevo crédito
   * @param {Object} creditData - Datos del crédito
   * @returns {Promise<Object>} Crédito creado
   */
  create: async (creditData) => {
    try {
      console.log('📤 POST a:', API_ENDPOINTS.CREDITOS.CREATE);
      console.log('📤 Datos:', creditData);
      
      const response = await httpClient.post(API_ENDPOINTS.CREDITOS.CREATE, creditData);
      return response;
    } catch (error) {
      console.error('Error al crear crédito:', error);
      throw error;
    }
  },

  /**
   * Actualiza un crédito existente
   * @param {string} id - ID del crédito
   * @param {Object} creditData - Datos actualizados
   * @returns {Promise<Object>} Crédito actualizado
   */
  update: async (id, creditData) => {
    try {
      const url = API_ENDPOINTS.CREDITOS.UPDATE(id);
      console.log('📤 PUT a:', url);
      const response = await httpClient.put(url, creditData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar crédito ${id}:`, error);
      throw error;
    }
  },

  /**
   * Marca un crédito como pagado y calcula comisión del cobrador
   * @param {string} id - ID del crédito
   * @param {string} cobradorId - ID del cobrador que recibirá la comisión
   * @returns {Promise<Object>} Crédito actualizado con información de comisión
   */
  marcarComoPagado: async (id, cobradorId) => {
    try {
      // Obtener el crédito primero para conocer el monto
      const credit = await creditsService.getById(id);
      
      if (!credit) {
        throw new Error('Crédito no encontrado');
      }

      // Calcular comisión del 20% sobre el monto prestado
      const comision = credit.monto_prestado * 0.2;

      // Datos actualizados incluyendo comisión
      const updateData = {
        estado: 'pagado',
        fecha_pago_real: new Date().toISOString(),
        comision_cobrador: comision,
        cobrador_id: cobradorId
      };

      const url = API_ENDPOINTS.CREDITOS.UPDATE(id);
      console.log('📤 Marcando como pagado:', url);
      console.log('📤 Comisión del 20% calculada:', comision);
      
      const response = await httpClient.put(url, updateData);
      return response;
    } catch (error) {
      console.error(`Error al marcar crédito ${id} como pagado:`, error);
      throw error;
    }
  },

  /**
   * Obtiene un crédito por su ID
   * @param {string} id - ID del crédito
   * @returns {Promise<Object>} Crédito encontrado
   */
  getById: async (id) => {
    try {
      const url = API_ENDPOINTS.CREDITOS.GET_BY_ID(id);
      console.log('📤 GET:', url);
      const response = await httpClient.get(url);
      return response;
    } catch (error) {
      console.error(`Error al obtener crédito ${id}:`, error);
      throw error;
    }
  },

  /**
   * Helper para obtener créditos de múltiples clientes
   * @param {Array} clientes - Lista de clientes
   * @returns {Promise<Array>} Lista de todos los créditos enriquecidos
   */
  getAllFromClientes: async (clientes) => {
    try {
      const promises = clientes.map(cliente => 
        creditsService.getByCliente(cliente._id)
          .then(creditos => creditos.map(c => ({
            ...c,
            clienteNombre: cliente.nombre,
            clienteCedula: cliente.cedula,
            clienteId: cliente._id
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
      return [];
    }
  },

  /**
   * Obtiene estadísticas de comisiones por cobrador
   * @param {string} cobradorId - ID del cobrador (opcional)
   * @returns {Promise<Object>} Estadísticas de comisiones
   */
  getEstadisticasComisiones: async (cobradorId = null) => {
    try {
      let creditos = [];
      
      if (cobradorId) {
        // Si se especifica cobrador, obtener solo sus créditos
        creditos = await creditsService.getByCobrador(cobradorId);
      } else {
        // Si no, obtener todos los clientes y sus créditos
        const clientesService = require('../clientes/clientes.service').default;
        const clientes = await clientesService.getAll();
        creditos = await creditsService.getAllFromClientes(clientes);
      }

      // Filtrar solo créditos pagados que tengan comisión
      const pagadosConComision = creditos.filter(c => 
        c.estado === 'pagado' && c.comision_cobrador
      );

      // Calcular totales
      const totalComisiones = pagadosConComision.reduce((sum, c) => sum + (c.comision_cobrador || 0), 0);
      const cantidadCreditosPagados = pagadosConComision.length;

      return {
        totalComisiones,
        cantidadCreditosPagados,
        promedioComision: cantidadCreditosPagados > 0 ? totalComisiones / cantidadCreditosPagados : 0,
        creditos: pagadosConComision
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de comisiones:', error);
      return {
        totalComisiones: 0,
        cantidadCreditosPagados: 0,
        promedioComision: 0,
        creditos: []
      };
    }
  }
};

export default creditsService;