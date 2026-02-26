// ============================================
// COMPONENTE COLLECTORS LIST
// Con useCallback para evitar warnings
// ============================================

import React, { useState, useEffect, useCallback } from 'react'; // 👈 Importar useCallback
import Modal from '../common/Modal/Modal';
import Alert from '../common/Alert/Alert';
import CollectorCard from './CollectorCard';
import CollectorForm from './CollectorForm';
import cobradoresService from '../../services/cobradores/cobradores.service';
import clientesService from '../../services/clientes/clientes.service';
import creditsService from '../../services/credits/creditos.service';
import { FiDollarSign, FiUsers, FiCreditCard } from 'react-icons/fi';
import { MdHandshake } from 'react-icons/md';
import './CollectorsList.css';

const CollectorsList = () => {
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    totalCollectors: 0,
    totalClientesAsignados: 0,
    totalPrestado: 0,
    totalCobrado: 0,
    totalPendiente: 0
  });

  // Datos de ejemplo - Envuelto en useCallback
  const usarDatosEjemplo = useCallback(() => {
    const collectorsEjemplo = [
      {
        _id: '1',
        nombre: 'David España',
        celular: '3110000023',
        direccion: 'Cali',
        cedula: '2232',
        totalClientes: 5,
        totalCreditos: 8,
        creditosActivos: 3,
        creditosPagados: 4,
        creditosVencidos: 1,
        totalPrestado: 4500000,
        totalPagado: 2500000,
        totalPendiente: 2000000,
        porcentajeCobrado: 55.5,
        clientes: [
          { _id: 'c1', nombre: 'María González' },
          { _id: 'c2', nombre: 'Carlos Rodríguez' },
          { _id: 'c3', nombre: 'Ana Martínez' }
        ]
      },
      {
        _id: '2',
        nombre: 'Paolo Pantoja',
        celular: '3110000021',
        direccion: 'El Prado',
        cedula: '2226',
        totalClientes: 3,
        totalCreditos: 5,
        creditosActivos: 2,
        creditosPagados: 3,
        creditosVencidos: 0,
        totalPrestado: 3200000,
        totalPagado: 2100000,
        totalPendiente: 1100000,
        porcentajeCobrado: 65.6,
        clientes: [
          { _id: 'c4', nombre: 'Juan Pérez' },
          { _id: 'c5', nombre: 'Laura Sánchez' }
        ]
      }
    ];

    setCollectors(collectorsEjemplo);
    setFilteredCollectors(collectorsEjemplo);
    calcularEstadisticasGlobales(collectorsEjemplo);
  }, []); // useCallback sin dependencias porque no usa variables externas

  // Función para calcular estadísticas globales
  const calcularEstadisticasGlobales = useCallback((collectorsData) => {
    const totalCollectors = collectorsData.length;
    const totalClientesAsignados = collectorsData.reduce((sum, c) => sum + (c.totalClientes || 0), 0);
    const totalPrestado = collectorsData.reduce((sum, c) => sum + (c.totalPrestado || 0), 0);
    const totalCobrado = collectorsData.reduce((sum, c) => sum + (c.totalPagado || 0), 0);
    const totalPendiente = totalPrestado - totalCobrado;

    setStats({
      totalCollectors,
      totalClientesAsignados,
      totalPrestado,
      totalCobrado,
      totalPendiente
    });
  }, []); // useCallback sin dependencias

  // Cargar datos - AHORA CON DEPENDENCIAS CORRECTAS
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar clientes y créditos primero
        const [clientesData, creditosData] = await Promise.all([
          clientesService.getAll(),
          creditsService.getAllFromClientes([])
        ]);

        // Obtener cobradores con estadísticas
        const cobradoresData = await cobradoresService.getEstadisticasTodos(clientesData, creditosData);
        
        setCollectors(cobradoresData);
        setFilteredCollectors(cobradoresData);

        // Calcular estadísticas globales
        calcularEstadisticasGlobales(cobradoresData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        usarDatosEjemplo(); // 👈 Ahora esta función es estable gracias a useCallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [calcularEstadisticasGlobales, usarDatosEjemplo]); // 👈 Dependencias incluidas

  // Filtrar cobradores
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCollectors(collectors);
    } else {
      const filtered = collectors.filter(c =>
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cedula?.includes(searchTerm) ||
        c.celular?.includes(searchTerm)
      );
      setFilteredCollectors(filtered);
    }
  }, [searchTerm, collectors]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedCollector(null);
    setModalOpen(true);
  };

  const handleEdit = (collector) => {
    setModalMode('edit');
    setSelectedCollector(collector);
    setModalOpen(true);
  };

  const handleDelete = async (collector) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${collector.nombre}?`)) {
      try {
        await cobradoresService.delete(collector._id);
        setCollectors(prev => prev.filter(c => c._id !== collector._id));
        showAlert('success', 'Cobrador eliminado exitosamente');
      } catch (err) {
        showAlert('error', 'Error al eliminar el cobrador');
      }
    }
  };

  const handleViewDetails = (collector) => {
    setSelectedCollector(collector);
    setDetailModalOpen(true);
  };

  const handleSave = async (collectorData) => {
    try {
      if (modalMode === 'create') {
        const nuevo = await cobradoresService.create(collectorData);
        const nuevoConStats = {
          ...nuevo,
          totalClientes: 0,
          totalCreditos: 0,
          creditosActivos: 0,
          creditosPagados: 0,
          creditosVencidos: 0,
          totalPrestado: 0,
          totalPagado: 0,
          totalPendiente: 0,
          porcentajeCobrado: 0,
          clientes: []
        };
        setCollectors(prev => [...prev, nuevoConStats]);
        showAlert('success', 'Cobrador creado exitosamente');
      } else {
        const actualizado = await cobradoresService.update(selectedCollector._id, collectorData);
        setCollectors(prev => prev.map(c => 
          c._id === selectedCollector._id ? { ...c, ...actualizado } : c
        ));
        showAlert('success', 'Cobrador actualizado exitosamente');
      }
      setModalOpen(false);
    } catch (err) {
      showAlert('error', `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} el cobrador`);
    }
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="collectors-container">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Estadísticas globales */}
      <div className="global-stats">
        <div className="stat-card global">
          <MdHandshake className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Cobradores</span>
            <span className="stat-value">{stats.totalCollectors}</span>
          </div>
        </div>
        <div className="stat-card global">
          <FiUsers className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Clientes Asignados</span>
            <span className="stat-value">{stats.totalClientesAsignados}</span>
          </div>
        </div>
        <div className="stat-card global">
          <FiDollarSign className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Prestado</span>
            <span className="stat-value">{formatCurrency(stats.totalPrestado)}</span>
          </div>
        </div>
        <div className="stat-card global">
          <FiCreditCard className="stat-icon" style={{ color: '#34C759' }} />
          <div className="stat-info">
            <span className="stat-label">Total Cobrado</span>
            <span className="stat-value">{formatCurrency(stats.totalCobrado)}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="collectors-header">
        <h2>Cobradores</h2>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar cobrador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista cuadrícula"
            >
              📱
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista tabla"
            >
              📋
            </button>
          </div>

          <button className="btn-create" onClick={handleCreate}>
            <span className="btn-icon">➕</span>
            Nuevo Cobrador
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando cobradores...</p>
        </div>
      ) : filteredCollectors.length === 0 ? (
        <div className="empty-state">
          <MdHandshake className="empty-icon" />
          <h3>No hay cobradores</h3>
          <p>Comienza creando tu primer cobrador</p>
          <button className="btn-create" onClick={handleCreate}>
            Crear Cobrador
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="collectors-grid">
          {filteredCollectors.map(collector => (
            <CollectorCard
              key={collector._id}
              collector={collector}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="collectors-table">
            <thead>
              <tr>
                <th>Cobrador</th>
                <th>Clientes</th>
                <th>Créditos</th>
                <th>Activos</th>
                <th>Pagados</th>
                <th>Vencidos</th>
                <th>Total Prestado</th>
                <th>Total Cobrado</th>
                <th>Efectividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollectors.map(collector => (
                <tr key={collector._id}>
                  <td className="collector-cell">
                    <strong>{collector.nombre}</strong>
                    <br />
                    <small>{collector.celular}</small>
                  </td>
                  <td className="number-cell">{collector.totalClientes || 0}</td>
                  <td className="number-cell">{collector.totalCreditos || 0}</td>
                  <td className="number-cell active">{collector.creditosActivos || 0}</td>
                  <td className="number-cell pagado">{collector.creditosPagados || 0}</td>
                  <td className="number-cell vencido">{collector.creditosVencidos || 0}</td>
                  <td className="currency-cell">{formatCurrency(collector.totalPrestado)}</td>
                  <td className="currency-cell success">{formatCurrency(collector.totalPagado)}</td>
                  <td>
                    <div className="progress-mini">
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill-mini" 
                          style={{ width: `${collector.porcentajeCobrado || 0}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(collector.porcentajeCobrado || 0)}%</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="table-action edit"
                      onClick={() => handleEdit(collector)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="table-action delete"
                      onClick={() => handleDelete(collector)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Nuevo Cobrador' : 'Editar Cobrador'}
        size="medium"
      >
        <CollectorForm
          collector={selectedCollector}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detalles del Cobrador"
        size="large"
      >
        {selectedCollector && (
          <div className="collector-details">
            <div className="details-header">
              <div className="details-avatar">
                {selectedCollector.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="details-title">
                <h3>{selectedCollector.nombre}</h3>
                <p>Cédula: {selectedCollector.cedula} | Celular: {selectedCollector.celular}</p>
                <p>Dirección: {selectedCollector.direccion}</p>
              </div>
            </div>

            <div className="details-stats">
              <div className="stat-card detail">
                <FiUsers />
                <div>
                  <label>Clientes Asignados</label>
                  <span>{selectedCollector.totalClientes || 0}</span>
                </div>
              </div>
              <div className="stat-card detail">
                <FiCreditCard />
                <div>
                  <label>Créditos Gestionados</label>
                  <span>{selectedCollector.totalCreditos || 0}</span>
                </div>
              </div>
              <div className="stat-card detail">
                <FiDollarSign />
                <div>
                  <label>Total Prestado</label>
                  <span>{formatCurrency(selectedCollector.totalPrestado)}</span>
                </div>
              </div>
              <div className="stat-card detail success">
                <FiDollarSign />
                <div>
                  <label>Total Cobrado</label>
                  <span>{formatCurrency(selectedCollector.totalPagado)}</span>
                </div>
              </div>
            </div>

            <div className="details-creditos">
              <h4>Distribución de Créditos</h4>
              <div className="credit-distribution">
                <div className="dist-item">
                  <span className="dist-label">Activos</span>
                  <span className="dist-value active">{selectedCollector.creditosActivos || 0}</span>
                </div>
                <div className="dist-item">
                  <span className="dist-label">Pagados</span>
                  <span className="dist-value pagado">{selectedCollector.creditosPagados || 0}</span>
                </div>
                <div className="dist-item">
                  <span className="dist-label">Vencidos</span>
                  <span className="dist-value vencido">{selectedCollector.creditosVencidos || 0}</span>
                </div>
              </div>
            </div>

            {selectedCollector.clientes && selectedCollector.clientes.length > 0 && (
              <div className="details-clientes">
                <h4>Clientes Asignados</h4>
                <div className="clientes-lista-detalle">
                  {selectedCollector.clientes.map(cliente => (
                    <div key={cliente._id} className="cliente-item">
                      <span className="cliente-nombre">{cliente.nombre}</span>
                      <span className="cliente-cedula">{cliente.cedula}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CollectorsList;