// ============================================
// COMPONENTE LOGIN - FRONTEND
// src/components/Login/Login.js
// Login unificado para Administrador y Cobrador
// Administrador: empresa + email + contraseña
// Cobrador: empresa + cédula + contraseña
// ============================================

import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiUser } from 'react-icons/fi';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import authService from '../../services/auth/auth.service';
import './Login.css';

const Login = ({ onLoginSuccess }) => {

  // ============================================
  // ESTADOS
  // ============================================

  // Rol seleccionado: 'admin' o 'cobrador'
  const [rol, setRol] = useState('admin');

  // Datos del formulario
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    cedula: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ============================================
  // VALIDACIONES
  // ============================================
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validateEmpresa = (empresa) => /^[a-zA-Z0-9\-]+$/.test(empresa) && empresa.length >= 2;
  const validateCedula = (cedula) => cedula.trim().length >= 5;

  // ============================================
  // MANEJO DE CAMBIOS EN INPUTS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ============================================
  // CAMBIO DE ROL — limpia errores y campos
  // ============================================
  const handleRolChange = (nuevoRol) => {
    setRol(nuevoRol);
    setErrors({});
    setFormData({ empresa: formData.empresa, email: '', cedula: '', password: '' });
  };

  // ============================================
  // VALIDAR FORMULARIO SEGÚN ROL
  // ============================================
  const validateForm = () => {
    const newErrors = {};

    // Empresa siempre requerida
    if (!formData.empresa) {
      newErrors.empresa = 'El nombre de la empresa es requerido';
    } else if (!validateEmpresa(formData.empresa)) {
      newErrors.empresa = 'Solo letras, números y guiones. Mínimo 2 caracteres';
    }

    if (rol === 'admin') {
      // Validar email para admin
      if (!formData.email) {
        newErrors.email = 'El correo es requerido';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Ingresa un correo válido';
      }
    } else {
      // Validar cédula para cobrador
      if (!formData.cedula) {
        newErrors.cedula = 'La cédula es requerida';
      } else if (!validateCedula(formData.cedula)) {
        newErrors.cedula = 'Ingresa una cédula válida';
      }
    }

    // Contraseña siempre requerida
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // SUBMIT DEL FORMULARIO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Guardar el tenant en localStorage
      const tenantId = formData.empresa.toLowerCase().trim();
      localStorage.setItem('tenantId', tenantId);

      if (rol === 'admin') {
        // ── LOGIN ADMINISTRADOR ──
        // Por ahora es simulado (sin autenticación real)
        // En el futuro se conectará a un endpoint de auth admin

        setTimeout(() => {
          setIsLoading(false);
          localStorage.setItem('userRole', 'admin');
          onLoginSuccess({
            email: formData.email,
            name: 'Usuario CrediAgil',
            empresa: tenantId,
            rol: 'admin'
          });
        }, 1500);

      } else {
        // ── LOGIN COBRADOR ──
        // Llama al backend para verificar cédula + password
        const cobradorData = await authService.loginCobrador(
          formData.cedula,
          formData.password
        );

        setIsLoading(false);
        onLoginSuccess({
          name: cobradorData.nombre,
          empresa: tenantId,
          rol: 'cobrador',
          cobrador: cobradorData
        });
      }

    } catch (error) {
      setIsLoading(false);
      setErrors({ password: error.message });
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="login-container">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="logo-container">
            <span className="logo-icon">💰</span>
            <h1 className="logo-text">CrediAgil</h1>
          </div>
          <p className="welcome-text">¡Bienvenido de vuelta!</p>
          <p className="subtitle">Ingresa tus datos para continuar</p>
        </div>

        {/* ✅ Selector de rol */}
        <div className="rol-selector">
          <button
            type="button"
            className={`rol-btn ${rol === 'admin' ? 'active' : ''}`}
            onClick={() => handleRolChange('admin')}
          >
            <FiUser size={16} />
            <span>Administrador</span>
          </button>
          <button
            type="button"
            className={`rol-btn ${rol === 'cobrador' ? 'active' : ''}`}
            onClick={() => handleRolChange('cobrador')}
          >
            <FiUser size={16} />
            <span>Cobrador</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Campo empresa — siempre visible */}
          <Input
            type="text"
            name="empresa"
            label="  Nombre de empresa"
            value={formData.empresa}
            onChange={handleChange}
            error={errors.empresa}
            icon={<FiHome />}
            required
            autoComplete="organization"
            placeholder=""
          />

          {/* Campo email — solo admin */}
          {rol === 'admin' && (
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
          )}

          {/* Campo cédula — solo cobrador */}
          {rol === 'cobrador' && (
            <Input
              type="text"
              name="cedula"
              label="Número de cédula"
              value={formData.cedula}
              onChange={handleChange}
              error={errors.cedula}
              icon={<FiUser />}
              required
              autoComplete="off"
              placeholder=""
            />
          )}

          {/* Campo contraseña — siempre visible */}
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
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Recordarme */}
          <div className="login-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-text">Recordarme</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
          >
            {rol === 'admin' ? 'Iniciar sesión' : 'Entrar como cobrador'}
          </Button>
        </form>

        {/* Footer */}
        <div className="login-footer">
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