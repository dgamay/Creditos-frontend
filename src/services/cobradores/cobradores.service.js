// ============================================
// SERVICIO DE COBRADORES
// Con métodos para obtener estadísticas financieras
// ============================================

import httpClient from '../api/http-client';
import { API_ENDPOINTS } from '../../core/config/api.config';
import creditsService from '../credits/creditos.service';

const cobradoresService = {
  // Obtener todos los cobradores
  getAll: async () => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.COBRADORES.BASE);
      return response;
    } catch (error) {
      console.error('Error al obtener cobradores:', error);
      throw error;
    }
  },

  // Obtener cobrador por ID
  getById: async (id) => {
    try {
      const response = await httpClient.get(`${API_ENDPOINTS.COBRADORES.BASE}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener cobrador ${id}:`, error);
      throw error;
    }
  },

  // Crear nuevo cobrador
  create: async (cobradorData) => {
    try {
      const response = await httpClient.post(API_ENDPOINTS.COBRADORES.BASE, cobradorData);
      return response;
    } catch (error) {
      console.error('Error al crear cobrador:', error);
      throw error;
    }
  },

  // Actualizar cobrador
  update: async (id, cobradorData) => {
    try {
      const response = await httpClient.put(`${API_ENDPOINTS.COBRADORES.BASE}/${id}`, cobradorData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar cobrador ${id}:`, error);
      throw error;
    }
  },

  // Eliminar cobrador
  delete: async (id) => {
    try {
      await httpClient.delete(`${API_ENDPOINTS.COBRADORES.BASE}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar cobrador ${id}:`, error);
      throw error;
    }
  },

  // Obtener estadísticas completas de un cobrador
  getEstadisticasCompletas: async (cobradorId, clientes = [], creditos = []) => {
    try {
      // Si no se pasan clientes y créditos, intentar obtenerlos
      if (clientes.length === 0 || creditos.length === 0) {
        const clientesService = require('../clientes/clientes.service').default;
        const [clientesData, creditosData] = await Promise.all([
          clientesService.getAll(),
          creditsService.getAllFromClientes([]) // Necesitarías implementar este método
        ]);
        clientes = clientesData;
        creditos = creditosData;
      }

      // Clientes asignados a este cobrador
      const clientesAsignados = clientes.filter(c => c.cobrador_id === cobradorId);
      
      // IDs de los clientes asignados
      const clientesIds = clientesAsignados.map(c => c._id);

      // Créditos de estos clientes
      const creditosCobrador = creditos.filter(c => clientesIds.includes(c.cliente_id));

      // Estadísticas financieras
      const totalPrestado = creditosCobrador.reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
      const totalPagado = creditosCobrador
        .filter(c => c.estado === 'pagado')
        .reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
      const totalPendiente = creditosCobrador
        .filter(c => c.estado === 'pendiente')
        .reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
      
      const creditosActivos = creditosCobrador.filter(c => c.estado === 'pendiente').length;
      const creditosPagados = creditosCobrador.filter(c => c.estado === 'pagado').length;

      // Calcular vencidos (pendientes con fecha pasada)
      const today = new Date();
      const creditosVencidos = creditosCobrador.filter(c => {
        if (c.estado !== 'pendiente') return false;
        const paymentDate = new Date(c.fecha_pago);
        return paymentDate < today;
      }).length;

      return {
        cobradorId,
        totalClientes: clientesAsignados.length,
        clientes: clientesAsignados,
        totalCreditos: creditosCobrador.length,
        creditosActivos,
        creditosPagados,
        creditosVencidos,
        totalPrestado,
        totalPagado,
        totalPendiente,
        porcentajeCobrado: totalPrestado > 0 ? (totalPagado / totalPrestado) * 100 : 0,
        montoIntereses: creditosCobrador.reduce((sum, c) => sum + ((c.monto_por_pagar || 0) - (c.monto_prestado || 0)), 0)
      };
    } catch (error) {
      console.error(`Error al obtener estadísticas del cobrador ${cobradorId}:`, error);
      return null;
    }
  },

  // Obtener estadísticas de todos los cobradores
  getEstadisticasTodos: async (clientes = [], creditos = []) => {
    try {
      const cobradores = await cobradoresService.getAll();
      
      const estadisticasPromises = cobradores.map(async cobrador => {
        const stats = await cobradoresService.getEstadisticasCompletas(cobrador._id, clientes, creditos);
        return {
          ...cobrador,
          ...stats
        };
      });

      return await Promise.all(estadisticasPromises);
    } catch (error) {
      console.error('Error al obtener estadísticas de todos los cobradores:', error);
      return [];
    }
  }
};

export default cobradoresService;