import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ROLE_OPTIONS = [
  { value: '', label: '-- Rôle --' },
  { value: 'admin', label: 'Admin' },
  { value: 'etudiant', label: 'Étudiant' },
  { value: 'employe', label: 'Employé' },
  { value: 'admin_rh', label: 'Admin RH' },
  { value: 'admin_etudes', label: 'Admin Études' },
];

const TYPE_POSTE_OPTIONS = [
  { value: '', label: '-- Type de poste --' },
  { value: 'poste1', label: 'Poste 1' },
  { value: 'poste2', label: 'Poste 2' },
  { value: 'poste3', label: 'Poste 3' },
];

const BLOC_AFFECTE_OPTIONS = [
  { value: '', label: '-- Bloc affecté --' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'G', label: 'G' },
  { value: 'H', label: 'H' },
  { value: 'I', label: 'I' },
  { value: 'J', label: 'J' },
  { value: 'K', label: 'K' },
];

function UserForm({ user, onSave, onCancel }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [type_poste, setTypePoste] = useState(user?.type_poste || '');
  const [blocAffecte, setBlocAffecte] = useState(user?.blocAffecte || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setRole(user?.role || '');
    setTypePoste(user?.type_poste || '');
    setBlocAffecte(user?.blocAffecte || '');
    setPassword('');
    setConfirmPassword('');
  }, [user]);

  useEffect(() => {
    if (role !== 'employe') {
      setTypePoste('');
      setBlocAffecte('');
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    setLoading(true);

    try {
      const userData = { name, email, role };
      if (role === 'employe') {
        userData.type_poste = type_poste;
        userData.blocAffecte = blocAffecte;
      }
      if (password) userData.password = password;

      if (user && user.id) {
        await axios.put(`http://localhost:5000/api/users/${user.id}`, userData);
      } else {
        await axios.post('http://localhost:5000/api/users', userData);
      }
      onSave();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>{user ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</h3>
      <label style={styles.label}>
        Nom :
        <input type="text" value={name} onChange={e => setName(e.target.value)} required style={styles.input} />
      </label>
      <label style={styles.label}>
        Email :
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} />
      </label>
      <label style={styles.label}>
        Rôle :
        <select value={role} onChange={e => setRole(e.target.value)} required style={styles.input}>
          {ROLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
      {role === 'employe' && (
        <>
          <label style={styles.label}>
            Type de poste :
            <select value={type_poste} onChange={e => setTypePoste(e.target.value)} style={styles.input}>
              {TYPE_POSTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label style={styles.label}>
            Bloc Affecté :
            <select value={blocAffecte} onChange={e => setBlocAffecte(e.target.value)} style={styles.input}>
              {BLOC_AFFECTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <label style={styles.label}>
        Mot de passe :
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={user ? 'Laisser vide pour ne pas changer' : ''}
          autoComplete="new-password"
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        Confirmer mot de passe :
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder={user ? 'Laisser vide pour ne pas changer' : ''}
          autoComplete="new-password"
          style={styles.input}
        />
      </label>
      <div style={styles.actions}>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'En cours...' : user ? 'Modifier' : 'Ajouter'}
        </button>
        <button type="button" disabled={loading} onClick={onCancel} style={styles.cancelBtn}>
          Retour
        </button>
      </div>
    </form>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch {
      setMessage('❌ Erreur de récupération des utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setMessage('✅ Utilisateur supprimé');
      fetchUsers();
    } catch {
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setViewMode('form');
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setViewMode('form');
  };

  const handleSaved = () => {
    fetchUsers();
    setViewMode('list');
    setEditingUser(null);
    setMessage('✅ Utilisateur enregistré');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingUser(null);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
      {viewMode === 'list' && (
        <>
          <h2>Gestion des utilisateurs</h2>
          {message && <div>{message}</div>}
          <button style={styles.addButton} onClick={handleAdd}>➕ Ajouter un utilisateur</button>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>Aucun utilisateur</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.role}</td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn} onClick={() => handleEdit(u)}>Modifier</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
      {viewMode === 'form' && (
        <UserForm user={editingUser} onSave={handleSaved} onCancel={handleCancel} />
      )}
    </div>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 },
  label: { display: 'flex', flexDirection: 'column', fontWeight: 600 },
  input: { marginTop: 6, padding: 10, borderRadius: 6, border: '1px solid #ccc' },
  actions: { display: 'flex', gap: 10, marginTop: 15 },
  submitBtn: { flex: 1, padding: 10, backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: 6 },
  cancelBtn: { flex: 1, padding: 10, backgroundColor: '#ccc', border: 'none', borderRadius: 6 },
  addButton: { backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: 6, padding: '10px 15px', marginBottom: 10 },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 10 },
  th: { borderBottom: '2px solid #ddd', padding: 12, backgroundColor: '#f9f9f9' },
  td: { borderBottom: '1px solid #eee', padding: 12 },
  actionBtn: { marginRight: 8, backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px' },
  deleteBtn: { backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: 4, padding: '5px 10px' },
};

export default UserManagement;
