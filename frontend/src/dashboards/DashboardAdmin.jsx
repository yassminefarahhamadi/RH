import React from 'react';

function DashboardAdmin({ onLogout }) {
  return (
    <div>
      <h2>Bienvenue Admin 👑</h2>
      <p>Gérez les rôles, accès et les utilisateurs.</p>
      <button onClick={onLogout}>Se déconnecter</button>
    </div>
  );
}

export default DashboardAdmin;
