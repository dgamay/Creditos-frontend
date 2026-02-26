// ============================================
// COMPONENTE LISTA DE CRÉDITOS
// Adaptado a la API real
// ============================================

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal/Modal';
import Alert from '../common/Alert/Alert';
import CreditCard from './CreditCard';
import CreditForm from './CreditForm';
import creditsService from '../../services/credits/creditos.service';
import clientesService from '../../services/clientes/clientes.service';
import cobradoresService from '../../services/cobradores/cobradores.service';
import './CreditsList.css';

const CreditsList = () => {
  const [credits, setCredits] = useState([]);
  const [clients, setClients] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar clientes y cobradores
        const [clientesData, cobradoresData] = await Promise.all([
          clientesService.getAll(),
          cobradoresService.getAll()
        ]);

        setClients(clientesData);
        setCollectors(cobradoresData);

        // Crear un mapa de cobradores para búsqueda rápida
        const collectorMap = {};
        cobradoresData.forEach(c => {
          collectorMap[c._id] = c.nombre;
        });

        // Obtener créditos de todos los clientes
        const allCredits = await creditsService.getAllFromClientes(clientesData);
        
        // Enriquecer con nombre del cobrador
        const enrichedCredits = allCredits.map(credit => ({
          ...credit,
          cobrador: collectorMap[credit.cobrador_id] || 'No asignado'
        }));

        setCredits(enrichedCredits);
        setFilteredCredits(enrichedCredits);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar créditos por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCredits(credits);
    } else {
      const filtered = credits.filter(credit =>
        credit.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.clienteCedula?.includes(searchTerm) ||
        credit.cobrador?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCredits(filtered);
    }
  }, [searchTerm, credits]);

  // Calcular estadísticas
  const calculateStats = () => {
    const totalLoaned = credits.reduce((sum, c) => sum + (c.monto_prestado || 0), 0);
    const totalToPay = credits.reduce((sum, c) => sum + (c.monto_por_pagar || 0), 0);
    const pending = credits.filter(c => c.estado === 'pendiente').length;
    const paid = credits.filter(c => c.estado === 'pagado').length;

    // Calcular vencidos (pendientes con fecha pasada)
    const today = new Date();
    const overdue = credits.filter(c => {
      if (c.estado !== 'pendiente') return false;
      const paymentDate = new Date(c.fecha_pago);
      return paymentDate < today;
    }).length;

    return { totalLoaned, totalToPay, pending, paid, overdue };
  };

  const stats = calculateStats();

  // Handlers
  const showAlert = (type, message) => setAlert({ type, message });

  const handleCreate = () => {
    setSelectedCredit(null);
    setModalOpen(true);
  };

  const handleSave = async (creditData) => {
    try {
      const newCredit = await creditsService.create(creditData);
      
      // Buscar el cliente y cobrador para mostrar nombres
      const client = clients.find(c => c._id === newCredit.cliente_id);
      const collector = collectors.find(c => c._id === newCredit.cobrador_id);
      
      const enrichedCredit = {
        ...newCredit,
        clienteNombre: client?.nombre,
        clienteCedula: client?.cedula,
        cobrador: collector?.nombre
      };

      setCredits(prev => [...prev, enrichedCredit]);
      showAlert('success', 'Crédito creado exitosamente');
      setModalOpen(false);
    } catch (err) {
      showAlert('error', 'Error al crear el crédito');
    }
  };

  const handleViewDetails = (credit) => {
    setSelectedCredit(credit);
    setDetailModalOpen(true);
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
    <div className="credits-container">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Estadísticas */}
      <div className="credits-stats">
        <div className="stat-item highlight">
          <span className="stat-value">{formatCurrency(stats.totalLoaned)}</span>
          <span className="stat-label">Total Prestado</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatCurrency(stats.totalToPay - stats.totalLoaned)}</span>
          <span className="stat-label">Intereses (30%)</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.overdue}</span>
          <span className="stat-label">Vencidos</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.paid}</span>
          <span className="stat-label">Pagados</span>
        </div>
      </div>

      {/* Header */}
      <div className="credits-header">
        <h2>Créditos</h2>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por cliente o cobrador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <button className="btn-create" onClick={handleCreate}>
            <span className="btn-icon">➕</span>
            Nuevo Crédito
          </button>
        </div>
      </div>

      {/* Lista de créditos */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando créditos...</p>
        </div>
      ) : filteredCredits.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💰</span>
          <h3>No hay créditos</h3>
          <p>Comienza creando el primer crédito</p>
          <button className="btn-create" onClick={handleCreate}>
            Crear Crédito
          </button>
        </div>
      ) : (
        <div className="credits-grid">
          {filteredCredits.map(credit => (
            <CreditCard
              key={credit._id}
              credit={credit}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Modal para crear crédito */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo Crédito"
        size="large"
      >
        <CreditForm
          clients={clients}
          collectors={collectors}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detalles del Crédito"
        size="medium"
      >
        {selectedCredit && (
          <div className="credit-details">
            <h3>{selectedCredit.clienteNombre}</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Monto prestado:</label>
                <span>{formatCurrency(selectedCredit.monto_prestado)}</span>
              </div>
              <div className="detail-item">
                <label>Total a pagar:</label>
                <span>{formatCurrency(selectedCredit.monto_por_pagar)}</span>
              </div>
              <div className="detail-item">
                <label>Interés pagado:</label>
                <span>{formatCurrency(selectedCredit.monto_por_pagar - selectedCredit.monto_prestado)}</span>
              </div>
              <div className="detail-item">
                <label>Fecha origen:</label>
                <span>{new Date(selectedCredit.fecha_origen).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Fecha pago:</label>
                <span>{new Date(selectedCredit.fecha_pago).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Estado:</label>
                <span className={`status-badge status-${selectedCredit.estado}`}>
                  {selectedCredit.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
                </span>
              </div>
              <div className="detail-item">
                <label>Cobrador:</label>
                <span>{selectedCredit.cobrador}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreditsList;