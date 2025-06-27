import React from 'react';

function DashboardEmploye({ onLogout }) {
  return (
    <div>
      <h2>Bienvenue Employé 🛠️</h2>
      <p>Vous pouvez faire des demandes de congé.</p>
      <button onClick={onLogout}>Se déconnecter</button>
    </div>
  );
}

export default DashboardEmploye;
