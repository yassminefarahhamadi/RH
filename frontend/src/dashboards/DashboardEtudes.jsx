import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardAdminEtudiant({ onLogout }) {
  const [demandes, setDemandes] = useState([]);
  const [dossiersPhysiques, setDossiersPhysiques] = useState([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Charger les demandes simples (hors dossiers physiques)
  const fetchDemandes = async () => {
    try {
      setLoadingDemandes(true);
      const res = await axios.get('http://localhost:5000/api/documents');
      setDemandes(res.data);
      setError('');
    } catch (err) {
      console.error('Erreur chargement demandes', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoadingDemandes(false);
    }
  };

  // Charger les dossiers physiques
  const fetchDossiersPhysiques = async () => {
    try {
      setLoadingDossiers(true);
      const res = await axios.get('http://localhost:5000/api/documents/dossiers/physiques');
      setDossiersPhysiques(res.data);
      setError('');
    } catch (err) {
      console.error('Erreur chargement dossiers physiques', err);
      setError('Erreur lors du chargement des dossiers physiques');
    } finally {
      setLoadingDossiers(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
    fetchDossiersPhysiques();
  }, []);

  // Mettre à jour le statut (valider/refuser) pour demandes simples et dossiers physiques
  const handleDecision = async (id, statut) => {
    try {
      await axios.put(`http://localhost:5000/api/documents/${id}/statut`, { statut });
      setMessage(`✅ Demande ${statut}`);
      fetchDemandes();
      fetchDossiersPhysiques();
    } catch (err) {
      console.error('Erreur mise à jour statut', err);
      setMessage('❌ Erreur lors de la mise à jour du statut');
    }
  };

  const formatDate = (dateStr) => dateStr?.split('T')[0] || '';

  // Affichage des fichiers du dossier physique
  const renderFiles = (doc) => (
    <div style={styles.fileLinksContainer}>
      {doc.carte_identite && <a href={`http://localhost:5000/uploads/${doc.carte_identite}`} target="_blank" rel="noreferrer" style={styles.fileLink}>Carte ID</a>}
      {doc.diplome && <a href={`http://localhost:5000/uploads/${doc.diplome}`} target="_blank" rel="noreferrer" style={styles.fileLink}>Diplôme</a>}
      {doc.releve_notes && <a href={`http://localhost:5000/uploads/${doc.releve_notes}`} target="_blank" rel="noreferrer" style={styles.fileLink}>Relevé</a>}
      {doc.doc_sante && <a href={`http://localhost:5000/uploads/${doc.doc_sante}`} target="_blank" rel="noreferrer" style={styles.fileLink}>Santé</a>}
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoAndWelcome}>
            <img src="/logo.png" alt="Logo" style={styles.logo} />
            <h2 style={styles.welcomeTitle}>Bienvenue ADMIN Étudiant 🎓</h2>
          </div>
          <button style={styles.logoutButton} onClick={onLogout}>Se déconnecter</button>
        </div>
      </header>

      <main style={styles.content}>
        {message && (
          <div style={{
            ...styles.message,
            ...(message.startsWith('✅') ? styles.successMessage :
              message.startsWith('⚠️') ? styles.warningMessage : styles.errorMessage)
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ ...styles.message, ...styles.errorMessage }}>
            {error}
          </div>
        )}

        {/* Liste des demandes simples */}
        <section style={styles.card}>
          <header style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>📄 Liste des demandes d’attestations</h3>
            <div style={styles.cardCount}>{demandes.length}</div>
          </header>

          <div style={{ ...styles.cardBody, overflowX: 'auto' }}>
            {loadingDemandes ? (
              <p>Chargement...</p>
            ) : demandes.length === 0 ? (
              <p style={styles.emptyMessage}>Aucune demande d’attestation pour le moment.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Étudiant</th>
                    <th style={styles.tableHeader}>Titre</th>
                    <th style={styles.tableHeader}>Date de demande</th>
                    <th style={styles.tableHeader}>Statut</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((d) => (
                    <tr key={d.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {d.user_name || 'N/A'}<br />
                        <small style={styles.userEmail}>{d.user_email || ''}</small>
                      </td>
                      <td style={styles.tableCell}>{d.title}</td>
                      <td style={styles.tableCell}>{formatDate(d.date_demande)}</td>
                      <td style={{ ...styles.tableCell, textTransform: 'capitalize' }}>{d.statut}</td>
                      <td style={styles.tableCell}>
                        {d.statut === 'en_attente' ? (
                          <>
                            <button
                              onClick={() => handleDecision(d.id, 'approuvé')}
                              style={{ ...styles.actionButton, ...styles.approveButton }}
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleDecision(d.id, 'refusé')}
                              style={{ ...styles.actionButton, ...styles.rejectButton }}
                            >
                              Refuser
                            </button>
                          </>
                        ) : (
                          <em style={styles.actionDisabled}>Action non disponible</em>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Liste des dossiers physiques */}
        <section style={{ ...styles.card, marginTop: 40 }}>
          <header style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>📁 Liste des dossiers physiques</h3>
            <div style={styles.cardCount}>{dossiersPhysiques.length}</div>
          </header>

          <div style={{ ...styles.cardBody, overflowX: 'auto' }}>
            {loadingDossiers ? (
              <p>Chargement...</p>
            ) : dossiersPhysiques.length === 0 ? (
              <p style={styles.emptyMessage}>Aucun dossier physique pour le moment.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Étudiant</th>
                    <th style={styles.tableHeader}>Niveau d'étude</th>
                    <th style={styles.tableHeader}>Date de demande</th>
                    <th style={styles.tableHeader}>Statut</th>
                    <th style={styles.tableHeader}>Fichiers</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dossiersPhysiques.map((d) => (
                    <tr key={d.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {d.user_name || 'N/A'}<br />
                        <small style={styles.userEmail}>{d.user_email || ''}</small>
                      </td>
                      <td style={styles.tableCell}>{d.niveau_etude || '-'}</td>
                      <td style={styles.tableCell}>{formatDate(d.date_demande)}</td>
                      <td style={{ ...styles.tableCell, textTransform: 'capitalize' }}>{d.statut}</td>
                      <td style={styles.tableCell}>{renderFiles(d)}</td>
                      <td style={styles.tableCell}>
                        {d.statut === 'en_attente' ? (
                          <>
                            <button
                              onClick={() => handleDecision(d.id, 'approuvé')}
                              style={{ ...styles.actionButton, ...styles.approveButton }}
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => handleDecision(d.id, 'refusé')}
                              style={{ ...styles.actionButton, ...styles.rejectButton }}
                            >
                              Refuser
                            </button>
                          </>
                        ) : (
                          <em style={styles.actionDisabled}>Action non disponible</em>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg,rgb(216, 95, 95) 0%, #b71c1c 100%)',
    color: 'white',
    padding: '20px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: 30,
  },
  headerContent: {
    width: '95%',
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoAndWelcome: {
    display: 'flex',
    alignItems: 'center',
    gap: 15,
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
    borderRadius: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 300,
    margin: 0,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    borderRadius: 25,
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background-color 0.3s, color 0.3s',
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px 40px',
  },
  message: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 500,
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderLeft: '4px solid #4caf50',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderLeft: '4px solid #f44336',
  },
  warningMessage: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
    borderLeft: '4px solid #ff9800',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    padding: 20,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  cardCount: {
    backgroundColor: '#e0e0e0',
    color: '#616161',
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#f9f9f9',
  },
  tableHeader: {
    padding: 12,
    borderBottom: '2px solid #ddd',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 14,
    color: '#555',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
  },
  tableCell: {
    padding: 12,
    verticalAlign: 'middle',
    fontSize: 14,
    color: '#333',
  },
  userEmail: {
    color: '#666',
    fontSize: 12,
  },
  actionButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    marginRight: 8,
    transition: 'background-color 0.3s',
  },
  approveButton: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  actionDisabled: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 13,
  },
  fileLinksContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  fileLink: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    color: '#b71c1c',
    textDecoration: 'none',
    fontSize: 12,
  },
};

export default DashboardAdminEtudiant;
