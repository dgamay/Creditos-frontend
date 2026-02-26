/**
 * Componente ClientForm - Formulario para crear/editar clientes
 * AHORA CONECTADO A LA API REAL y con selector de cobradores
 */

import React, { useState, useEffect } from 'react';
import './ClientForm.css';

const ClientForm = ({ client, onSave, onCancel, cobradores = [] }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    direccion: '',
    celular: '',
    cobrador_id: ''
  });

  // Estado de errores
  const [errors, setErrors] = useState({});

  // Cargar datos del cliente si estamos en modo edición
  useEffect(() => {
    if (client) {
      setFormData({
        nombre: client.nombre || '',
        cedula: client.cedula || '',
        direccion: client.direccion || '',
        celular: client.celular || '',
        cobrador_id: client.cobrador_id || ''
      });
    }
  }, [client]);

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es requerido';
    } else if (!/^\d{10,}$/.test(formData.celular.replace(/\D/g, ''))) {
      newErrors.celular = 'Celular inválido (mínimo 10 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      {/* Nombre */}
      <div className="form-group">
        <label htmlFor="nombre">
          Nombre completo <span className="required">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={errors.nombre ? 'error' : ''}
          placeholder="Ej: María González"
        />
        {errors.nombre && <span className="error-message">{errors.nombre}</span>}
      </div>

      {/* Cédula */}
      <div className="form-group">
        <label htmlFor="cedula">
          Cédula <span className="required">*</span>
        </label>
        <input
          type="text"
          id="cedula"
          name="cedula"
          value={formData.cedula}
          onChange={handleChange}
          className={errors.cedula ? 'error' : ''}
          placeholder="Ej: 123456789"
        />
        {errors.cedula && <span className="error-message">{errors.cedula}</span>}
      </div>

      {/* Celular */}
      <div className="form-group">
        <label htmlFor="celular">
          Celular <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="celular"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          className={errors.celular ? 'error' : ''}
          placeholder="Ej: 3001234567"
        />
        {errors.celular && <span className="error-message">{errors.celular}</span>}
      </div>

      {/* Dirección */}
      <div className="form-group">
        <label htmlFor="direccion">Dirección</label>
        <input
          type="text"
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Ej: Cali, Valle del Cauca"
        />
      </div>

      {/* NUEVO: Selección de Cobrador */}
      <div className="form-group">
        <label htmlFor="cobrador_id">Cobrador asignado</label>
        <select
          id="cobrador_id"
          name="cobrador_id"
          value={formData.cobrador_id}
          onChange={handleChange}
          className={errors.cobrador_id ? 'error' : ''}
        >
          <option value="">Selecciona un cobrador</option>
          {cobradores.map(cobrador => (
            <option key={cobrador._id} value={cobrador._id}>
              {cobrador.nombre} - {cobrador.celular}
            </option>
          ))}
        </select>
        {errors.cobrador_id && <span className="error-message">{errors.cobrador_id}</span>}
      </div>

      {/* Botones de acción */}
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-save">
          {client ? 'Actualizar Cliente' : 'Crear Cliente'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm; // <-- ¡IMPORTANTE! Esta línea es la que faltaba