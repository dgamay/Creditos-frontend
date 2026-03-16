import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    empresa: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => password.length >= 6;

  // ✅ Validar empresa: solo letras, números y guiones (igual que el backend)
  const validateEmpresa = (empresa) => {
    const re = /^[a-zA-Z0-9\-]+$/;
    return re.test(empresa) && empresa.length >= 2;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.empresa) {
      newErrors.empresa = 'El nombre de la empresa es requerido';
    } else if (!validateEmpresa(formData.empresa)) {
      newErrors.empresa = 'Solo letras, números y guiones. Mínimo 2 caracteres';
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // ✅ Guardar tenant en localStorage para que http-client lo use
      const tenantId = formData.empresa.toLowerCase().trim();
      localStorage.setItem('tenantId', tenantId);

      onLoginSuccess({
        email: formData.email,
        name: 'Usuario Credirobo',
        empresa: tenantId
      });
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <span className="logo-icon">💰</span>
            <h1 className="logo-text">Credirobo</h1>
          </div>
          <p className="welcome-text">¡Bienvenido de vuelta!</p>
          <p className="subtitle">Ingresa tus datos para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          {/* ✅ Campo empresa nuevo */}
          <Input
            type="text"
            name="empresa"
            label="Nombre de empresa"
            value={formData.empresa}
            onChange={handleChange}
            error={errors.empresa}
            icon={<FiHome />}
            required
            autoComplete="organization"
            placeholder="ej: empresa1"
          />

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
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

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

          <Button type="submit" variant="primary" size="large" fullWidth loading={isLoading}>
            Iniciar sesión
          </Button>
        </form>

        <div className="login-footer">
          <p className="register-text">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="register-link">Créala aquí</a>
          </p>
          <div className="security-badge">
            <span className="security-icon">🔒</span>
            <span className="security-text">Tus datos están seguros</span>
          </div>
        </div>
      </div>

      <div className="login-background">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
};

export default Login;