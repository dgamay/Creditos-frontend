// ============================================
// COMPONENTE TARJETA DE CRÉDITO
// Adaptado al modelo del backend
// ============================================
// ============================================
// COMPONENTE TARJETA DE CRÉDITO
// Incluye botón para marcar como pagado y calcular comisión
// ============================================

import React, { useState } from 'react';
import './CreditCard.css';

/**
 * Tarjeta que muestra la información de un crédito
 * @param {Object} credit - Datos del crédito
 * @param {Function} onViewDetails - Función para ver detalles
 * @param {Function} onMarkAsPaid - Función para marcar como pagado (nueva)
 * @param {Array} collectors - Lista de cobradores para asignar comisión
 */
const CreditCard = ({ credit, onViewDetails, onMarkAsPaid, collectors = [] }) => {
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState(credit.cobrador_id || '');

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  // Calcular estado visual
  const getStatusInfo = () => {
    if (credit.estado === 'pagado') {
      return { class: 'pagado', label: 'Pagado', icon: '✅' };
    }
    
    const today = new Date();
    const paymentDate = new Date(credit.fecha_pago);
    
    if (paymentDate < today) {
      return { class: 'vencido', label: 'Vencido', icon: '⚠️' };
    }
    
    return { class: 'pendiente', label: 'Pendiente', icon: '⏳' };
  };

  const status = getStatusInfo();

  // Manejar clic en marcar como pagado
  const handleMarkAsPaid = () => {
    if (!selectedCollectorId) {
      alert('Debes seleccionar un cobrador para asignar la comisión');
      return;
    }
    onMarkAsPaid(credit._id, selectedCollectorId);
    setShowPaidModal(false);
  };

  // Calcular comisión (20%)
  const comision = credit.monto_prestado ? credit.monto_prestado * 0.2 : 0;

  return (
    <>
      <div className={`credit-card status-${status.class}`} onClick={() => onViewDetails(credit)}>
        <div className="credit-card-header">
          <div className="client-info">
            <h3>{credit.clienteNombre || 'Cliente'}</h3>
            <p className="client-doc">CC: {credit.clienteCedula || 'N/A'}</p>
          </div>
          <div className={`status-badge ${status.class}`}>
            {status.icon} {status.label}
          </div>
        </div>

        <div className="credit-card-body">
          <div className="amount-row">
            <span className="label">Monto prestado:</span>
            <span className="value">{formatCurrency(credit.monto_prestado)}</span>
          </div>
          
          <div className="amount-row">
            <span className="label">Total a pagar:</span>
            <span className="value total">{formatCurrency(credit.monto_por_pagar)}</span>
          </div>

          <div className="amount-row interest">
            <span className="label">Interés (30%):</span>
            <span className="value">{formatCurrency(credit.monto_por_pagar - credit.monto_prestado)}</span>
          </div>

          {/* Mostrar comisión si el crédito está pagado */}
          {credit.estado === 'pagado' && credit.comision_cobrador && (
            <div className="comision-row">
              <span className="label">Comisión cobrador (20%):</span>
              <span className="value comision">{formatCurrency(credit.comision_cobrador)}</span>
            </div>
          )}

          <div className="date-row">
            <span className="label">Fecha origen:</span>
            <span className="value">{formatDate(credit.fecha_origen)}</span>
          </div>

          <div className="date-row">
            <span className="label">Fecha pago:</span>
            <span className={`value ${status.class}`}>{formatDate(credit.fecha_pago)}</span>
          </div>

          {credit.cobrador && (
            <div className="collector-row">
              <span className="label">Cobrador:</span>
              <span className="value">{credit.cobrador}</span>
            </div>
          )}
        </div>

        <div className="credit-card-footer">
          <button 
            className="card-action view"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(credit);
            }}
          >
            👁️ Ver detalles
          </button>
          
          {/* Botón para marcar como pagado (solo si no está pagado) */}
          {credit.estado !== 'pagado' && (
            <button 
              className="card-action pay"
              onClick={(e) => {
                e.stopPropagation();
                setShowPaidModal(true);
              }}
            >
              💰 Marcar pagado
            </button>
          )}
        </div>
      </div>

      {/* Modal para marcar como pagado y asignar cobrador */}
      {showPaidModal && (
        <div className="modal-overlay" onClick={() => setShowPaidModal(false)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <h3>Marcar crédito como pagado</h3>
            
            <div className="modal-body">
              <p><strong>Cliente:</strong> {credit.clienteNombre}</p>
              <p><strong>Monto prestado:</strong> {formatCurrency(credit.monto_prestado)}</p>
              <p><strong>Comisión del cobrador (20%):</strong> <span className="comision">{formatCurrency(comision)}</span></p>
              
              <div className="form-group">
                <label htmlFor="collector">Selecciona el cobrador que recibirá la comisión:</label>
                <select
                  id="collector"
                  value={selectedCollectorId}
                  onChange={(e) => setSelectedCollectorId(e.target.value)}
                >
                  <option value="">-- Selecciona un cobrador --</option>
                  {collectors.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowPaidModal(false)}>
                  Cancelar
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleMarkAsPaid}
                  disabled={!selectedCollectorId}
                >
                  Confirmar pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditCard;