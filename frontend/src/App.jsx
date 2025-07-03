import React, { useState, useEffect } from 'react';
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

const containerStyle = {
  textAlign: 'center',
  marginTop: '80px',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const toggleButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#d32f2f',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '600',
  marginLeft: '6px',
  padding: 0,
};

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [showSignup, setShowSignup] = useState(false);

  // Sync role state if localStorage changes (e.g. on refresh)
  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, []);

  const logout = () => {
    localStorage.clear();
    setRole(null);
    setShowSignup(false);
  };

  return (
    <Router>
      {!role ? (
        <div style={containerStyle}>
          {showSignup ? (
            <>
              <Signup />
              <p style={{ marginTop: '20px', fontSize: '1rem', color: '#555' }}>
                Déjà un compte ?
                <button
                  style={toggleButtonStyle}
                  onClick={() => setShowSignup(false)}
                  aria-label="Basculer vers la connexion"
                >
                  Se connecter
                </button>
              </p>
            </>
          ) : (
            <>
              <Login onLoginSuccess={setRole} />
              <p style={{ marginTop: '20px', fontSize: '1rem', color: '#555' }}>
                Pas de compte ?
                <button
                  style={toggleButtonStyle}
                  onClick={() => setShowSignup(true)}
                  aria-label="Basculer vers l'inscription"
                >
                  S'inscrire
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        <Routes>
          {/* DASHBOARDS */}
          {role === 'admin' && <Route path="/" element={<DashboardAdmin onLogout={logout} />} />}
          {role === 'employe' && <Route path="/" element={<DashboardEmploye onLogout={logout} />} />}
          {role === 'etudiant' && <Route path="/" element={<DashboardEtudiant onLogout={logout} />} />}
          {role === 'admin_rh' && <Route path="/" element={<DashboardRH onLogout={logout} />} />}
          {role === 'admin_etudes' && <Route path="/" element={<DashboardEtudes onLogout={logout} />} />}

          {/* ADMIN - gestion utilisateurs */}
          {role === 'admin' && (
            <>
              <Route path="/utilisateurs" element={<DashboardAdmin onLogout={logout} />} />
              <Route path="/ajouter-utilisateur" element={<AjouterUtilisateur />} />
              <Route path="/modifier-utilisateur/:id" element={<ModifierUtilisateur />} />
              <Route path="/details-utilisateur/:id" element={<DetailsUtilisateur />} />
            </>
          )}

          {/* Catch-all redirection */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
