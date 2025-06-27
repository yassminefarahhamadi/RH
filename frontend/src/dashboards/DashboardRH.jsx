import React from 'react';

function DashboardEtudes({ onLogout }) {
  return (
    <div>
      <h2>Bienvenue Admin Études 📚</h2>
      <p>Gérez les dossiers étudiants et les attestations.</p>
      <button onClick={onLogout}>Se déconnecter</button>
    </div>
  );
}

export default DashboardEtudes;
