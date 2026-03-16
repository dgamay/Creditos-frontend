// ============================================
// ADMIN DASHBOARD - FRONTEND
// src/components/Admin/AdminDashboard.js
// Panel principal del superadmin
// Muestra estadísticas globales y gestión de empresas
// ============================================

import React, { useState, useEffect } from 'react';
import { FiUsers, FiToggleLeft, FiToggleRight, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { MdBusiness } from 'react-icons/md';
import adminService from '../../services/admin/admin.service';
import './Admin.css';

const AdminDashboard = ({ onLogout }) => {

  // ============================================
  // ESTADOS
  // ============================================
  const [empresas, setEmpresas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el formulario de nueva empresa
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    nombre: '',
    email: '',
    notas: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // ============================================
  // CARGAR DATOS AL MONTAR
  // ============================================
  useEffect(() => {
    cargarDatos();
  }, []);

  // ============================================
  // CARGAR EMPRESAS Y ESTADÍSTICAS
  // ============================================
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar empresas y stats en paralelo
      const [empresasData, statsData] = await Promise.all([
        adminService.getEmpresas(),
        adminService.getStats()
      ]);
      setEmpresas(empresasData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los datos. Verifica tu conexión.');
      console.error('❌ Error cargando datos admin:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CREAR EMPRESA
  // ============================================
  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validar campos
    if (!formData.tenantId || !formData.nombre || !formData.email) {
      setFormError('TenantID, nombre y email son obligatorios');
      return;
    }

    // Validar formato tenantId
    const tenantRegex = /^[a-zA-Z0-9\-]+$/;
    if (!tenantRegex.test(formData.tenantId)) {
      setFormError('TenantID solo puede tener letras, números y guiones');
      return;
    }

    setFormLoading(true);
    try {
      await adminService.createEmpresa(formData);

      // Resetear formulario y recargar datos
      setFormData({ tenantId: '', nombre: '', email: '', notas: '' });
      setShowForm(false);
      await cargarDatos();

    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al crear la empresa';
      setFormError(mensaje);
    } finally {
      setFormLoading(false);
    }
  };

  // ============================================
  // ACTIVAR / DESACTIVAR EMPRESA
  // ============================================
  const handleToggle = async (empresa) => {
    try {
      await adminService.toggleEmpresa(empresa._id, !empresa.activa);
      await cargarDatos();
    } catch (err) {
      console.error('❌ Error al cambiar estado:', err);
    }
  };

  // ============================================
  // ELIMINAR EMPRESA
  // ============================================
  const handleEliminar = async (empresa) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar "${empresa.nombre}"?\nEsta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await adminService.deleteEmpresa(empresa._id);
      await cargarDatos();
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
    }
  };

  // ============================================
  // RENDER — LOADING
  // ============================================
  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-loading">
          <span className="admin-spinner"></span>
          <p>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — ERROR
  // ============================================
  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="admin-error-state">
          <p>{error}</p>
          <button className="admin-btn-primary" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER — DASHBOARD
  // ============================================
  return (
    <div className="admin-dashboard-container">

      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="admin-header-left">
          <h1 className="admin-dashboard-title">
            🔐 Panel de Administración
          </h1>
          <p className="admin-dashboard-subtitle">
            Gestión global de empresas
          </p>
        </div>
        <div className="admin-header-right">
          <button
            className="admin-btn-secondary"
            onClick={cargarDatos}
            title="Recargar datos"
          >
            <FiRefreshCw size={16} />
            <span>Actualizar</span>
          </button>
          <button className="admin-btn-danger" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <MdBusiness size={28} className="admin-stat-icon" />
            <div>
              <span className="admin-stat-label">Total empresas</span>
              <span className="admin-stat-value">
                {stats.resumen.totalEmpresas}
              </span>
            </div>
          </div>
          <div className="admin-stat-card activas">
            <FiToggleRight size={28} className="admin-stat-icon" />
            <div>
              <span className="admin-stat-label">Activas</span>
              <span className="admin-stat-value">
                {stats.resumen.empresasActivas}
              </span>
            </div>
          </div>
          <div className="admin-stat-card inactivas">
            <FiToggleLeft size={28} className="admin-stat-icon" />
            <div>
              <span className="admin-stat-label">Inactivas</span>
              <span className="admin-stat-value">
                {stats.resumen.empresasInactivas}
              </span>
            </div>
          </div>
          <div className="admin-stat-card clientes">
            <FiUsers size={28} className="admin-stat-icon" />
            <div>
              <span className="admin-stat-label">Total clientes</span>
              <span className="admin-stat-value">
                {stats.empresas.reduce((sum, e) => sum + e.totalClientes, 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botón nueva empresa */}
      <div className="admin-section-header">
        <h2 className="admin-section-title">Empresas registradas</h2>
        <button
          className="admin-btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus size={16} />
          <span>Nueva empresa</span>
        </button>
      </div>

      {/* Formulario nueva empresa */}
      {showForm && (
        <div className="admin-form-card">
          <h3 className="admin-form-title">Registrar nueva empresa</h3>
          <form onSubmit={handleCrearEmpresa} className="admin-empresa-form">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">TenantID *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="ej: empresa2"
                  value={formData.tenantId}
                  onChange={(e) => setFormData({
                    ...formData,
                    tenantId: e.target.value
                  })}
                />
                <small className="admin-form-hint">
                  Solo letras, números y guiones
                </small>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre comercial *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="ej: Empresa Dos SAS"
                  value={formData.nombre}
                  onChange={(e) => setFormData({
                    ...formData,
                    nombre: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Email de contacto *</label>
                <input
                  type="email"
                  className="admin-form-input"
                  placeholder="admin@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    email: e.target.value
                  })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Notas (opcional)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="Notas internas..."
                  value={formData.notas}
                  onChange={(e) => setFormData({
                    ...formData,
                    notas: e.target.value
                  })}
                />
              </div>
            </div>

            {formError && (
              <p className="admin-error-message">🚫 {formError}</p>
            )}

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={formLoading}
              >
                {formLoading ? (
                  <span className="admin-spinner-small"></span>
                ) : (
                  <>
                    <FiPlus size={16} />
                    <span>Crear empresa</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de empresas */}
      {empresas.length === 0 ? (
        <div className="admin-empty-state">
          <MdBusiness size={48} />
          <p>No hay empresas registradas</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>TenantID</th>
                <th>Email</th>
                <th>Clientes</th>
                <th>Créditos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(empresa => {
                // Buscar stats de esta empresa
                const empresaStats = stats?.empresas?.find(
                  e => e.tenantId === empresa.tenantId
                );
                return (
                  <tr key={empresa._id}>
                    <td className="admin-td-nombre">
                      <strong>{empresa.nombre}</strong>
                      {empresa.notas && (
                        <small>{empresa.notas}</small>
                      )}
                    </td>
                    <td>
                      <span className="admin-badge-tenant">
                        {empresa.tenantId}
                      </span>
                    </td>
                    <td>{empresa.email}</td>
                    <td className="admin-td-number">
                      {empresaStats?.totalClientes ?? 0}
                    </td>
                    <td className="admin-td-number">
                      {empresaStats?.totalCreditos ?? 0}
                    </td>
                    <td>
                      <span className={`admin-badge-estado ${empresa.activa ? 'activa' : 'inactiva'}`}>
                        {empresa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="admin-td-actions">
                      {/* Toggle activa/inactiva */}
                      <button
                        className={`admin-action-btn toggle ${empresa.activa ? 'desactivar' : 'activar'}`}
                        onClick={() => handleToggle(empresa)}
                        title={empresa.activa ? 'Desactivar' : 'Activar'}
                      >
                        {empresa.activa
                          ? <FiToggleRight size={18} />
                          : <FiToggleLeft size={18} />
                        }
                      </button>
                      {/* Eliminar */}
                      <button
                        className="admin-action-btn eliminar"
                        onClick={() => handleEliminar(empresa)}
                        title="Eliminar empresa"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;