// ============================================
// COMPONENTE COLLECTOR CARD
// Muestra estadísticas financieras del cobrador
// ============================================

import React from 'react';
import { MdHandshake } from 'react-icons/md';
import { FiUsers, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import './CollectorCard.css';

const CollectorCard = ({ collector, onEdit, onDelete, onViewDetails }) => {
  if (!collector) return null;

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Obtener iniciales para el avatar
  const getInitials = (nombre) => {
    if (!nombre) return '?';
    return nombre.split(' ')
      .map(p => p.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Calcular color de progreso
  const getProgressColor = () => {
    const porcentaje = collector.porcentajeCobrado || 0;
    if (porcentaje >= 75) return '#34C759';
    if (porcentaje >= 50) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <div className="collector-card" onClick={() => onViewDetails(collector)}>
      <div className="collector-card-header">
        <div className="collector-avatar">
          {getInitials(collector.nombre)}
        </div>
        <div className="collector-info">
          <h3>{collector.nombre}</h3>
          <span className="collector-id">ID: {collector._id?.slice(-6) || 'N/A'}</span>
        </div>
        <MdHandshake className="header-icon" />
      </div>

      <div className="collector-card-body">
        {/* Estadísticas principales */}
        <div className="stats-grid">
          <div className="stat-item">
            <FiUsers className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Clientes</span>
              <span className="stat-value">{collector.totalClientes || 0}</span>
            </div>
          </div>

          <div className="stat-item">
            <FiCreditCard className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Créditos</span>
              <span className="stat-value">{collector.totalCreditos || 0}</span>
            </div>
          </div>

          <div className="stat-item">
            <FiDollarSign className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Prestado</span>
              <span className="stat-value">{formatCurrency(collector.totalPrestado)}</span>
            </div>
          </div>

          <div className="stat-item">
            <FiDollarSign className="stat-icon" style={{ color: '#34C759' }} />
            <div className="stat-content">
              <span className="stat-label">Cobrado</span>
              <span className="stat-value">{formatCurrency(collector.totalPagado)}</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso de cobros */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Efectividad de cobro</span>
            <span className="progress-value">{Math.round(collector.porcentajeCobrado || 0)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${collector.porcentajeCobrado || 0}%`,
                backgroundColor: getProgressColor()
              }}
            ></div>
          </div>
        </div>

        {/* Detalles de créditos */}
        <div className="creditos-details">
          <div className="detail-chip">
            <span className="chip-label">Activos</span>
            <span className="chip-value active">{collector.creditosActivos || 0}</span>
          </div>
          <div className="detail-chip">
            <span className="chip-label">Pagados</span>
            <span className="chip-value pagado">{collector.creditosPagados || 0}</span>
          </div>
          <div className="detail-chip">
            <span className="chip-label">Vencidos</span>
            <span className="chip-value vencido">{collector.creditosVencidos || 0}</span>
          </div>
        </div>

        {/* Lista de clientes (primeros 3) */}
        {collector.clientes && collector.clientes.length > 0 && (
          <div className="clientes-lista">
            <span className="lista-label">Clientes asignados:</span>
            <div className="clientes-mini">
              {collector.clientes.slice(0, 3).map(cliente => (
                <span key={cliente._id} className="cliente-tag" title={cliente.nombre}>
                  {cliente.nombre.split(' ')[0]}
                </span>
              ))}
              {collector.clientes.length > 3 && (
                <span className="cliente-tag more">+{collector.clientes.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="collector-card-footer">
        <button 
          className="card-action edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(collector);
          }}
        >
          ✏️ Editar
        </button>
        <button 
          className="card-action delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(collector);
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default CollectorCard;