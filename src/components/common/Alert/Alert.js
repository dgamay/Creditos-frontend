/**
 * Componente Alert para notificaciones
 */

import React, { useEffect } from 'react';
import './Alert.css';

const Alert = ({ type = 'success', message, onClose, autoClose = 3000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icons[type]}</span>
      <span className="alert-message">{message}</span>
      <button className="alert-close" onClick={onClose}>✕</button>
    </div>
  );
};

export default Alert;