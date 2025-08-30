import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardRH({ onLogout }) {
  const [employes, setEmployes] = useState([]);
  const [bloc, setBloc] = useState('');
  const [poste, setPoste] = useState('');
  const [conges, setConges] = useState([]);
  const [vue, setVue] = useState('conges'); // 'conges' ou 'employes'

  // États pour la pagination
  const [pageEmp, setPageEmp] = useState(1);
  const [pageConges, setPageConges] = useState(1);
  const itemsPerPage = 5; // éléments par page

  useEffect(() => {
    fetchEmployes();
    fetchConges();
    // eslint-disable-next-line
  }, []);

  // Charger employés avec filtres
  const fetchEmployes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/filter', {
        params: { bloc, poste },
      });
      setEmployes(res.data);
      setPageEmp(1); // reset page au changement de filtre
    } catch (err) {
      console.error('Erreur chargement employés', err);
      setEmployes([]);
    }
  };

  // Charger demandes congés
  const fetchConges = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/conges');
      setConges(res.data);
      setPageConges(1);
    } catch (err) {
      console.error('Erreur chargement congés', err);
      setConges([]);
    }
  };

  // Modifier statut congé
  const handleStatusChange = async (id, statut) => {
    try {
      await axios.put(`http://localhost:5000/api/conges/${id}/status`, { statut });
      fetchConges();
    } catch (err) {
      console.error('Erreur mise à jour statut congé', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // Format date ISO simple
  const formatDate = (isoDate) => (isoDate ? isoDate.split('T')[0] : '');

  // Couleurs selon statut congé
  const getStatusStyle = (statut) => {
    const base = {
      padding: '6px 12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'capitalize',
      display: 'inline-block',
    };
    switch (statut) {
      case 'accepte':
        return { ...base, backgroundColor: '#e8f5e9', color: '#2e7d32' };
      case 'refuse':
        return { ...base, backgroundColor: '#ffebee', color: '#c62828' };
      default:
        return { ...base, backgroundColor: '#fff3e0', color: '#ef6c00' };
    }
  };

  // Pagination employés
  const indexLastEmp = pageEmp * itemsPerPage;
  const indexFirstEmp = indexLastEmp - itemsPerPage;
  const currentEmployes = employes.slice(indexFirstEmp, indexLastEmp);
  const totalPagesEmp = Math.ceil(employes.length / itemsPerPage);

  // Pagination congés
  const indexLastConges = pageConges * itemsPerPage;
  const indexFirstConges = indexLastConges - itemsPerPage;
  const currentConges = conges.slice(indexFirstConges, indexLastConges);
  const totalPagesConges = Math.ceil(conges.length / itemsPerPage);

  // Navigation pages employés
  const prevPageEmp = () => setPageEmp((p) => Math.max(p - 1, 1));
  const nextPageEmp = () => setPageEmp((p) => Math.min(p + 1, totalPagesEmp));

  // Navigation pages congés
  const prevPageConges = () => setPageConges((p) => Math.max(p - 1, 1));
  const nextPageConges = () => setPageConges((p) => Math.min(p + 1, totalPagesConges));

  // Styles pagination
  const paginationStyle = {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
  };
  const buttonStyle = {
    padding: '6px 12px',
    backgroundColor: '#b71c1c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  };
  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: '#ddd',
    color: '#999',
    cursor: 'not-allowed',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      {/* Header avec le style de DashboardAdmin */}
      <header
        style={{
          background: "linear-gradient(135deg, rgb(216, 95, 95) 0%, #b71c1c 100%)",
          color: "white",
          padding: "20px 0",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "95%",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo + Bonjour, name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: "150px",
                height: "60px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
            <h2 style={{ margin: 0 }}>
              Bonjour,{" "}
              <span style={{ fontWeight: "600" }}>
                {localStorage.getItem("name") || "Admin RH"}
              </span>
            </h2>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid white",
              borderRadius: "25px",
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background-color 0.3s, color 0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#b71c1c";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "white";
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Boutons de sélection */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px', padding: '0 20px', display: 'flex', gap: '15px' }}>
        <button
          onClick={() => setVue('conges')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: vue === 'conges' ? '#b71c1c' : '#eee',
            color: vue === 'conges' ? 'white' : '#444',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s',
          }}
        >
          Liste des congés
        </button>
        <button
          onClick={() => setVue('employes')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: vue === 'employes' ? '#b71c1c' : '#eee',
            color: vue === 'employes' ? 'white' : '#444',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s',
          }}
        >
          Liste des employés
        </button>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        {/* Liste employés */}
        {vue === 'employes' && (
          <>
            <section
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap',
              }}
            >
              <h3 style={{ flexBasis: '100%', marginBottom: '10px' }}>🔍 Filtrer les employés</h3>
              <label style={{ flex: '1 1 150px' }}>
                Bloc :
                <input
                  type="text"
                  value={bloc}
                  onChange={(e) => setBloc(e.target.value)}
                  placeholder="ex: A"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '5px' }}
                />
              </label>
              <label style={{ flex: '1 1 150px' }}>
                Poste :
                <input
                  type="text"
                  value={poste}
                  onChange={(e) => setPoste(e.target.value)}
                  placeholder="ex: surveillant"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '5px' }}
                />
              </label>
              <button
                onClick={fetchEmployes}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#b71c1c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  alignSelf: 'flex-end',
                }}
              >
                Rechercher
              </button>
            </section>

            <section
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                marginBottom: '15px',
              }}
            >
              <h3>👥 Liste des employés</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Nom</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Poste</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Bloc</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployes.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                        Aucun employé trouvé
                      </td>
                    </tr>
                  ) : (
                    currentEmployes.map((e) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{e.name}</td>
                        <td style={{ padding: '12px' }}>{e.email}</td>
                        <td style={{ padding: '12px' }}>{e.type_poste}</td>
                        <td style={{ padding: '12px' }}>{e.blocAffecte}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination employés */}
              <div style={paginationStyle}>
                <button onClick={prevPageEmp} disabled={pageEmp === 1} style={pageEmp === 1 ? buttonDisabledStyle : buttonStyle}>
                  Précédent
                </button>
                <span>
                  Page {pageEmp} / {totalPagesEmp || 1}
                </span>
                <button onClick={nextPageEmp} disabled={pageEmp === totalPagesEmp || totalPagesEmp === 0} style={pageEmp === totalPagesEmp || totalPagesEmp === 0 ? buttonDisabledStyle : buttonStyle}>
                  Suivant
                </button>
              </div>
            </section>
          </>
        )}

        {/* Liste congés */}
        {vue === 'conges' && (
          <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <h3>📅 Liste des demandes de congés</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Employé</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Date début</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Date fin</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Motif</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Statut</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentConges.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                      Aucune demande de congé
                    </td>
                  </tr>
                ) : (
                  currentConges.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        {c.employe_nom} <br />
                        <small style={{ color: '#666' }}>{c.employe_email}</small>
                      </td>
                      <td style={{ padding: '12px' }}>{formatDate(c.date_debut)}</td>
                      <td style={{ padding: '12px' }}>{formatDate(c.date_fin)}</td>
                      <td style={{ padding: '12px' }}>{c.motif || '-'}</td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                        <span style={getStatusStyle(c.statut)}>{c.statut}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {c.statut === 'en_attente' ? (
                          <>
                            <button
                              onClick={() => handleStatusChange(c.id, 'accepte')}
                              style={{
                                marginRight: 8,
                                padding: '6px 12px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => handleStatusChange(c.id, 'refuse')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              Refuser
                            </button>
                          </>
                        ) : (
                          <em style={{ color: '#999' }}>Action non disponible</em>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination congés */}
            <div style={paginationStyle}>
              <button onClick={prevPageConges} disabled={pageConges === 1} style={pageConges === 1 ? buttonDisabledStyle : buttonStyle}>
                Précédent
              </button>
              <span>
                Page {pageConges} / {totalPagesConges || 1}
              </span>
              <button onClick={nextPageConges} disabled={pageConges === totalPagesConges || totalPagesConges === 0} style={pageConges === totalPagesConges || totalPagesConges === 0 ? buttonDisabledStyle : buttonStyle}>
                Suivant
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardRH;