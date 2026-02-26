import React from 'react';
import './ClientCard.css';

const ClientCard = ({ client, onEdit, onDelete }) => {
  // Verificación de seguridad - si no hay cliente, no renderizar
  if (!client) return null;

  return (
    <div className="client-card">
      <div className="client-card-header">
        <div className="client-avatar">
          {/* CAMBIO IMPORTANTE: usar client.nombre en lugar de client.name */}
          {client.nombre ? client.nombre.charAt(0).toUpperCase() : '?'}
        </div>
        
        <div className="client-info">         
          <h3>{client.nombre || 'Sin nombre'}</h3>         
        </div>

        <span className={`client-status status-${client.estado?.toLowerCase() || 'pendiente'}`}>
          {client.estado || 'Pendiente'}
        </span>
      </div>

      <div className="client-card-body">
        <div className="client-detail">
          <span className="detail-label">Cédula</span>
          <span className="detail-value">{client.cedula || 'N/A'}</span>
        </div>
        <div className="client-detail">
          <span className="detail-label">Celular</span>
          <span className="detail-value">{client.celular || 'N/A'}</span>
        </div>
        <div className="client-detail">
          <span className="detail-label">Dirección</span>
          <span className="detail-value">{client.direccion || 'N/A'}</span>
        </div>
        {/* La API no tiene fecha de registro, lo omitimos */}
        {/* <div className="client-detail">
          <span className="detail-label">Fecha Registro</span>
          <span className="detail-value">{client.registrationDate}</span>
        </div> */}
      </div>

      <div className="client-card-footer">
        <button 
          className="card-action edit"
          onClick={() => onEdit(client)}
        >
          ✏️ Editar
        </button>
        <button 
          className="card-action delete"
          onClick={() => onDelete(client)}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default ClientCard;