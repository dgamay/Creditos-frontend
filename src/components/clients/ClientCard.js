// ============================================
// COMPONENTE CLIENT CARD
// Versión mejorada que muestra estado de deuda
// ============================================

import React from 'react';
import './ClientCard.css';

/**
 * Componente que muestra la tarjeta de un cliente
 * @param {Object} client - Datos del cliente
 * @param {Function} onEdit - Función para editar
 * @param {Function} onDelete - Función para eliminar
 * @param {Array} creditos - Lista de créditos del cliente (opcional)
 */
const ClientCard = ({ client, onEdit, onDelete, creditos = [] }) => {
  
  // ============================================
  // CALCULAR ESTADO DE DEUDA DEL CLIENTE
  // ============================================
  const calcularEstadoDeuda = () => {
    // Si no hay créditos, el cliente no tiene deuda
    if (!creditos || creditos.length === 0) {
      return {
        tieneDeuda: false,
        estado: 'sin_deuda',
        label: 'Sin deuda',
        montoTotal: 0,
        creditosActivos: 0
      };
    }

    // Filtrar créditos activos (no pagados)
    const creditosActivos = creditos.filter(c => 
      c.estado !== 'pagado' && c.estado !== 'cancelado'
    );

    // Calcular monto total pendiente
    const montoTotalPendiente = creditosActivos.reduce((sum, c) => {
      return sum + (c.monto_por_pagar || 0);
    }, 0);

    // Determinar estado
    let estado = 'sin_deuda';
    let label = 'Sin deuda';
    
    if (creditosActivos.length > 0) {
      // Verificar si hay créditos vencidos
      const hoy = new Date();
      const tieneVencidos = creditosActivos.some(c => {
        const fechaPago = new Date(c.fecha_pago);
        return fechaPago < hoy;
      });

      if (tieneVencidos) {
        estado = 'vencido';
        label = 'Deuda vencida';
      } else {
        estado = 'activo';
        label = 'Deuda activa';
      }
    }

    return {
      tieneDeuda: creditosActivos.length > 0,
      estado,
      label,
      montoTotal: montoTotalPendiente,
      creditosActivos: creditosActivos.length
    };
  };

  const estadoDeuda = calcularEstadoDeuda();

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!client.nombre) return '?';
    return client.nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="client-card">
      {/* Header con avatar y nombre */}
      <div className="client-card-header">
        <div className="client-avatar">
          {getInitials()}
        </div>
        <div className="client-info">
          <h3>{client.nombre || 'Sin nombre'}</h3>
          <p className="client-id">ID: {client._id?.slice(-6) || 'N/A'}</p>
        </div>
        
        {/* Badge de estado de deuda - SOLO aparece si hay deuda */}
        {estadoDeuda.tieneDeuda && (
          <div className={`deuda-badge ${estadoDeuda.estado}`}>
            {estadoDeuda.label}
          </div>
        )}
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="client-card-body">
        <div className="client-detail">
          <span className="detail-label">📄 Cédula</span>
          <span className="detail-value">{client.cedula || 'N/A'}</span>
        </div>
        <div className="client-detail">
          <span className="detail-label">📞 Celular</span>
          <span className="detail-value">{client.celular || 'N/A'}</span>
        </div>
        <div className="client-detail">
          <span className="detail-label">📍 Dirección</span>
          <span className="detail-value">{client.direccion || 'N/A'}</span>
        </div>

        {/* Sección de deuda - SOLO se muestra si hay deuda */}
        {estadoDeuda.tieneDeuda && (
          <div className="deuda-section">
            <div className="deuda-row">
              <span className="deuda-label">💰 Monto pendiente</span>
              <span className="deuda-monto">{formatCurrency(estadoDeuda.montoTotal)}</span>
            </div>
            <div className="deuda-row">
              <span className="deuda-label">📊 Créditos activos</span>
              <span className="deuda-count">{estadoDeuda.creditosActivos}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="client-card-footer">
        <button 
          className="card-action edit"
          onClick={() => onEdit(client)}
          title="Editar cliente"
        >
          ✏️ Editar
        </button>
        <button 
          className="card-action delete"
          onClick={() => onDelete(client)}
          title="Eliminar cliente"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default ClientCard;