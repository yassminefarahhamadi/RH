import React from 'react';
import UserList from '../components/UserList';

function DashboardAdmin({ onLogout }) {
  return (
    <div>
      <h1>Dashboard Admin</h1>
      <button onClick={onLogout}>Déconnexion</button>
      <UserList />
    </div>
  );
}

export default DashboardAdmin;
