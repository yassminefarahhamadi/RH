import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardAdminEtudiant({ onLogout }) {
  const [demandes, setDemandes] = useState([]);
  const [dossiersPhysiques, setDossiersPhysiques] = useState([]);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [vue, setVue] = useState('demandes'); 
  const [pageDemandes, setPageDemandes] = useState(1);
  const [pageDossiers, setPageDossiers] = useState(1);
  const [selectedDossier, setSelectedDossier] = useState(null); 
  const itemsPerPage = 5;

  const fetchDemandes = async () => {
    try {
      setLoadingDemandes(true);
      const res = await axios.get('http://localhost:5000/api/documents');
      setDemandes(res.data);
      setPageDemandes(1);
      setError('');
    } catch (err) {
      console.error('Erreur chargement demandes', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoadingDemandes(false);
    }
  };

  const fetchDossiersPhysiques = async () => {
    try {
      setLoadingDossiers(true);
      const res = await axios.get('http://localhost:5000/api/documents/dossiers/physiques');
      setDossiersPhysiques(res.data);
      setPageDossiers(1);
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

  const handleDecision = async (id, statut) => {
    try {
      await axios.put(`http://localhost:5000/api/documents/${id}/statut`, { statut });
      setMessage(` Demande ${statut}`);
      setDemandes(oldDemandes =>
        oldDemandes.map(item => (item.id === id ? { ...item, statut } : item))
      );
      setDossiersPhysiques(oldDossiers =>
        oldDossiers.map(item => (item.id === id ? { ...item, statut } : item))
      );
    } catch (err) {
      console.error('Erreur mise à jour statut', err);
      setMessage(' Erreur lors de la mise à jour du statut');
    }
  };

  const handleAIDecision = async (id, statut) => {
    if (window.confirm(`Voulez-vous suivre la suggestion de l'IA et ${statut === 'validée' ? 'valider' : 'refuser'} ce dossier?`)) {
      await handleDecision(id, statut);
    }
  };

  const handleAIVerification = async (id) => {
    try {
      setMessage(' Vérification IA en cours...');
      const res = await axios.post(`http://localhost:5000/api/documents/${id}/verify-ai`);
      
      if (res.data.success) {
        setMessage(' Vérification IA terminée');
        // Recharger les données pour afficher les nouveaux résultats
        fetchDossiersPhysiques();
      } else {
        setMessage(' Erreur lors de la vérification IA');
      }
    } catch (err) {
      console.error('Erreur vérification IA', err);
      setMessage(' Erreur lors de la vérification IA');
    }
  };

  const formatDate = dateStr => dateStr?.split('T')[0] || '';

  const renderFiles = doc => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {doc.carte_identite && (
        <a
          href={`http://localhost:5000/uploads/${doc.carte_identite}`}
          target="_blank"
          rel="noreferrer"
          style={styles.fileLink}
        >
          Carte ID
        </a>
      )}
      {doc.diplome && (
        <a
          href={`http://localhost:5000/uploads/${doc.diplome}`}
          target="_blank"
          rel="noreferrer"
          style={styles.fileLink}
        >
          Diplôme
        </a>
      )}
      {doc.releve_notes && (
        <a
          href={`http://localhost:5000/uploads/${doc.releve_notes}`}
          target="_blank"
          rel="noreferrer"
          style={styles.fileLink}
        >
          Relevé
        </a>
      )}
      {doc.doc_sante && (
        <a
          href={`http://localhost:5000/uploads/${doc.doc_sante}`}
          target="_blank"
          rel="noreferrer"
          style={styles.fileLink}
        >
          Santé
        </a>
      )}
    </div>
  );

  // Fonction pour afficher les résultats de l'analyse IA
  const renderAIVerification = (doc) => {
    if (!doc.ai_verification) return null;
    
    try {
      const aiData = JSON.parse(doc.ai_verification);
      return (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Vérification IA:</h4>
          {Object.entries(aiData).map(([docType, result]) => (
            <div key={docType} style={{ 
              marginBottom: '8px', 
              padding: '5px', 
              backgroundColor: result.isValid ? '#e8f5e9' : '#ffebee',
              borderRadius: '3px'
            }}>
              <strong>{docType}:</strong> {result.isValid ? ' Valide' : ' Problèmes détectés'}
              {result.issues && result.issues.length > 0 && (
                <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                  {result.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
              {result.confidence > 0 && (
                <div>Confiance OCR: {result.confidence.toFixed(1)}%</div>
              )}
            </div>
          ))}
          <button 
            onClick={() => setSelectedDossier(doc)}
            style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              backgroundColor: '#2196f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Voir détails complets
          </button>
        </div>
      );
    } catch (e) {
      console.error('Erreur parsing AI verification', e);
      return null;
    }
  };

  // Fonction pour afficher les boutons d'action avec suggestion IA
  const renderAIActionButtons = (doc) => {
    if (doc.statut?.toLowerCase().trim() !== 'en_attente') return null;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {doc.ai_suggestion === 'suggestion_validation' && (
          <button
            onClick={() => handleAIDecision(doc.id, 'validée')}
            style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
             Valider (suggestion IA)
          </button>
        )}
        {doc.ai_suggestion === 'suggestion_rejet' && (
          <button
            onClick={() => handleAIDecision(doc.id, 'refusée')}
            style={{ 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
             Refuser (suggestion IA)
          </button>
        )}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => handleDecision(doc.id, 'validée')}
            style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Valider
          </button>
          <button
            onClick={() => handleDecision(doc.id, 'refusée')}
            style={{ 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Refuser
          </button>
        </div>
      </div>
    );
  };

  const renderStatut = statut => {
    if (!statut) return '';
    const s = statut.toLowerCase().trim();
    if (s === 'en_attente') return 'En attente';
    if (s === 'validée') return <span style={{ color: '#4caf50', fontWeight: '700' }}>Accepté</span>;
    if (s === 'refusée') return <span style={{ color: '#f44336', fontWeight: '700' }}>Refusé</span>;
    return statut;
  };

  // Pagination for demandes
  const indexLastDemande = pageDemandes * itemsPerPage;
  const indexFirstDemande = indexLastDemande - itemsPerPage;
  const currentDemandes = demandes.slice(indexFirstDemande, indexLastDemande);
  const totalPagesDemandes = Math.ceil(demandes.length / itemsPerPage);

  // Pagination for dossiers
  const indexLastDossier = pageDossiers * itemsPerPage;
  const indexFirstDossier = indexLastDossier - itemsPerPage;
  const currentDossiers = dossiersPhysiques.slice(indexFirstDossier, indexLastDossier);
  const totalPagesDossiers = Math.ceil(dossiersPhysiques.length / itemsPerPage);

  const prevPageDemande = () => setPageDemandes(p => Math.max(p - 1, 1));
  const nextPageDemande = () => setPageDemandes(p => Math.min(p + 1, totalPagesDemandes));
  const prevPageDossier = () => setPageDossiers(p => Math.max(p - 1, 1));
  const nextPageDossier = () => setPageDossiers(p => Math.min(p + 1, totalPagesDossiers));

  const buttonStyle = {
    padding: '6px 12px',
    backgroundColor: '#b71c1c',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background-color 0.3s',
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: '#ddd',
    color: '#999',
    cursor: 'not-allowed',
  };

  // Modale pour afficher les détails de l'analyse IA
  const AIDetailsModal = ({ dossier, onClose }) => {
    if (!dossier || !dossier.ai_verification) return null;
    
    const aiData = JSON.parse(dossier.ai_verification);
    
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3>Détails de l'analyse IA</h3>
            <button onClick={onClose} style={styles.closeButton}>×</button>
          </div>
          <div style={styles.modalBody}>
            <p><strong>Étudiant:</strong> {dossier.user_name}</p>
            <p><strong>Niveau d'étude:</strong> {dossier.niveau_etude}</p>
            <p><strong>Suggestion IA:</strong> 
              <span style={{ 
                color: dossier.ai_suggestion === 'suggestion_validation' ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {dossier.ai_suggestion === 'suggestion_validation' ? 'Validation recommandée' : 'Rejet recommandé'}
              </span>
            </p>
            
            <h4>Analyse détaillée par document:</h4>
            {Object.entries(aiData).map(([docType, result]) => (
              <div key={docType} style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: result.isValid ? '#e8f5e9' : '#ffebee',
                borderRadius: '5px'
              }}>
                <h5 style={{ margin: '0 0 10px 0' }}>{docType.toUpperCase()}</h5>
                <p><strong>Statut:</strong> {result.isValid ? ' Valide' : ' Invalide'}</p>
                {result.confidence > 0 && (
                  <p><strong>Confiance OCR:</strong> {result.confidence.toFixed(1)}%</p>
                )}
                {result.issues && result.issues.length > 0 && (
                  <div>
                    <strong>Problèmes détectés:</strong>
                    <ul>
                      {result.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.details && (
                  <div>
                    <strong>Détails techniques:</strong>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={styles.modalFooter}>
            <button onClick={onClose} style={styles.closeButton}>Fermer</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header identique à DashboardAdmin */}
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
          {/* Logo + Welcome message */}
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
                {localStorage.getItem("name") || "Admin Étudiant"}
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

      <div style={{ maxWidth: 1200, margin: '0 auto 20px', padding: '0 20px', display: 'flex', gap: 15 }}>
        <button
          onClick={() => setVue('demandes')}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: vue === 'demandes' ? '#b71c1c' : '#eee',
            color: vue === 'demandes' ? 'white' : '#444',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background-color 0.3s',
          }}
        >
          Liste des demandes d'attestations
        </button>
        <button
          onClick={() => setVue('dossiers')}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: vue === 'dossiers' ? '#b71c1c' : '#eee',
            color: vue === 'dossiers' ? 'white' : '#444',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background-color 0.3s',
          }}
        >
          Liste des dossiers physiques
        </button>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
        {message && (
          <div
            style={{
              padding: 15,
              borderRadius: 8,
              marginBottom: 30,
              textAlign: 'center',
              fontWeight: 500,
              backgroundColor: message.startsWith('✅') ? '#e8f5e9' : '#ffebee',
              color: message.startsWith('✅') ? '#2e7d32' : '#c62828',
              borderLeft: `4px solid ${message.startsWith('✅') ? '#4caf50' : '#f44336'}`,
            }}
          >
            {message}
          </div>
        )}
        {error && (
          <div
            style={{
              padding: 15,
              borderRadius: 8,
              marginBottom: 30,
              textAlign: 'center',
              fontWeight: 500,
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderLeft: '4px solid #f44336',
            }}
          >
            {error}
          </div>
        )}

        {vue === 'demandes' && (
          <section style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding: 20, marginBottom: 30 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}> Liste des demandes d'attestations</h3>
              <div
                style={{
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
                }}
              >
                {demandes.length}
              </div>
            </header>
            <div style={{ overflowX: 'auto' }}>
              {loadingDemandes ? (
                <p>Chargement...</p>
              ) : currentDemandes.length === 0 ? (
                <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Aucune demande d'attestation pour le moment.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Étudiant</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Date de demande</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Statut</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDemandes.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>
                          {d.user_name || 'N/A'}
                          <br />
                          <small style={{ color: '#666' }}>{d.user_email || ''}</small>
                        </td>
                        <td style={{ padding: 12 }}>{d.title}</td>
                        <td style={{ padding: 12 }}>{formatDate(d.date_demande)}</td>
                        <td style={{ padding: 12, textTransform: 'capitalize' }}>{renderStatut(d.statut)}</td>
                        <td style={{ padding: 12 }}>
                          {d.statut?.toLowerCase().trim() === 'en_attente' ? (
                            <>
                              <button
                                onClick={() => handleDecision(d.id, 'validée')}
                                style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => handleDecision(d.id, 'refusée')}
                                style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <em style={{ color: '#999', fontStyle: 'italic' }}>Action non disponible</em>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
              <button onClick={prevPageDemande} disabled={pageDemandes === 1} style={pageDemandes === 1 ? buttonDisabledStyle : buttonStyle}>
                Précédent
              </button>
              <span>
                Page {pageDemandes} / {totalPagesDemandes || 1}
              </span>
              <button onClick={nextPageDemande} disabled={pageDemandes === totalPagesDemandes || totalPagesDemandes === 0} style={pageDemandes === totalPagesDemandes || totalPagesDemandes === 0 ? buttonDisabledStyle : buttonStyle}>
                Suivant
              </button>
            </div>
          </section>
        )}

        {vue === 'dossiers' && (
          <section style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding: 20 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}> Liste des dossiers physiques</h3>
              <div
                style={{
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
                }}
              >
                {dossiersPhysiques.length}
              </div>
            </header>
            <div style={{ overflowX: 'auto' }}>
              {loadingDossiers ? (
                <p>Chargement...</p>
              ) : currentDossiers.length === 0 ? (
                <p style={{ fontStyle: 'italic', textAlign: 'center' }}>Aucun dossier physique pour le moment.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Étudiant</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Niveau d'étude</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Date de demande</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Statut</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Suggestion IA</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Fichiers</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Vérification IA</th>
                      <th style={{ padding: 12, borderBottom: '2px solid #ddd', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDossiers.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>
                          {d.user_name || 'N/A'}
                          <br />
                          <small style={{ color: '#666' }}>{d.user_email || ''}</small>
                        </td>
                        <td style={{ padding: 12 }}>{d.niveau_etude || '-'}</td>
                        <td style={{ padding: 12 }}>{formatDate(d.date_demande)}</td>
                        <td style={{ padding: 12, textTransform: 'capitalize' }}>{renderStatut(d.statut)}</td>
                        <td style={{ padding: 12 }}>
                          {d.ai_suggestion === 'suggestion_validation' && (
                            <span style={{ color: '#4caf50', fontWeight: 'bold' }}> Validation</span>
                          )}
                          {d.ai_suggestion === 'suggestion_rejet' && (
                            <span style={{ color: '#f44336', fontWeight: 'bold' }}> Rejet</span>
                          )}
                          {!d.ai_suggestion && (
                            <span style={{ color: '#999' }}>Non analysé</span>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>{renderFiles(d)}</td>
                        <td style={{ padding: 12 }}>
                          {renderAIVerification(d)}
                        </td>
                        <td style={{ padding: 12 }}>
                          {/* Bouton de vérification IA manuelle */}
                          <button
                            onClick={() => handleAIVerification(d.id)}
                            style={{ 
                              backgroundColor: '#2196f3', 
                              color: 'white', 
                              border: 'none', 
                              padding: '6px 12px', 
                              borderRadius: 6, 
                              cursor: 'pointer',
                              marginBottom: '5px',
                              fontSize: '12px'
                            }}
                          >
                             Vérifier avec IA
                          </button>
                          {renderAIActionButtons(d)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
              <button onClick={prevPageDossier} disabled={pageDossiers === 1} style={pageDossiers === 1 ? buttonDisabledStyle : buttonStyle}>
                Précédent
              </button>
              <span>
                Page {pageDossiers} / {totalPagesDossiers || 1}
              </span>
              <button onClick={nextPageDossier} disabled={pageDossiers === totalPagesDossiers || totalPagesDossiers === 0} style={pageDossiers === totalPagesDossiers || totalPagesDossiers === 0 ? buttonDisabledStyle : buttonStyle}>
                Suivant
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modale pour afficher les détails de l'analyse IA */}
      {selectedDossier && (
        <AIDetailsModal 
          dossier={selectedDossier} 
          onClose={() => setSelectedDossier(null)} 
        />
      )}
    </div>
  );
}

const styles = {
  fileLink: {
    textDecoration: 'none',
    color: '#1976d2',
    padding: '4px 8px',
    border: '1px solid #1976d2',
    borderRadius: 4,
    fontSize: 14,
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'auto',
    width: '600px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  modalBody: {
    marginBottom: '15px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default DashboardAdminEtudiant;