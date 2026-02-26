import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal/Modal';
import Alert from '../common/Alert/Alert';
import CollectorCard from './CollectorCard';
import CollectorForm from './CollectorForm';
import cobradoresService from '../../services/cobradores/cobradores.service';
import './CollectorsList.css';

const CollectorsList = () => {
  const [collectors, setCollectors] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Cargar cobradores
  useEffect(() => {
    const fetchCollectors = async () => {
      setLoading(true);
      try {
        const data = await cobradoresService.getAll();
        setCollectors(data);
        setFilteredCollectors(data);
      } catch (err) {
        setError('Error al cargar los cobradores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, []);

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

  const handleSave = async (collectorData) => {
    try {
      if (modalMode === 'create') {
        const nuevo = await cobradoresService.create(collectorData);
        setCollectors(prev => [...prev, nuevo]);
        showAlert('success', 'Cobrador creado exitosamente');
      } else {
        const actualizado = await cobradoresService.update(selectedCollector._id, collectorData);
        setCollectors(prev => prev.map(c => 
          c._id === selectedCollector._id ? actualizado : c
        ));
        showAlert('success', 'Cobrador actualizado exitosamente');
      }
      setModalOpen(false);
    } catch (err) {
      showAlert('error', `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} el cobrador`);
    }
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

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

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

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando cobradores...</p>
        </div>
      ) : filteredCollectors.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👤</span>
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
            />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="collectors-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Celular</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollectors.map(collector => (
                <tr key={collector._id}>
                  <td>{collector.nombre}</td>
                  <td>{collector.cedula}</td>
                  <td>{collector.celular}</td>
                  <td>{collector.direccion || '-'}</td>
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
    </div>
  );
};

export default CollectorsList;