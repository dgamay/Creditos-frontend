import React from 'react';
import './CollectorCard.css';

const CollectorCard = ({ collector, onEdit, onDelete }) => {
  if (!collector) return null;

  // Obtener iniciales para el avatar
  const getInitials = (nombre) => {
    if (!nombre) return '?';
    return nombre.split(' ')
      .map(p => p.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="collector-card">
      <div className="collector-card-header">
        <div className="collector-avatar">
          {getInitials(collector.nombre)}
        </div>
        <div className="collector-info">
          <h3>{collector.nombre || 'Sin nombre'}</h3>
          <p className="collector-id">ID: {collector._id?.slice(-6) || 'N/A'}</p>
        </div>
      </div>

      <div className="collector-card-body">
        <div className="collector-detail">
          <span className="detail-label">📞 Celular</span>
          <span className="detail-value">{collector.celular || 'No registrado'}</span>
        </div>
        <div className="collector-detail">
          <span className="detail-label">🆔 Cédula</span>
          <span className="detail-value">{collector.cedula || 'No registrada'}</span>
        </div>
        <div className="collector-detail">
          <span className="detail-label">📍 Dirección</span>
          <span className="detail-value">{collector.direccion || 'No registrada'}</span>
        </div>
      </div>

      <div className="collector-card-footer">
        <button 
          className="card-action edit"
          onClick={() => onEdit(collector)}
          title="Editar cobrador"
        >
          ✏️ Editar
        </button>
        <button 
          className="card-action delete"
          onClick={() => onDelete(collector)}
          title="Eliminar cobrador"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default CollectorCard;