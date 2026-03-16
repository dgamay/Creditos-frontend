// ============================================
// APP.JS - COMPONENTE RAÍZ CON ROUTING
// Maneja dos flujos independientes:
// 1. /admin  → Panel de superadmin
// 2. /       → Login de empresa + Dashboard
// ============================================

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import adminService from './services/admin/admin.service';
import './App.css';

function App() {

  // ============================================
  // ESTADO - SESIÓN DE EMPRESA NORMAL
  // ============================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ============================================
  // ESTADO - SESIÓN DE SUPERADMIN
  // Se inicializa verificando sessionStorage por si
  // el usuario recargó la página
  // ============================================
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    adminService.isAuthenticated()
  );

  // ============================================
  // HANDLERS - EMPRESA NORMAL
  // ============================================
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    console.log('🏢 Empresa activa:', userData.empresa);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tenantId');
    console.log('👋 Sesión cerrada, tenant limpiado');
  };

  // ============================================
  // HANDLERS - SUPERADMIN
  // ============================================
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    console.log('🔐 Superadmin autenticado');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    adminService.logout();
    console.log('👋 Sesión admin cerrada');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>

          {/* ---- Ruta principal — Login de empresa ---- */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <Dashboard user={user} onLogout={handleLogout} />
              )
            }
          />

          {/* ---- Ruta admin — Login de superadmin ---- */}
          <Route
            path="/admin"
            element={
              !isAdminAuthenticated ? (
                <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
              ) : (
                <AdminDashboard onLogout={handleAdminLogout} />
              )
            }
          />

          {/* ---- Cualquier ruta desconocida → redirige a / ---- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;