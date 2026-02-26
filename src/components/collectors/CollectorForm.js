import React, { useState, useEffect } from 'react';
import './CollectorForm.css';

const CollectorForm = ({ collector, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    direccion: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (collector) {
      setFormData({
        nombre: collector.nombre || '',
        cedula: collector.cedula || '',
        celular: collector.celular || '',
        direccion: collector.direccion || ''
      });
    }
  }, [collector]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="collector-form">
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
          placeholder="Ej: David España"
        />
        {errors.nombre && <span className="error-message">{errors.nombre}</span>}
      </div>

      <div className="form-row">
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
            placeholder="Ej: 3110000023"
          />
          {errors.celular && <span className="error-message">{errors.celular}</span>}
        </div>
      </div>

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

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-save">
          {collector ? 'Actualizar Cobrador' : 'Crear Cobrador'}
        </button>
      </div>
    </form>
  );
};

export default CollectorForm;