import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const motifsConges = [
  'Congé annuel',
  'Congé maladie',
  'Congé maternité/paternité',
  'Congé sans solde',
  'Congé exceptionnel',
  'Autre',
];

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('en-CA');
};

const DashboardEmploye = ({ onLogout }) => {
  const id = localStorage.getItem('id');
  const name = localStorage.getItem('name');

  const [conges, setConges] = useState([]);
  const [form, setForm] = useState({ date_debut: '', date_fin: '', motif: '' });
  const [message, setMessage] = useState('');

  const fetchConges = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/conges/${id}`);
      const formatted = res.data.map(c => ({
        ...c,
        date_debut: formatDate(c.date_debut),
        date_fin: formatDate(c.date_fin),
      }));
      setConges(formatted);
    } catch (err) {
      console.error('Erreur chargement congés', err);
      setMessage('Erreur lors du chargement des congés');
    }
  }, [id]);

  useEffect(() => {
    fetchConges();
  }, [fetchConges]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(form.date_fin) < new Date(form.date_debut)) {
      setMessage('La date de fin doit être postérieure à la date de début.');
      return;
    }

    if (!form.motif) {
      setMessage('Veuillez sélectionner un motif de congé.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/conges', {
        user_id: id,
        ...form,
      });
      setMessage('Demande envoyée');
      setForm({ date_debut: '', date_fin: '', motif: '' });
      fetchConges();
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de la demande');
    }
  };

  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'accepte':
        return { color: 'green', fontWeight: 'bold' };
      case 'refuse':
        return { color: 'red', fontWeight: 'bold' };
      case 'en_attente':
        return { color: 'orange', fontWeight: 'bold' };
      default:
        return { color: 'black', fontWeight: 'bold' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ background: 'linear-gradient(135deg,rgb(216, 95, 95) 0%, #b71c1c 100%)', color: 'white', padding: '20px 0', marginBottom: '30px' }}>
        <div style={{ width: '95%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '150px', height: '60px', objectFit: 'contain', borderRadius: '8px' }} />
            <h2>Bonjour, <span style={{ fontWeight: '600' }}>{name}</span></h2>
          </div>
          <button onClick={onLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '25px', padding: '8px 16px', cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '30px',
            textAlign: 'center',
            fontWeight: '500',
            backgroundColor: message.startsWith('Demande envoyée') ? '#e8f5e9' : '#ffebee',
            color: message.startsWith('Demande envoyée') ? '#2e7d32' : '#c62828',
            borderLeft: `4px solid ${message.startsWith('Demande envoyée') ? '#4caf50' : '#f44336'}`,
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <section style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', maxWidth: '400px', flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
            <h3>Nouvelle demande de congé</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
              <div>
                <label>Date début :</label>
                <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label>Date fin :</label>
                <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label>Motif :</label>
                <select name="motif" value={form.motif} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="">-- Sélectionnez un motif --</option>
                  {motifsConges.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button type="submit" style={{ padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600' }}>Envoyer</button>
            </form>
          </section>

          <section style={{ flex: '2 1 600px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding: '20px' }}>
            <h3>Historique de mes congés</h3>
            <div style={{ overflowY: 'auto', marginTop: '15px', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>Début</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>Fin</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>Motif</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {conges.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>Aucune demande de congé</td></tr>
                  ) : (
                    conges.map((c) => (
                      <tr key={c.id}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{c.date_debut}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{c.date_fin}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{c.motif || '-'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                          <span style={getStatusStyle(c.statut)}>{c.statut}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardEmploye;
