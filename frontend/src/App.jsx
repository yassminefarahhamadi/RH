import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

import DashboardAdmin from './dashboards/DashboardAdmin';
import DashboardEmploye from './dashboards/DashboardEmploye';
import DashboardEtudiant from './dashboards/DashboardEtudiant';
import DashboardRH from './dashboards/DashboardRH';
import DashboardEtudes from './dashboards/DashboardEtudes';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [showSignup, setShowSignup] = useState(false); // 🔁 basculer entre Login et Signup

  const logout = () => {
    localStorage.clear();
    setRole(null);
    setShowSignup(false);
  };

  if (!role) {
    return (
      <div style={{ textAlign: 'center' }}>
        {showSignup ? (
          <>
            <Signup />
            <p>Déjà un compte ? <button onClick={() => setShowSignup(false)}>Se connecter</button></p>
          </>
        ) : (
          <>
            <Login onLoginSuccess={setRole} />
            <p>Pas de compte ? <button onClick={() => setShowSignup(true)}>S'inscrire</button></p>
          </>
        )}
      </div>
    );
  }

  // 🎯 Afficher le dashboard selon le rôle
  switch (role) {
    case 'admin':
      return <DashboardAdmin onLogout={logout} />;
    case 'employe':
      return <DashboardEmploye onLogout={logout} />;
    case 'etudiant':
      return <DashboardEtudiant onLogout={logout} />;
    case 'admin_rh':
      return <DashboardRH onLogout={logout} />;
    case 'admin_etudes':
      return <DashboardEtudes onLogout={logout} />;
    default:
      return <div>Rôle non reconnu</div>;
  }
}

export default App;
