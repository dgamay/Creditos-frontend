// ============================================
// COMPONENTE ADMIN LOGIN - FRONTEND
// Pantalla de acceso exclusiva para superadmin
// Ruta: http://localhost:3001/admin
// ============================================

import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import adminService from '../../services/admin/admin.service';
import './Admin.css';

const AdminLogin = ({ onLoginSuccess }) => {

  // Estados del formulario
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // VALIDACIÓN DEL SECRET
  // ============================================
  const validateSecret = (value) => {
    if (!value) return 'La clave de administrador es requerida';
    if (value.length < 6) return 'La clave debe tener al menos 6 caracteres';
    return '';
  };

  // ============================================
  // MANEJO DEL SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateSecret(secret);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Verificar secret contra el backend
      await adminService.login(secret);
      onLoginSuccess();
    } catch (err) {
      setError('Clave incorrecta. Acceso denegado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">

        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-shield-icon">
            <FiShield size={40} />
          </div>
          <h1 className="admin-login-title">Panel de Administración</h1>
          <p className="admin-login-subtitle">Acceso restringido — Solo superadmin</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <label className="admin-input-label">
              <FiLock size={14} />
              <span>Clave de administrador</span>
            </label>
            <div className="admin-input-wrapper">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => {
                  setSecret(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ingresa la clave de acceso"
                className={`admin-input ${error ? 'admin-input-error' : ''}`}
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                className="admin-toggle-secret"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="admin-error-message">🚫 {error}</p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            className={`admin-submit-btn ${isLoading ? 'admin-submit-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="admin-spinner"></span>
            ) : (
              <>
                <FiShield size={16} />
                <span>Acceder al panel</span>
              </>
            )}
          </button>
        </form>

        {/* Volver */}
        <div className="admin-login-footer">
          <a href="/" className="admin-back-link">
            ← Volver al login de empresa
          </a>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;