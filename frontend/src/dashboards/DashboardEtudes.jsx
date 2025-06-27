import React from 'react';

function DashboardEtudiant({ onLogout }) {
  return (
    <div>
      <h2>Bienvenue Étudiant 🎓</h2>
      <p>Faites vos demandes d’attestations ici.</p>
      <button onClick={onLogout}>Se déconnecter</button>
    </div>
  );
}

export default DashboardEtudiant;
