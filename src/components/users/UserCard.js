/**
 * Componente UserCard - Tarjeta para usuario
 */

import React from 'react';
import './UserCard.css';

const UserCard = ({ user, onEdit, onDelete, onToggleStatus }) => {
  const roleColors = {
    'Administrador': '#00A0DF',
    'Supervisor': '#5856D6',
    'Agente': '#34C759'
  };

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar-large" style={{ background: roleColors[user.role] }}>
          {user.avatar}
        </div>
        <div className="user-info">
          <h3>{user.name}</h3>
          <p className="user-email">{user.email}</p>
        </div>
        <span className={`user-status status-${user.status.toLowerCase()}`}>
          {user.status}
        </span>
      </div>

      <div className="user-card-body">
        <div className="user-detail">
          <span className="detail-label">Rol</span>
          <span className={`role-tag role-${user.role.toLowerCase()}`}>
            {user.role}
          </span>
        </div>
        <div className="user-detail">
          <span className="detail-label">Teléfono</span>
          <span className="detail-value">{user.phone}</span>
        </div>
        <div className="user-detail">
          <span className="detail-label">Último acceso</span>
          <span className="detail-value">{user.lastLogin}</span>
        </div>
      </div>

      <div className="user-card-footer">
        <button 
          className="card-action edit"
          onClick={() => onEdit(user)}
        >
          ✏️ Editar
        </button>
        <button 
          className={`card-action ${user.status === 'Activo' ? 'deactivate' : 'activate'}`}
          onClick={() => onToggleStatus(user)}
        >
          {user.status === 'Activo' ? '🔴 Desactivar' : '🟢 Activar'}
        </button>
        <button 
          className="card-action delete"
          onClick={() => onDelete(user)}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default UserCard;