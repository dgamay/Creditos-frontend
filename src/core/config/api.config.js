export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const API_ENDPOINTS = {
  CLIENTES: {
    BASE: '/clientes',
    GET_BY_ID: (id) => `/clientes/${id}`,
    UPDATE: (id) => `/clientes/${id}`,
    DELETE: (id) => `/clientes/${id}`,
  },
  COBRADORES: {
    BASE: '/cobradores',
  },
  CREDITOS: {
    BASE: '/creditos',
    GET_BY_ID: (id) => `/creditos/${id}`,
    CREATE: '/creditos',
    UPDATE: (id) => `/creditos/${id}`,
    DELETE: (id) => `/creditos/${id}`,
    GET_BY_CLIENTE: (clienteId) => `/creditos/cliente?cliente_id=${clienteId}`,
    GET_BY_COBRADOR: (cobradorId) => `/creditos/cobrador?cobrador_id=${cobradorId}`,  
  }
};