import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal/Modal';
import Alert from '../common/Alert/Alert';
import ClientForm from './ClientForm';
import ClientCard from './ClientCard';
import clientesService from '../../services/clientes/clientes.service';
import cobradoresService from '../../services/cobradores/cobradores.service';
import './ClientsList.css';

const ClientsList = () => {
  // Estados principales
  const [clientes, setClientes] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales y UI
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
  // Estados para carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Intentando obtener clientes de la API...');
        console.log('URL base:', process.env.REACT_APP_API_URL);
        
        const clientesData = await clientesService.getAll();
        console.log('✅ Clientes recibidos:', clientesData);
        
        console.log('🔄 Intentando obtener cobradores...');
        const cobradoresData = await cobradoresService.getAll();
        console.log('✅ Cobradores recibidos:', cobradoresData);
        
        setClientes(clientesData);
        setFilteredClientes(clientesData);
        setCobradores(cobradoresData);
      } catch (err) {
        console.error('❌ ERROR COMPLETO:', err);
        console.error('Mensaje:', err.message);
        console.error('Respuesta del servidor:', err.response);
        setError(`Error al cargar los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar clientes por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cedula?.includes(searchTerm) ||
        cliente.celular?.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  // Mostrar alerta
  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setModalMode('create');
    setSelectedCliente(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (cliente) => {
    setModalMode('edit');
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  // Eliminar cliente
  const handleDelete = async (cliente) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre}?`)) {
      try {
        await clientesService.delete(cliente._id);
        setClientes(prev => prev.filter(c => c._id !== cliente._id));
        showAlert('success', 'Cliente eliminado exitosamente');
      } catch (err) {
        showAlert('error', 'Error al eliminar el cliente');
        console.error(err);
      }
    }
  };

  // Guardar cliente (crear o editar)
  const handleSave = async (clienteData) => {
    try {
      if (modalMode === 'create') {
        const nuevoCliente = await clientesService.create(clienteData);
        setClientes(prev => [...prev, nuevoCliente]);
        showAlert('success', 'Cliente creado exitosamente');
      } else {
        const clienteActualizado = await clientesService.update(selectedCliente._id, clienteData);
        setClientes(prev => prev.map(c => 
          c._id === selectedCliente._id ? clienteActualizado : c
        ));
        showAlert('success', 'Cliente actualizado exitosamente');
      }
      setModalOpen(false);
    } catch (err) {
      showAlert('error', `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} el cliente`);
      console.error(err);
    }
  };

  return (
    <div className="clients-container">
      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="clients-header">
        <h2>Clientes</h2>
        <div className="header-actions">
          {/* Buscador */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          {/* Cambiar vista */}
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

          {/* Botón crear */}
          <button className="btn-create" onClick={handleCreate}>
            <span className="btn-icon">➕</span>
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
           <p>Cargando clientes y cobradores...</p>
    <p className="loading-hint">Esto puede tomar unos segundos si la API está "despertando"</p>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h3>No hay clientes</h3>
          <p>Comienza creando tu primer cliente</p>
          <button className="btn-create" onClick={handleCreate}>
            Crear Cliente
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Vista de cuadrícula (tarjetas) */
        <div className="clients-grid">
          {filteredClientes.map(cliente => (
            <ClientCard
              key={cliente._id}
              client={cliente}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Vista de tabla */
        <div className="table-responsive">
          <table className="clients-table">
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
              {filteredClientes.map(cliente => (
                <tr key={cliente._id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.cedula}</td>
                  <td>{cliente.celular}</td>
                  <td>{cliente.direccion}</td>
                  <td>
                    <button 
                      className="table-action edit"
                      onClick={() => handleEdit(cliente)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="table-action delete"
                      onClick={() => handleDelete(cliente)}
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

      {/* Modal para crear/editar cliente */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
        size="large"
      >
        <ClientForm
          client={selectedCliente}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          cobradores={cobradores}
        />
      </Modal>
    </div>
  );
};

export default ClientsList;