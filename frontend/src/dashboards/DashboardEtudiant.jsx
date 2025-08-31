import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DashboardEtudiant = ({ onLogout }) => {
  const id = localStorage.getItem('id');
  const name = localStorage.getItem('name');
  const [demandes, setDemandes] = useState([]);
  const [dossier, setDossier] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [niveauEtude, setNiveauEtude] = useState('baccalaureat');
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const attestationTypes = [
    "Attestation de présence",
    "Relevé de notes",
    "Attestation de scolarité",
    "Attestation d'inscription",
    "Attestation de réussite"
  ];

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${id}`);
      setDemandes(res.data.filter(doc => doc.title !== 'Dossier physique'));
      const physDossier = res.data.find(doc => doc.title === 'Dossier physique');
      setDossier(physDossier || null);
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

  const canRequestAttestation = (type) => {
    return !demandes.some(d => d.title === type && d.statut === 'en_attente');
  };

  const handleSimpleSubmit = async (e) => {
    e.preventDefault();

    const existingRequest = demandes.find(d =>
      d.title === newTitle && d.statut === 'en_attente'
    );
    if (existingRequest) {
      setMessage('⚠️ Vous avez déjà une demande en attente pour ce type d\'attestation');
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

  const cancelDemand = async (demandId) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${demandId}`);
      setMessage('✅ Demande annulée');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur lors de l\'annulation');
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
      if (editMode && dossier) {
        await axios.put(`http://localhost:5000/api/documents/${dossier.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('✅ Dossier mis à jour');
      } else {
        await axios.post('http://localhost:5000/api/documents/dossier', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('✅ Dossier envoyé');
      }
      setFiles({});
      setEditMode(false);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur lors de l\'envoi');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setHours(date.getHours() + 1);
    return date.toISOString().split('T')[0];
  };

  const renderFileLinks = (doc) => (
    <div style={styles.documentFiles}>
      {doc.carte_identite && <a href={`http://localhost:5000/uploads/${doc.carte_identite}`} target="_blank" rel="noreferrer" style={styles.fileLink}> Carte ID</a>}
      {doc.diplome && <a href={`http://localhost:5000/uploads/${doc.diplome}`} target="_blank" rel="noreferrer" style={styles.fileLink}> Diplôme</a>}
      {doc.releve_notes && <a href={`http://localhost:5000/uploads/${doc.releve_notes}`} target="_blank" rel="noreferrer" style={styles.fileLink}> Relevé</a>}
      {doc.doc_sante && <a href={`http://localhost:5000/uploads/${doc.doc_sante}`} target="_blank" rel="noreferrer" style={styles.fileLink}> Santé</a>}
    </div>
  );

  const getStatusStyle = (status) => {
    switch(status) {
      case 'validée':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'en_attente':
        return { backgroundColor: '#ff9800', color: 'white' };
      case 'refusée':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#e0e0e0', color: '#616161' };
    }
  };

  return (
    <div style={styles.container}>
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
                {name}
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
        <div style={styles.horizontalCardContainer}>
          {/* Carte des demandes d'attestation avec scroll */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📋 Demandes d'Attestation</h3>
              <div style={styles.cardCount}>{demandes.length}</div>
            </div>
            <div style={{...styles.cardBody, overflowY: 'auto', maxHeight: '400px'}}>
              {demandes.length === 0 ? (
                <p style={styles.emptyMessage}>Aucune demande</p>
              ) : (
                <ul style={styles.documentList}>
                  {demandes.map((doc) => (
                    <li key={doc.id} style={styles.documentItem}>
                      <div style={styles.documentHeader}>
                        <span style={styles.documentTitle}>{doc.title}</span>
                        <span style={{
                          ...styles.documentStatus,
                          ...getStatusStyle(doc.statut)
                        }}>
                          {doc.statut}
                        </span>
                      </div>
                      <div style={styles.documentMeta}>
                        <span style={styles.documentDate}>{formatDate(doc.date_demande)}</span>
                        {doc.statut === 'en_attente' && (
                          <button 
                            onClick={() => cancelDemand(doc.id)}
                            style={styles.cancelButton}
                          >
                            Annuler
                          </button>
                        )}
                        {/* Bouton "Refaire la demande" supprimé */}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Carte de création de nouvelle demande */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>✏️ Nouvelle Demande</h3>
            </div>
            <div style={styles.cardBody}>
              <form onSubmit={handleSimpleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Type d'attestation</label>
                  <select 
                    style={styles.formSelect}
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  >
                    <option value="">-- Sélectionnez --</option>
                    {attestationTypes.map(type => (
                      <option key={type} value={type} disabled={!canRequestAttestation(type)}>
                        {type} {!canRequestAttestation(type) && "(Demande en attente)"}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  style={styles.submitButton} 
                  type="submit"
                  disabled={!canRequestAttestation(newTitle)}
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
          {/* Carte du dossier physique */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📁 Dossier Physique</h3>
              <div style={styles.cardCount}>{dossier ? 1 : 0}</div>
            </div>
            <div style={styles.cardBody}>
              {dossier ? (
                <div>
                  <div style={styles.documentItem}>
                    <div style={styles.documentHeader}>
                      <span style={styles.documentTitle}>Dossier ({dossier.niveau_etude})</span>
                      <span style={{
                        ...styles.documentStatus,
                        ...getStatusStyle(dossier.statut)
                      }}>
                        {dossier.statut}
                      </span>
                    </div>
                    <div style={styles.documentMeta}>
                      <span style={styles.documentDate}>{formatDate(dossier.date_demande)}</span>
                      <button 
                        onClick={() => {
                          setEditMode(true);
                          setNiveauEtude(dossier.niveau_etude);
                        }}
                        style={styles.editButton}
                      >
                        Modifier
                      </button>
                    </div>
                    {renderFileLinks(dossier)}
                  </div>
                  {editMode && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                      <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Modifier le dossier</h4>
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
                          {['carte_identite', 'diplome', 'releve_notes', 'doc_sante'].map((field) => (
                            <label key={field} style={styles.fileUploadLabel}>
                              <input 
                                type="file" 
                                name={field} 
                                onChange={handleFileChange} 
                                style={styles.fileInput}
                              />
                              <span style={styles.fileUploadButton}>
                                {field === 'carte_identite' && 'Carte ID'}
                                {field === 'diplome' && 'Diplôme'}
                                {field === 'releve_notes' && 'Relevé'}
                                {field === 'doc_sante' && 'Santé'}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div style={styles.formActions}>
                          <button style={styles.submitButton} type="submit">
                            Mettre à jour
                          </button>
                          <button 
                            style={styles.cancelButton}
                            type="button"
                            onClick={() => setEditMode(false)}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p style={styles.emptyMessage}>Aucun dossier enregistré</p>
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
                      {['carte_identite', 'diplome', 'releve_notes', 'doc_sante'].map((field) => (
                        <label key={field} style={styles.fileUploadLabel}>
                          <input 
                            type="file" 
                            name={field} 
                            onChange={handleFileChange} 
                            required
                            style={styles.fileInput}
                          />
                          <span style={styles.fileUploadButton}>
                            {field === 'carte_identite' && 'Carte ID'}
                            {field === 'diplome' && 'Diplôme'}
                            {field === 'releve_notes' && 'Relevé'}
                            {field === 'doc_sante' && 'Santé'}
                          </span>
                        </label>
                      ))}
                    </div>
                    <button style={{...styles.submitButton, ...styles.importantButton}} type="submit">
                      Créer le dossier
                    </button>
                  </form>
                </div>
              )}
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
  horizontalCardContainer: {
    display: 'flex',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    minWidth: '350px',
    flex: '1',
  },
  cardHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.05)'
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  cardCount: {
    backgroundColor: '#e0e0e0',
    color: '#616161',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
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
    gap: '10px',
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
    fontSize: '14px',
  },
  documentStatus: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 6px',
    borderRadius: '10px',
  },
  documentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9e9e9e',
  },
  documentDate: {
    fontStyle: 'italic',
  },
  documentFiles: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  },
  fileLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 6px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    color: '#d32f2f',
    textDecoration: 'none',
    fontSize: '12px',
  },
  form: {
    display: 'grid',
    gap: '15px',
  },
  formGroup: {
    display: 'grid',
    gap: '6px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#616161',
  },
  formSelect: {
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
    fontSize: '13px',
  },
  fileUploadGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
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
    padding: '10px',
    backgroundColor: '#f5f5f5',
    border: '1px dashed #e0e0e0',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '12px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 15px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
  },
  importantButton: {
    backgroundColor: '#b71c1c',
  },
  editButton: {
    backgroundColor: 'transparent',
    border: '1px solid #1976d2',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 15px',
    backgroundColor: '#e0e0e0',
    color: '#616161',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
  }
};

export default DashboardEtudiant;
