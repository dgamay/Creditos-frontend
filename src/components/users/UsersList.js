/**
 * Componente UsersList - Gestión de usuarios del sistema
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal/Modal';
import Alert from '../common/Alert/Alert';
import UserForm from './UserForm';
import UserCard from './UserCard';
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Datos de ejemplo
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: 'Admin Principal',
        email: 'admin@nequi.com',
        role: 'Administrador',
        status: 'Activo',
        lastLogin: '2024-03-15 14:30',
        phone: '300 111 2233',
        avatar: 'AP'
      },
      {
        id: 2,
        name: 'Carlos López',
        email: 'carlos.lopez@nequi.com',
        role: 'Supervisor',
        status: 'Activo',
        lastLogin: '2024-03-14 09:15',
        phone: '301 222 3344',
        avatar: 'CL'
      },
      {
        id: 3,
        name: 'Ana María Pérez',
        email: 'ana.perez@nequi.com',
        role: 'Agente',
        status: 'Activo',
        lastLogin: '2024-03-15 10:45',
        phone: '302 333 4455',
        avatar: 'AP'
      },
      {
        id: 4,
        name: 'Juan David García',
        email: 'juan.garcia@nequi.com',
        role: 'Agente',
        status: 'Inactivo',
        lastLogin: '2024-03-10 16:20',
        phone: '303 444 5566',
        avatar: 'JG'
      },
      {
        id: 5,
        name: 'Laura Martínez',
        email: 'laura.martinez@nequi.com',
        role: 'Supervisor',
        status: 'Activo',
        lastLogin: '2024-03-15 08:00',
        phone: '304 555 6677',
        avatar: 'LM'
      },
      {
        id: 6,
        name: 'Pedro Sánchez',
        email: 'pedro.sanchez@nequi.com',
        role: 'Agente',
        status: 'Pendiente',
        lastLogin: '2024-03-13 11:30',
        phone: '305 666 7788',
        avatar: 'PS'
      }
    ];
    setUsers(mockUsers);//Guarda la lista de usuarios en el estado principal del componente.
    setFilteredUsers(mockUsers);//segunda lista de usuarios, utili para realizar búsquedas o filtros sin perder la lista original.
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = users;

    // Filtro por rol
    if (roleFilter !== 'todos') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showAlert('success', 'Usuario eliminado exitosamente');
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    showAlert('success', `Usuario ${newStatus === 'Activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  const handleSave = (userData) => {
    if (modalMode === 'create') {
      const newUser = {
        ...userData,
        id: users.length + 1,
        lastLogin: 'Nunca',
        avatar: userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      };
      setUsers(prev => [...prev, newUser]);
      showAlert('success', 'Usuario creado exitosamente');
    } else {
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, ...userData } : u
      ));
      showAlert('success', 'Usuario actualizado exitosamente');
    }
    setModalOpen(false);
  };

  const getRoleCount = (role) => users.filter(u => u.role === role).length;

  return (
    <div className="users-container">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Estadísticas */}
      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Usuarios</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getRoleCount('Administrador')}</span>
          <span className="stat-label">Administradores</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getRoleCount('Supervisor')}</span>
          <span className="stat-label">Supervisores</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getRoleCount('Agente')}</span>
          <span className="stat-label">Agentes</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{users.filter(u => u.status === 'Activo').length}</span>
          <span className="stat-label">Activos</span>
        </div>
      </div>

      {/* Header */}
      <div className="users-header">
        <h2>Usuarios del Sistema</h2>
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="filters">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los roles</option>
              <option value="Administrador">Administradores</option>
              <option value="Supervisor">Supervisores</option>
              <option value="Agente">Agentes</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
              <option value="Pendiente">Pendientes</option>
            </select>
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
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Contenido */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👤</span>
          <h3>No hay usuarios</h3>
          <p>Comienza creando el primer usuario</p>
          <button className="btn-create" onClick={handleCreate}>
            Crear Usuario
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Último acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="user-cell">
                    <span className="user-avatar-small">{user.avatar}</span>
                    {user.name}
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="table-action edit"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="table-action toggle"
                      onClick={() => handleToggleStatus(user)}
                      title={user.status === 'Activo' ? 'Desactivar' : 'Activar'}
                    >
                      {user.status === 'Activo' ? '🔴' : '🟢'}
                    </button>
                    <button 
                      className="table-action delete"
                      onClick={() => handleDelete(user)}
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
        size="large"
      >
        <UserForm
          user={selectedUser}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default UsersList;