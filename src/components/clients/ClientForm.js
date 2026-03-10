/**
 * Componente ClientForm - Formulario para crear/editar clientes
 * VERSIÓN SIMPLIFICADA - Solo campos que existen en el modelo
 */

import React, { useState, useEffect } from 'react';
import './ClientForm.css';

const ClientForm = ({ client, onSave, onCancel }) => {
  // Estado del formulario - SOLO los campos que existen en el modelo
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    direccion: '',
    celular: ''
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
        celular: client.celular || ''
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
    } else if (!/^\d{7,15}$/.test(formData.celular.replace(/\D/g, ''))) {
      newErrors.celular = 'Celular inválido (mínimo 7 dígitos)';
    }

    // dirección es opcional, no se valida

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
      console.log('📤 Enviando cliente a API:', formData);
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

export default ClientForm;