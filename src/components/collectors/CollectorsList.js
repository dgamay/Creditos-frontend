// ============================================
// COMPONENTE COLLECTORS LIST - VERSIÓN CON LOGS
// Para depurar por qué no se ven los datos
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
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

  // ============================================
  // VERSIÓN SIMPLIFICADA - Solo para ver qué datos llegan
  // ============================================
  // ============================================
// VERSIÓN CORREGIDA - Asocia créditos usando cobrador_id del crédito
// ============================================
const calcularEstadisticasCobradores = useCallback((cobradores, clientes, creditos) => {
  console.log('📊 CALCULANDO ESTADÍSTICAS (VERSIÓN CORREGIDA)');
  
  // Primero, crear un mapa de clientes por ID para fácil acceso
  const clientesPorId = {};
  clientes.forEach(cliente => {
    clientesPorId[cliente._id] = cliente;
  });

  const cobradoresConStats = cobradores.map(cobrador => {
    console.log(`\n🔹 Procesando cobrador: ${cobrador.nombre} (${cobrador._id})`);
    
    // 1. Buscar TODOS los créditos que tienen este cobrador_id
    const creditosCobrador = creditos.filter(c => {
      const pertenece = c.cobrador_id === cobrador._id;
      if (pertenece) {
        console.log(`  ✅ Crédito encontrado: $${c.monto_prestado} para cliente ${c.cliente_id}`);
      }
      return pertenece;
    });
    
    console.log(`  → Total créditos: ${creditosCobrador.length}`);

    // 2. Obtener IDs únicos de clientes de estos créditos
    const clienteIdsDeCreditos = [...new Set(creditosCobrador.map(c => c.cliente_id))];
    
    // 3. Obtener los clientes completos
    const clientesAsignados = clienteIdsDeCreditos
      .map(id => clientesPorId[id])
      .filter(c => c); // Filtrar undefined

    console.log(`  → Clientes únicos: ${clientesAsignados.length}`);
    clientesAsignados.forEach(c => console.log(`     - ${c.nombre}`));

    // 4. Calcular diferentes estados de créditos
    const hoy = new Date();
    
    const creditosActivos = creditosCobrador.filter(c => 
      c.estado === 'pendiente' && new Date(c.fecha_pago) >= hoy
    ).length;

    const creditosVencidos = creditosCobrador.filter(c => 
      c.estado === 'pendiente' && new Date(c.fecha_pago) < hoy
    ).length;

    const creditosPagados = creditosCobrador.filter(c => c.estado === 'pagado').length;

    console.log(`  → Activos: ${creditosActivos}, Vencidos: ${creditosVencidos}, Pagados: ${creditosPagados}`);

    // 5. Montos
    const totalPrestado = creditosCobrador.reduce((sum, c) => {
      return sum + (c.monto_prestado || 0);
    }, 0);
    
    const totalPagado = creditosCobrador
      .filter(c => c.estado === 'pagado')
      .reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
    
    const totalPendiente = totalPrestado - totalPagado;
    const porcentajeCobrado = totalPrestado > 0 ? (totalPagado / totalPrestado) * 100 : 0;

    console.log(`  → Monto prestado: $${totalPrestado}, Pagado: $${totalPagado}`);

    return {
      ...cobrador,
      totalClientes: clientesAsignados.length,
      clientes: clientesAsignados,
      totalCreditos: creditosCobrador.length,
      creditosActivos,
      creditosPagados,
      creditosVencidos,
      totalPrestado,
      totalPagado,
      totalPendiente,
      porcentajeCobrado
    };
  });

  console.log('✅ Estadísticas finales:', cobradoresConStats);
  return cobradoresConStats;
}, []);

  // ============================================
  // CARGAR DATOS DESDE LA API
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log('🔄 INICIANDO CARGA DE DATOS');
      
      try {
        // 1. Obtener cobradores
        console.log('1️⃣ Obteniendo cobradores...');
        const cobradoresData = await cobradoresService.getAll();
        console.log('✅ Cobradores:', cobradoresData);
        
        // 2. Obtener clientes
        console.log('2️⃣ Obteniendo clientes...');
        const clientesData = await clientesService.getAll();
        console.log('✅ Clientes:', clientesData);
        
        // 3. Obtener créditos
        console.log('3️⃣ Obteniendo créditos de todos los clientes...');
        let creditosData = [];
        
        for (const cliente of clientesData) {
          console.log(`   → Buscando créditos de cliente: ${cliente.nombre} (${cliente._id})`);
          try {
            const creditosCliente = await creditsService.getByCliente(cliente._id);
            console.log(`      → Encontrados ${creditosCliente.length} créditos`);
            creditosData = [...creditosData, ...creditosCliente];
          } catch (error) {
            console.log(`      → Error o sin créditos para este cliente`);
          }
        }
        
        console.log('✅ Total créditos:', creditosData.length);
        if (creditosData.length > 0) {
          console.log('Primer crédito (estructura):', creditosData[0]);
        }

        // 4. Calcular estadísticas
        console.log('4️⃣ Calculando estadísticas...');
        const cobradoresConStats = calcularEstadisticasCobradores(
          cobradoresData, 
          clientesData, 
          creditosData
        );
        
        console.log('✅ Resultado final:', cobradoresConStats);
        
        setCollectors(cobradoresConStats);
        setFilteredCollectors(cobradoresConStats);

        // 5. Calcular estadísticas globales
        const totalPrestado = cobradoresConStats.reduce((sum, c) => sum + (c.totalPrestado || 0), 0);
        const totalCobrado = cobradoresConStats.reduce((sum, c) => sum + (c.totalPagado || 0), 0);
        
        setStats({
          totalCollectors: cobradoresConStats.length,
          totalClientesAsignados: cobradoresConStats.reduce((sum, c) => sum + (c.totalClientes || 0), 0),
          totalPrestado,
          totalCobrado,
          totalPendiente: totalPrestado - totalCobrado
        });

      } catch (err) {
        console.error('❌ ERROR GLOBAL:', err);
        setAlert({ 
          type: 'error', 
          message: 'Error al cargar los datos. Por favor, intenta de nuevo.' 
        });
      } finally {
        setLoading(false);
        console.log('🏁 CARGA COMPLETADA');
      }
    };

    fetchData();
  }, [calcularEstadisticasCobradores]);

  // ============================================
  // FILTRAR COBRADORES POR BÚSQUEDA
  // ============================================
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
          clientes: [],
          totalCreditos: 0,
          creditosActivos: 0,
          creditosPagados: 0,
          creditosVencidos: 0,
          totalPrestado: 0,
          totalPagado: 0,
          totalPendiente: 0,
          porcentajeCobrado: 0
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
            >
              📱
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
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
              formatCurrency={formatCurrency}
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
                          style={{ width: `${Math.min(collector.porcentajeCobrado || 0, 100)}%` }}
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
        title={`${selectedCollector?.nombre || 'Cobrador'}`}
        size="large"
      >
        {selectedCollector && (
          <div className="collector-details-modal">
            <div className="details-header">
              <h2>{selectedCollector.nombre}</h2>
              <p className="collector-id">ID: {selectedCollector._id?.slice(-6) || 'N/A'}</p>
            </div>

            <div className="details-grid-principal">
              <div className="detail-card">
                <span className="detail-label">CLIENTES</span>
                <span className="detail-value large">{selectedCollector.totalClientes || 0}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">CRÉDITOS</span>
                <span className="detail-value large">{selectedCollector.totalCreditos || 0}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">PRESTADO</span>
                <span className="detail-value large">{formatCurrency(selectedCollector.totalPrestado)}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">COBRADO</span>
                <span className="detail-value large success">{formatCurrency(selectedCollector.totalPagado)}</span>
              </div>
            </div>

            <div className="efectividad-section">
              <h3>Efectividad de cobro</h3>
              <div className="efectividad-value">
                <span className="porcentaje">{Math.round(selectedCollector.porcentajeCobrado || 0)}%</span>
              </div>
              <div className="progress-bar-large">
                <div 
                  className="progress-fill-large" 
                  style={{ width: `${Math.min(selectedCollector.porcentajeCobrado || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="estado-creditos">
              <div className="estado-item">
                <span className="estado-label">ACTIVOS</span>
                <span className="estado-value active">{selectedCollector.creditosActivos || 0}</span>
              </div>
              <div className="estado-item">
                <span className="estado-label">PAGADOS</span>
                <span className="estado-value pagado">{selectedCollector.creditosPagados || 0}</span>
              </div>
              <div className="estado-item">
                <span className="estado-label">VENCIDOS</span>
                <span className="estado-value vencido">{selectedCollector.creditosVencidos || 0}</span>
              </div>
            </div>

            <div className="contacto-info">
              <h4>Información de contacto</h4>
              <div className="contacto-grid">
                <div className="contacto-item">
                  <strong>📞 Teléfono:</strong> {selectedCollector.celular}
                </div>
                <div className="contacto-item">
                  <strong>📍 Dirección:</strong> {selectedCollector.direccion}
                </div>
                <div className="contacto-item">
                  <strong>🆔 Cédula:</strong> {selectedCollector.cedula}
                </div>
              </div>
            </div>

            {selectedCollector.clientes && selectedCollector.clientes.length > 0 && (
              <div className="clientes-asignados">
                <h4>Clientes Asignados</h4>
                <div className="clientes-lista">
                  {selectedCollector.clientes.map(cliente => (
                    <div key={cliente._id} className="cliente-item-detalle">
                      <span className="cliente-nombre">{cliente.nombre}</span>
                      <span className="cliente-cedula">C.C. {cliente.cedula}</span>
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