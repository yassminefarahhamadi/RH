import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardRH({ onLogout }) {
  const [employes, setEmployes] = useState([]);
  const [bloc, setBloc] = useState('');
  const [poste, setPoste] = useState('');
  const [conges, setConges] = useState([]);

  useEffect(() => {
    fetchEmployes();
    fetchConges();
    // eslint-disable-next-line
  }, []);

  const fetchEmployes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/filter', {
        params: { bloc, poste },
      });
      setEmployes(res.data);
    } catch (err) {
      console.error('Erreur chargement employés', err);
      setEmployes([]);
    }
  };

  const fetchConges = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/conges');
      setConges(res.data);
    } catch (err) {
      console.error('Erreur chargement congés', err);
      setConges([]);
    }
  };

  const handleStatusChange = async (id, statut) => {
    try {
      await axios.put(`http://localhost:5000/api/conges/${id}/status`, { statut });
      fetchConges();
    } catch (err) {
      console.error('Erreur mise à jour statut congé', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
  };

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, rgb(216, 95, 95) 0%, #b71c1c 100%)', color: 'white', padding: '20px 0', marginBottom: '30px' }}>
        <div style={{ width: '95%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Bienvenue Admin RH 📚</h2>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '25px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        {/* Filtrage employés */}
        <section
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            marginBottom: '30px',
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

        {/* Liste des employés */}
        <section
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            marginBottom: '30px',
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
              {employes.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : (
                employes.map((e) => (
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
        </section>

        {/* Liste des demandes de congés */}
        <section
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          }}
        >
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
              {conges.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                    Aucune demande de congé
                  </td>
                </tr>
              ) : (
                conges.map((c) => (
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
        </section>
      </main>
    </div>
  );
}

export default DashboardRH;
