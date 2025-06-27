import React from 'react';

function DashboardRH({ onLogout }) {
  return (
    <div>
      <h2>Bienvenue Admin RH 👩‍💼</h2>
      <p>Consultez les statistiques, gérez les employés et les congés.</p>
      <button onClick={onLogout}>Se déconnecter</button>
    </div>
  );
}

export default DashboardRH;
