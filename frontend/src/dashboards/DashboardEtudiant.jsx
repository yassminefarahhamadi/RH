import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DashboardEtudiant = ({ onLogout }) => {
  const id = localStorage.getItem('id');
  const name = localStorage.getItem('name');
  const [demandes, setDemandes] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [niveauEtude, setNiveauEtude] = useState('baccalaureat');
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentDossierId, setCurrentDossierId] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${id}`);
      setDemandes(res.data.filter(doc => doc.title !== 'Dossier physique'));
      setDossiers(res.data.filter(doc => doc.title === 'Dossier physique'));
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur de récupération');
    }
  }, [id]);

  useEffect(() => {
    if (!id || id === 'null') {
      alert("Identifiant manquant");
      onLogout();
    } else {
      fetchDocuments();
    }
  }, [id, onLogout, fetchDocuments]);

  const handleSimpleSubmit = async (e) => {
    e.preventDefault();
    
    if (demandes.some(d => d.title === newTitle)) {
      setMessage('⚠️ Vous avez déjà fait cette demande');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/documents/demande', {
        user_id: parseInt(id),
        title: newTitle,
      });
      setMessage('✅ Demande envoyée');
      setNewTitle('');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur lors de la demande');
    }
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleDossierSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', id);
    formData.append('niveau_etude', niveauEtude);
    formData.append('title', 'Dossier physique');

    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      if (editMode && currentDossierId) {
        await axios.put(`http://localhost:5000/api/documents/${currentDossierId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('✅ Dossier mis à jour');
      } else {
        await axios.post('http://localhost:5000/api/documents/dossier', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage('✅ Dossier envoyé');
      }
      
      setFiles({});
      setEditMode(false);
      setCurrentDossierId(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur lors de l\'envoi');
    }
  };

  const handleEditDossier = (dossier) => {
    setEditMode(true);
    setCurrentDossierId(dossier.id);
    setNiveauEtude(dossier.niveau_etude || 'baccalaureat');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setHours(date.getHours() + 1);
    return date.toISOString().split('T')[0];
  };

  const renderFileLinks = (doc) => (
    <div style={styles.documentFiles}>
      {doc.carte_identite && (
        <a href={`http://localhost:5000/uploads/${doc.carte_identite}`} 
           target="_blank" 
           rel="noreferrer"
           style={styles.fileLink}>
          🆔 Carte ID
        </a>
      )}
      {doc.diplome && (
        <a href={`http://localhost:5000/uploads/${doc.diplome}`} 
           target="_blank" 
           rel="noreferrer"
           style={styles.fileLink}>
          🎓 Diplôme
        </a>
      )}
      {doc.releve_notes && (
        <a href={`http://localhost:5000/uploads/${doc.releve_notes}`} 
           target="_blank" 
           rel="noreferrer"
           style={styles.fileLink}>
          📊 Relevé
        </a>
      )}
      {doc.doc_sante && (
        <a href={`http://localhost:5000/uploads/${doc.doc_sante}`} 
           target="_blank" 
           rel="noreferrer"
           style={styles.fileLink}>
          🏥 Santé
        </a>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.welcomeTitle}>Bonjour, <span style={styles.nameHighlight}>{name}</span></h2>
          <button style={styles.logoutButton} onClick={onLogout}>
            <span style={styles.logoutIcon}>🚪</span> Déconnexion
          </button>
        </div>
        <div style={styles.headerWave}></div>
      </div>

      <div style={styles.content}>
        {message && (
          <div style={{
            ...styles.message,
            ...(message.startsWith('✅') ? styles.successMessage : 
                message.startsWith('⚠️') ? styles.warningMessage : styles.errorMessage)
          }}>
            {message}
          </div>
        )}

        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📋 Vos Demandes Simples</h3>
              <div style={styles.cardCount}>{demandes.length}</div>
            </div>
            <div style={styles.cardBody}>
              {demandes.length === 0 ? (
                <p style={styles.emptyMessage}>Aucune demande simple</p>
              ) : (
                <ul style={styles.documentList}>
                  {demandes.map((doc) => (
                    <li key={doc.id} style={styles.documentItem}>
                      <div style={styles.documentHeader}>
                        <span style={styles.documentTitle}>{doc.title}</span>
                        <span style={{
                          ...styles.documentStatus,
                          ...(doc.statut === 'en_attente' ? styles.statusPending : {}),
                          ...(doc.statut === 'approuvé' ? styles.statusApproved : {})
                        }}>
                          {doc.statut}
                        </span>
                      </div>
                      <div style={styles.documentMeta}>
                        <span style={styles.documentDate}>{formatDate(doc.date_demande)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📁 Vos Dossiers Physiques</h3>
              <div style={styles.cardCount}>{dossiers.length}</div>
            </div>
            <div style={styles.cardBody}>
              {dossiers.length === 0 ? (
                <p style={styles.emptyMessage}>Aucun dossier physique</p>
              ) : (
                <ul style={styles.documentList}>
                  {dossiers.map((doc) => (
                    <li key={doc.id} style={styles.documentItem}>
                      <div style={styles.documentHeader}>
                        <span style={styles.documentTitle}>{doc.title} ({doc.niveau_etude})</span>
                        <div>
                          <span style={{
                            ...styles.documentStatus,
                            ...(doc.statut === 'en_attente' ? styles.statusPending : {}),
                            ...(doc.statut === 'approuvé' ? styles.statusApproved : {})
                          }}>
                            {doc.statut}
                          </span>
                          <button 
                            onClick={() => handleEditDossier(doc)}
                            style={styles.editButton}
                          >
                            ✏️ Modifier
                          </button>
                        </div>
                      </div>
                      <div style={styles.documentMeta}>
                        <span style={styles.documentDate}>{formatDate(doc.date_demande)}</span>
                        {renderFileLinks(doc)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>✏️ Nouvelle Demande Simple</h3>
            </div>
            <div style={styles.cardBody}>
              <form onSubmit={handleSimpleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Type de document</label>
                  <select 
                    style={styles.formSelect}
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  >
                    <option value="">-- Sélectionnez --</option>
                    <option value="Attestation de présence">Attestation de présence</option>
                    <option value="Relevé de notes">Relevé de notes</option>
                    <option value="Attestation de scolarité">Attestation de scolarité</option>
                  </select>
                </div>
                <button 
                  style={styles.submitButton} 
                  type="submit"
                  disabled={demandes.some(d => d.title === newTitle)}
                >
                  {demandes.some(d => d.title === newTitle) ? 'Déjà envoyée' : 'Envoyer la demande'}
                </button>
              </form>
            </div>
          </div>

          <div style={{...styles.card, ...styles.importantCard}}>
            <div style={{...styles.cardHeader, ...styles.importantCardHeader}}>
              <h3 style={styles.cardTitle}>
                {editMode ? '✏️ Modifier Dossier' : '📦 Nouveau Dossier Physique'}
              </h3>
            </div>
            <div style={styles.cardBody}>
              <form onSubmit={handleDossierSubmit} encType="multipart/form-data" style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Niveau d'étude</label>
                  <select 
                    style={styles.formSelect}
                    value={niveauEtude} 
                    onChange={(e) => setNiveauEtude(e.target.value)}
                    required
                  >
                    <option value="baccalaureat">Baccalauréat</option>
                    <option value="licence">Licence</option>
                    <option value="master">Master</option>
                  </select>
                </div>

                <div style={styles.fileUploadGroup}>
                  <label style={styles.fileUploadLabel}>
                    <input 
                      type="file" 
                      name="carte_identite" 
                      onChange={handleFileChange} 
                      required={!editMode}
                      style={styles.fileInput}
                    />
                    <span style={styles.fileUploadButton}>📷 Carte d'identité</span>
                  </label>
                  
                  <label style={styles.fileUploadLabel}>
                    <input 
                      type="file" 
                      name="diplome" 
                      onChange={handleFileChange} 
                      required={!editMode}
                      style={styles.fileInput}
                    />
                    <span style={styles.fileUploadButton}>🎓 Diplôme</span>
                  </label>
                  
                  <label style={styles.fileUploadLabel}>
                    <input 
                      type="file" 
                      name="releve_notes" 
                      onChange={handleFileChange} 
                      required={!editMode}
                      style={styles.fileInput}
                    />
                    <span style={styles.fileUploadButton}>📊 Relevé de notes</span>
                  </label>
                  
                  <label style={styles.fileUploadLabel}>
                    <input 
                      type="file" 
                      name="doc_sante" 
                      onChange={handleFileChange} 
                      required={!editMode}
                      style={styles.fileInput}
                    />
                    <span style={styles.fileUploadButton}>🏥 Certificat médical</span>
                  </label>
                </div>

                <div style={styles.formActions}>
                  <button 
                    style={{...styles.submitButton, ...styles.importantButton}} 
                    type="submit"
                  >
                    {editMode ? 'Mettre à jour' : 'Envoyer le dossier'}
                  </button>
                  {editMode && (
                    <button 
                      style={styles.cancelButton}
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setCurrentDossierId(null);
                        setFiles({});
                      }}
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    position: 'relative',
    background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
    color: 'white',
    paddingBottom: '60px',
    marginBottom: '40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerWave: {
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    right: 0,
    height: '60px',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23f5f5f5\' fill-opacity=\'1\' d=\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
    backgroundSize: 'cover',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '300',
    margin: 0,
  },
  nameHighlight: {
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    borderRadius: '25px',
    padding: '10px 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  logoutIcon: {
    fontSize: '16px',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px 40px',
  },
  message: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: '500',
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
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  importantCard: {
    borderTop: '4px solid #d32f2f',
  },
  cardHeader: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importantCardHeader: {
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  cardCount: {
    backgroundColor: '#e0e0e0',
    color: '#616161',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: '20px',
  },
  emptyMessage: {
    color: '#9e9e9e',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  documentList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '12px',
  },
  documentItem: {
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    borderLeft: '3px solid #e0e0e0',
  },
  documentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  documentTitle: {
    fontWeight: '500',
    color: '#424242',
  },
  documentStatus: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#e0e0e0',
    color: '#616161',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  statusApproved: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  documentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#9e9e9e',
  },
  documentDate: {
    fontStyle: 'italic',
  },
  documentFiles: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '8px'
  },
  fileLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    color: '#d32f2f',
    textDecoration: 'none',
    fontSize: '13px',
  },
  form: {
    display: 'grid',
    gap: '20px',
  },
  formGroup: {
    display: 'grid',
    gap: '8px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#616161',
  },
  formSelect: {
    padding: '12px 15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    fontSize: '14px',
  },
  fileUploadGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  fileUploadLabel: {
    position: 'relative',
  },
  fileInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    border: 0,
  },
  fileUploadButton: {
    display: 'block',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    border: '1px dashed #e0e0e0',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '13px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 20px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  importantButton: {
    backgroundColor: '#b71c1c',
  },
  editButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '8px',
    padding: '2px 5px',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    padding: '12px 20px',
    backgroundColor: '#e0e0e0',
    color: '#616161',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default DashboardEtudiant;