// ============================================
// DASHBOARD PRINCIPAL CON CRUD COMPLETO
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiHome, 
  FiDollarSign, 
  FiUsers, 
  FiCreditCard,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';
import { MdHandshake } from 'react-icons/md';

// Importar servicios
import clientesService from '../../services/clientes/clientes.service';
import cobradoresService from '../../services/cobradores/cobradores.service';
import creditsService from '../../services/credits/creditos.service';

// Importar componentes CRUD
import ClientsList from '../clients/ClientsList';
import CobradoresList from '../collectors/CollectorsList';
import CreditsList from '../credits/CreditsList';

import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Estados para datos reales
  const [clientes, setClientes] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalCobradores: 0,
    totalCreditos: 0,
    creditosActivos: 0,
    creditosPagados: 0,
    creditosVencidos: 0,
    montoTotalPrestado: 0,
    montoTotalAPagar: 0,
    interesesGenerados: 0
  });

  // Detectar cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // FUNCIÓN PARA CALCULAR ESTADÍSTICAS
  // ============================================
  const calcularEstadisticas = useCallback((clientesData, cobradoresData, creditosData) => {
    const today = new Date();
    
    // Clasificar créditos
    const creditosActivos = creditosData.filter(c => c.estado === 'activo' || c.estado === 'pendiente').length;
    const creditosPagados = creditosData.filter(c => c.estado === 'pagado').length;
    const creditosVencidos = creditosData.filter(c => {
      if (c.estado !== 'pendiente' && c.estado !== 'activo') return false;
      const paymentDate = new Date(c.fecha_pago);
      return paymentDate < today;
    }).length;

    // Calcular montos
    const montoTotalPrestado = creditosData.reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
    const montoTotalAPagar = creditosData.reduce((sum, c) => sum + (c.monto_por_pagar || 0), 0);

    setStats({
      totalClientes: clientesData.length,
      totalCobradores: cobradoresData.length,
      totalCreditos: creditosData.length,
      creditosActivos,
      creditosPagados,
      creditosVencidos,
      montoTotalPrestado,
      montoTotalAPagar,
      interesesGenerados: montoTotalAPagar - montoTotalPrestado
    });
  }, []);

  // ============================================
  // FUNCIÓN PARA CARGAR DATOS (puede ser llamada externamente)
  // ============================================
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar clientes y cobradores en paralelo
      const [clientesData, cobradoresData] = await Promise.all([
        clientesService.getAll(),
        cobradoresService.getAll()
      ]);

      setClientes(clientesData);
      setCobradores(cobradoresData);

      // Cargar créditos de todos los clientes
      const creditosData = await creditsService.getAllFromClientes(clientesData);
      setCreditos(creditosData);

      // Calcular estadísticas
      calcularEstadisticas(clientesData, cobradoresData, creditosData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      usarDatosEjemplo();
    } finally {
      setLoading(false);
    }
  }, [calcularEstadisticas]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Datos de ejemplo por si la API falla
  const usarDatosEjemplo = () => {
    const clientesEjemplo = [
      { _id: '1', nombre: 'María González', cedula: '123456789', celular: '3001234567', direccion: 'Calle 123' },
      { _id: '2', nombre: 'Carlos Rodríguez', cedula: '987654321', celular: '3017654321', direccion: 'Carrera 45' }
    ];
    
    const cobradoresEjemplo = [
      { _id: '1', nombre: 'David España', celular: '3110000023', direccion: 'Cali', cedula: '2232' },
      { _id: '2', nombre: 'Paolo Pantoja', celular: '3110000021', direccion: 'El Prado', cedula: '2226' }
    ];

    const creditosEjemplo = [];

    setClientes(clientesEjemplo);
    setCobradores(cobradoresEjemplo);
    setCreditos(creditosEjemplo);
    calcularEstadisticas(clientesEjemplo, cobradoresEjemplo, creditosEjemplo);
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const menuItems = [
    { 
      id: 'inicio', 
      label: 'Inicio', 
      icon: <FiHome />,
      description: 'Panel principal'
    },
    { 
      id: 'clientes', 
      label: 'Clientes', 
      icon: <FiDollarSign />,
      description: `${stats.totalClientes} clientes`
    },
    { 
      id: 'cobradores', 
      label: 'Cobradores', 
      icon: <MdHandshake />,
      description: `${stats.totalCobradores} cobradores`
    },
    { 
      id: 'creditos', 
      label: 'Créditos', 
      icon: <FiCreditCard />,
      description: `${stats.totalCreditos} créditos`
    },
    { 
      id: 'reportes', 
      label: 'Reportes', 
      icon: <FiBarChart2 />,
      description: 'Estadísticas'
    }
  ];

  const handleMenuClick = (viewId) => {
    setCurrentView(viewId);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos del dashboard...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'clientes':
        // Pasar la función de recarga al componente ClientsList
        return <ClientsList onDataChange={cargarDatos} />;
      case 'cobradores':
        return <CobradoresList onDataChange={cargarDatos} />;
      case 'creditos':
        return <CreditsList onDataChange={cargarDatos} />;
      case 'reportes':
        return (
          <div className="reports-container">
            <h2>Reportes y Estadísticas</h2>
            <div className="reports-grid">
              <div className="report-card">
                <FiBarChart2 className="report-icon" />
                <h3>Reporte de Créditos</h3>
                <div className="report-preview">
                  <p>📊 Total créditos: {stats.totalCreditos}</p>
                  <p>✅ Activos: {stats.creditosActivos}</p>
                  <p>💰 Pagados: {stats.creditosPagados}</p>
                  <p>⚠️ Vencidos: {stats.creditosVencidos}</p>
                </div>
              </div>
              <div className="report-card">
                <FiDollarSign className="report-icon" />
                <h3>Reporte Financiero</h3>
                <div className="report-preview">
                  <p>💵 Total prestado: {formatCurrency(stats.montoTotalPrestado)}</p>
                  <p>💳 Total a pagar: {formatCurrency(stats.montoTotalAPagar)}</p>
                  <p>📈 Intereses: {formatCurrency(stats.interesesGenerados)}</p>
                </div>
              </div>
              <div className="report-card">
                <FiUsers className="report-icon" />
                <h3>Rendimiento</h3>
                <div className="report-preview">
                  <p>👥 Clientes: {stats.totalClientes}</p>
                  <p>🤝 Cobradores: {stats.totalCobradores}</p>
                  <p>📊 Promedio x cliente: {formatCurrency(stats.montoTotalPrestado / (stats.totalClientes || 1))}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <h1>Bienvenido, {user?.name || 'Usuario'}</h1>
            <p className="welcome-subtitle">Resumen general del sistema</p>
            
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setCurrentView('clientes')}>
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FiUsers />
                </div>
                <div className="stat-info">
                  <h3>Clientes</h3>
                  <p>{stats.totalClientes}</p>
                  <span className="stat-trend">Ver todos →</span>
                </div>
              </div>

              <div className="stat-card" onClick={() => setCurrentView('cobradores')}>
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <MdHandshake />
                </div>
                <div className="stat-info">
                  <h3>Cobradores</h3>
                  <p>{stats.totalCobradores}</p>
                  <span className="stat-trend">Ver todos →</span>
                </div>
              </div>

              <div className="stat-card" onClick={() => setCurrentView('creditos')}>
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <FiCreditCard />
                </div>
                <div className="stat-info">
                  <h3>Créditos Activos</h3>
                  <p>{stats.creditosActivos}</p>
                  <span className="stat-trend">{stats.creditosVencidos} vencidos</span>
                </div>
              </div>

              <div className="stat-card" onClick={() => setCurrentView('reportes')}>
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <FiBarChart2 />
                </div>
                <div className="stat-info">
                  <h3>Total Prestado</h3>
                  <p>{formatCurrency(stats.montoTotalPrestado)}</p>
                  <span className="stat-trend">Ver reportes →</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Accesos rápidos</h2>
              <div className="actions-grid">
                <button 
                  className="action-btn"
                  onClick={() => setCurrentView('clientes')}
                >
                  <FiDollarSign className="action-icon" />
                  <div>
                    <strong>Clientes</strong>
                    <small>{stats.totalClientes} registros</small>
                  </div>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setCurrentView('cobradores')}
                >
                  <MdHandshake className="action-icon" />
                  <div>
                    <strong>Cobradores</strong>
                    <small>{stats.totalCobradores} activos</small>
                  </div>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setCurrentView('creditos')}
                >
                  <FiCreditCard className="action-icon" />
                  <div>
                    <strong>Créditos</strong>
                    <small>{stats.totalCreditos} totales</small>
                  </div>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setCurrentView('reportes')}
                >
                  <FiBarChart2 className="action-icon" />
                  <div>
                    <strong>Reportes</strong>
                    <small>Estadísticas</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">📊</span>
            <h2>Credirobo Business</h2>
          </div>
          {isMobile && (
            <button 
              className="close-menu-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiX />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-text">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.name || 'Usuario')}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="user-email">{user?.email || 'usuario@credirobo.com'}</span>
            </div>
          </div>
          <button onClick={onLogout} className="logout-button">
            <FiLogOut className="nav-icon" />
            <span className="nav-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <main className="main-content">
        <div className="content-header">
          <div className="header-left">
            {isMobile && (
              <button 
                className="menu-toggle"
                onClick={() => setMobileMenuOpen(true)}
              >
                <FiMenu />
              </button>
            )}
            <h1>
              {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
          </div>
          
          {isMobile && (
            <div className="mobile-user">
              <FiUser />
            </div>
          )}
        </div>

        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;