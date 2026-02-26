/**
 * Componente principal de la aplicación
 * Maneja el estado de autenticación y la vista actual
 */

import React, { useState } from 'react';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para el usuario actual
  const [user, setUser] = useState(null);

  /**
   * Maneja el login exitoso
   * @param {Object} userData - Datos del usuario autenticado
   */
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  /**
   * Maneja el logout
   */
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;