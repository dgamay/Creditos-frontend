// ============================================
// COMPONENTE TARJETA DE CRÉDITO
// Adaptado al modelo del backend
// ============================================

import React from 'react';
import './CreditCard.css';

const CreditCard = ({ credit, onViewDetails }) => {
  if (!credit) return null;

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Calcular días restantes para vencimiento
  const calculateDaysLeft = () => {
    if (!credit.fecha_pago) return null;
    const today = new Date();
    const paymentDate = new Date(credit.fecha_pago);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft();
  const isOverdue = daysLeft < 0 && credit.estado === 'pendiente';

  // Determinar estado visual
  const getStatusClass = () => {
    if (credit.estado === 'pagado') return 'pagado';
    if (isOverdue) return 'vencido';
    return 'pendiente';
  };

  const getStatusText = () => {
    if (credit.estado === 'pagado') return 'Pagado';
    if (isOverdue) return 'Vencido';
    return 'Pendiente';
  };

  return (
    <div className="credit-card" onClick={() => onViewDetails(credit)}>
      <div className="credit-card-header">
        <div className="client-info">
          <h3>{credit.clienteNombre || 'Cliente'}</h3>
          <span className="credit-id">Cédula: {credit.clienteCedula || 'N/A'}</span>
        </div>
        <span className={`credit-status status-${getStatusClass()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="credit-card-body">
        <div className="amounts-section">
          <div className="amount-row">
            <span className="label">💰 Monto prestado:</span>
            <span className="value">{formatCurrency(credit.monto_prestado)}</span>
          </div>
          <div className="amount-row total">
            <span className="label">💵 Total a pagar:</span>
            <span className="value">{formatCurrency(credit.monto_por_pagar)}</span>
          </div>
        </div>

        <div className="dates-section">
          <div className="date-row">
            <span className="label">📅 Fecha origen:</span>
            <span className="value">{formatDate(credit.fecha_origen)}</span>
          </div>
          <div className="date-row">
            <span className="label">⏰ Fecha pago:</span>
            <span className="value">{formatDate(credit.fecha_pago)}</span>
          </div>
          {credit.estado === 'pendiente' && daysLeft !== null && (
            <div className={`date-row days-left ${isOverdue ? 'expired' : daysLeft <= 3 ? 'warning' : ''}`}>
              <span className="label">⏳ Días restantes:</span>
              <span className="value">
                {isOverdue ? `${Math.abs(daysLeft)} días vencido` : `${daysLeft} días`}
              </span>
            </div>
          )}
        </div>

        {credit.cobrador && (
          <div className="collector-info">
            <span className="label">👤 Cobrador:</span>
            <span className="value">{credit.cobrador}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCard;