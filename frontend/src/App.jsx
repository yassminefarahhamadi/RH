import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login';
import Signup from './Signup';

import DashboardAdmin from './dashboards/DashboardAdmin';
import DashboardEmploye from './dashboards/DashboardEmploye';
import DashboardEtudiant from './dashboards/DashboardEtudiant';
import DashboardRH from './dashboards/DashboardRH';
import DashboardEtudes from './dashboards/DashboardEtudes';

import AjouterUtilisateur from './pages/AjouterUtilisateur';
import ModifierUtilisateur from './pages/ModifierUtilisateur';
import DetailsUtilisateur from './pages/DetailsUtilisateur';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [showSignup, setShowSignup] = useState(false);

  const logout = () => {
    localStorage.clear();
    setRole(null);
    setShowSignup(false);
  };

  return (
    <Router>
      {!role ? (
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
      ) : (
        <Routes>
          {/* 🎯 DASHBOARDS */}
          {role === 'admin' && <Route path="/" element={<DashboardAdmin onLogout={logout} />} />}
          {role === 'employe' && <Route path="/" element={<DashboardEmploye onLogout={logout} />} />}
          {role === 'etudiant' && <Route path="/" element={<DashboardEtudiant onLogout={logout} />} />}
          {role === 'admin_rh' && <Route path="/" element={<DashboardRH onLogout={logout} />} />}
          {role === 'admin_etudes' && <Route path="/" element={<DashboardEtudes onLogout={logout} />} />}
          
          {/* 🧑‍💼 UTILISATEURS (seulement accessibles à l’admin) */}
          {role === 'admin' && (
            <>
              <Route path="/utilisateurs" element={<DashboardAdmin onLogout={logout} />} />
              <Route path="/ajouter-utilisateur" element={<AjouterUtilisateur />} />
              <Route path="/modifier-utilisateur/:id" element={<ModifierUtilisateur />} />
              <Route path="/details-utilisateur/:id" element={<DetailsUtilisateur />} />
            </>
          )}

          {/* 🚫 Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
