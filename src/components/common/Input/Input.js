/**
 * Componente Input reutilizable con animación flotante
 * Estilo inspirado en Nequi - minimalista y moderno
 */

import React, { useState, useEffect } from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  label,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(value && value.length > 0);
  }, [value]);

  /**
   * Maneja el foco del input
   */
  const handleFocus = () => {
    setIsFocused(true);
  };

  /**
   * Maneja la pérdida de foco
   */
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value && e.target.value.length > 0);
  };

  /**
   * Determina si la etiqueta debe estar flotante
   */
  const shouldFloat = isFocused || hasValue;

  return (
    <div className={`input-container ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}>
      {icon && <span className="input-icon">{icon}</span>}
      
      <div className="input-wrapper">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`input-field ${shouldFloat ? 'has-value' : ''}`}
          {...props}
        />
        
        <label className={`input-label ${shouldFloat ? 'float' : ''}`}>
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      </div>
      
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;