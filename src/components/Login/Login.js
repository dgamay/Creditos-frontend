/**
 * Componente Login - Inspirado en Nequi
 * Características:
 * - Diseño minimalista y moderno
 * - Validación en tiempo real
 * - Feedback visual inmediato
 * - Animaciones suaves
 */

import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: 'rtey@rhl.com',
    password: '123456'
  });

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Valida el email en tiempo real
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido
   */
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  /**
   * Valida la contraseña
   * @param {string} password - Contraseña a validar
   * @returns {boolean} - true si es válida
   */
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  /**
   * Maneja cambios en los inputs
   * @param {Event} e - Evento del input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Valida todo el formulario
   * @returns {boolean} - true si es válido
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simular llamada a API
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría la lógica real de autenticación
      onLoginSuccess({
        email: formData.email,
        name: 'Usuario Credirobo'
      });
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header con logo */}
        <div className="login-header">
          <div className="logo-container">
            <span className="logo-icon">💰</span>
            <h1 className="logo-text">Credirobo</h1>
          </div>
          <p className="welcome-text">¡Bienvenido de vuelta!</p>
          <p className="subtitle">Ingresa tus datos para continuar</p>
        </div>

        {/* Formulario de login */}
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            type="email"
            name="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<FiMail />}
            required
            autoComplete="email"
          />

          <div className="password-field">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Contraseña"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<FiLock />}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Opciones adicionales */}
          <div className="login-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-text">Recordarme</span>
            </label>
            
            <a href="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
          >
            Iniciar sesión
          </Button>
        </form>

        {/* Footer con opciones adicionales */}
        <div className="login-footer">
          <p className="register-text">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="register-link">
              Créala aquí
            </a>
          </p>
          
          <div className="security-badge">
            <span className="security-icon">🔒</span>
            <span className="security-text">Tus datos están seguros</span>
          </div>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="login-background">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
};

export default Login;