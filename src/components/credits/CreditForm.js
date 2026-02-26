// ============================================
// COMPONENTE FORMULARIO DE CRÉDITO
// Con validación de créditos pendientes por cliente
// ============================================

import React, { useState, useEffect } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import creditsService from '../../services/credits/creditos.service';
import './CreditForm.css';

const CreditForm = ({ credit, clients = [], collectors = [], onSave, onCancel }) => {
  // Estado para créditos pendientes del cliente seleccionado
  const [pendingCredits, setPendingCredits] = useState([]);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const [hasPendingCredits, setHasPendingCredits] = useState(false);

  // Calcular fecha de pago (15 días después)
  const calculatePaymentDate = (origenDate) => {
    const date = new Date(origenDate);
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    cliente_id: '',
    cobrador_id: '',
    monto_prestado: '',
    fecha_origen: new Date().toISOString().split('T')[0],
    fecha_pago: '',
    estado: 'pendiente'
  });

  const [errors, setErrors] = useState({});

  // Calcular monto a pagar (30% de interés)
  const calculateTotalToPay = (amount) => {
    return amount ? amount * 1.3 : 0;
  };

  // Actualizar fecha de pago cuando cambia la fecha de origen
  useEffect(() => {
    if (formData.fecha_origen) {
      setFormData(prev => ({
        ...prev,
        fecha_pago: calculatePaymentDate(prev.fecha_origen)
      }));
    }
  }, [formData.fecha_origen]);

  // Verificar créditos pendientes cuando cambia el cliente
  useEffect(() => {
    const checkPendingCredits = async () => {
      if (!formData.cliente_id) {
        setPendingCredits([]);
        setHasPendingCredits(false);
        return;
      }

      setCheckingCredits(true);
      try {
        // Obtener créditos del cliente seleccionado
        const creditos = await creditsService.getByCliente(formData.cliente_id);
        
        // Filtrar solo los pendientes
        const pendientes = creditos.filter(c => c.estado === 'pendiente');
        setPendingCredits(pendientes);
        setHasPendingCredits(pendientes.length > 0);
      } catch (error) {
        console.error('Error al verificar créditos pendientes:', error);
        setPendingCredits([]);
        setHasPendingCredits(false);
      } finally {
        setCheckingCredits(false);
      }
    };

    checkPendingCredits();
  }, [formData.cliente_id]);

  // Cargar datos si es edición
  useEffect(() => {
    if (credit) {
      setFormData({
        cliente_id: credit.cliente_id || '',
        cobrador_id: credit.cobrador_id || '',
        monto_prestado: credit.monto_prestado || '',
        fecha_origen: credit.fecha_origen?.split('T')[0] || new Date().toISOString().split('T')[0],
        fecha_pago: credit.fecha_pago?.split('T')[0] || '',
        estado: credit.estado || 'pendiente'
      });
    }
  }, [credit]);

  // Manejar cambio en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Debes seleccionar un cliente';
    }

    // VALIDACIÓN CRÍTICA: No permitir crédito si hay pendientes
    if (hasPendingCredits) {
      newErrors.cliente_id = 'Este cliente tiene créditos pendientes. No puede solicitar uno nuevo.';
    }

    if (!formData.cobrador_id) {
      newErrors.cobrador_id = 'Debes seleccionar un cobrador';
    }

    if (!formData.monto_prestado) {
      newErrors.monto_prestado = 'El monto es requerido';
    } else if (formData.monto_prestado < 10000) {
      newErrors.monto_prestado = 'El monto mínimo es $10,000';
    }

    if (!formData.fecha_origen) {
      newErrors.fecha_origen = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend = {
        ...formData,
        monto_por_pagar: calculateTotalToPay(formData.monto_prestado)
      };
      onSave(dataToSend);
    }
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <form onSubmit={handleSubmit} className="credit-form">
      <div className="form-section">
        <h3>Información del Crédito</h3>

        <div className="form-group">
          <label htmlFor="cliente_id">Cliente *</label>
          <select
            id="cliente_id"
            name="cliente_id"
            value={formData.cliente_id}
            onChange={handleChange}
            className={`${errors.cliente_id ? 'error' : ''} ${hasPendingCredits ? 'warning' : ''}`}
            disabled={checkingCredits}
          >
            <option value="">Selecciona un cliente</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.nombre} - {client.cedula}
              </option>
            ))}
          </select>
          
          {/* Indicador de carga mientras verifica créditos */}
          {checkingCredits && (
            <div className="checking-indicator">
              <span className="spinner-small"></span>
              Verificando créditos pendientes...
            </div>
          )}

          {/* ALERTA: Cliente con créditos pendientes */}
          {hasPendingCredits && !checkingCredits && (
            <div className="pending-credits-alert">
              <FiAlertCircle className="alert-icon" />
              <div className="alert-content">
                <strong>⚠️ Cliente con créditos pendientes</strong>
                <p>Este cliente tiene {pendingCredits.length} crédito(s) sin pagar:</p>
                <ul className="pending-list">
                  {pendingCredits.map((credito, index) => (
                    <li key={credito._id || index}>
                      • {formatCurrency(credito.monto_prestado)} - Vence: {formatDate(credito.fecha_pago)}
                    </li>
                  ))}
                </ul>
                <p className="alert-action">No se puede crear un nuevo crédito hasta que pague los pendientes.</p>
              </div>
            </div>
          )}

          {errors.cliente_id && (
            <span className="error-message">{errors.cliente_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cobrador_id">Cobrador *</label>
          <select
            id="cobrador_id"
            name="cobrador_id"
            value={formData.cobrador_id}
            onChange={handleChange}
            className={errors.cobrador_id ? 'error' : ''}
          >
            <option value="">Selecciona un cobrador</option>
            {collectors.map(collector => (
              <option key={collector._id} value={collector._id}>
                {collector.nombre}
              </option>
            ))}
          </select>
          {errors.cobrador_id && <span className="error-message">{errors.cobrador_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="monto_prestado">Monto del préstamo *</label>
          <input
            type="number"
            id="monto_prestado"
            name="monto_prestado"
            value={formData.monto_prestado}
            onChange={handleChange}
            className={errors.monto_prestado ? 'error' : ''}
            placeholder="Ej: 500000"
            min="10000"
            step="10000"
            disabled={hasPendingCredits} // Deshabilitar si hay pendientes
          />
          {errors.monto_prestado && <span className="error-message">{errors.monto_prestado}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_origen">Fecha de origen *</label>
            <input
              type="date"
              id="fecha_origen"
              name="fecha_origen"
              value={formData.fecha_origen}
              onChange={handleChange}
              className={errors.fecha_origen ? 'error' : ''}
              max={new Date().toISOString().split('T')[0]}
              disabled={hasPendingCredits} // Deshabilitar si hay pendientes
            />
            {errors.fecha_origen && <span className="error-message">{errors.fecha_origen}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fecha_pago">Fecha de pago (15 días)</label>
            <input
              type="date"
              id="fecha_pago"
              value={formData.fecha_pago}
              className="calculated-field"
              disabled
              readOnly
            />
            <small className="field-note">Se calcula automáticamente</small>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Resumen</h3>
        
        <div className="summary-calculator">
          <div className="summary-row">
            <span>Monto prestado:</span>
            <span>{formatCurrency(formData.monto_prestado)}</span>
          </div>
          <div className="summary-row interest">
            <span>Interés (30%):</span>
            <span>{formatCurrency(formData.monto_prestado * 0.3)}</span>
          </div>
          <div className="summary-row total">
            <span>Total a pagar:</span>
            <span>{formatCurrency(calculateTotalToPay(formData.monto_prestado))}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button 
          type="submit" 
          className={`btn-save ${hasPendingCredits ? 'disabled' : ''}`}
          disabled={hasPendingCredits}
        >
          {hasPendingCredits ? 'Cliente con créditos pendientes' : 'Crear Crédito'}
        </button>
      </div>
    </form>
  );
};

export default CreditForm;