/**
 * Componente Button reutilizable
 * Estilo inspirado en Nequi - botones redondeados y con efectos
 */

import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <span className="spinner-circle"></span>
        </span>
      )}
      
      {icon && !loading && (
        <span className="btn-icon">{icon}</span>
      )}
      
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;