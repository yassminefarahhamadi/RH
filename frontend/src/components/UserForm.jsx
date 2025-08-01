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
  { value: 'femme_menage', label: 'Femme de ménage' },
  { value: 'surveillant', label: 'Surveillant' },
  { value: 'technicien', label: 'Technicien' },
  { value: 'maintenance', label: 'Maintenance' },
];

const BLOC_AFFECTE_OPTIONS = [
  { value: '', label: '-- Bloc affecté --' },
  { value: 'A', label: 'Bloc A' },
  { value: 'B', label: 'Bloc B' },
  { value: 'C', label: 'Bloc C' },
  { value: 'D', label: 'Bloc D' },
  { value: 'E', label: 'Bloc E' },
  { value: 'F', label: 'Bloc F' },
  { value: 'G', label: 'Bloc G' },
  { value: 'H', label: 'Bloc H' },
  { value: 'I', label: 'Bloc I' },
  { value: 'J', label: 'Bloc J' },
  { value: 'K', label: 'Bloc K' },
];

function UserForm({ user, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [type_poste, setTypePoste] = useState('');
  const [blocAffecte, setBlocAffecte] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Remplit le formulaire si on modifie un utilisateur
  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setRole(user?.role || '');
    setTypePoste(user?.type_poste || '');
    setBlocAffecte(user?.blocAffecte || '');
    setPassword('');
    setConfirmPassword('');
  }, [user]);

  // Réinitialise les champs type_poste/bloc si rôle ≠ employe
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
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styleUserForm.form}>
      <h3 style={{ marginBottom: 20 }}>{user ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</h3>

      <label style={styleUserForm.label}>
        Nom :
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styleUserForm.input}
        />
      </label>

      <label style={styleUserForm.label}>
        Email :
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styleUserForm.input}
        />
      </label>

      <label style={styleUserForm.label}>
        Rôle :
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={styleUserForm.input}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {role === 'employe' && (
        <>
          <label style={styleUserForm.label}>
            Type de poste :
            <select
              value={type_poste}
              onChange={(e) => setTypePoste(e.target.value)}
              style={styleUserForm.input}
            >
              {TYPE_POSTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label style={styleUserForm.label}>
            Bloc affecté :
            <select
              value={blocAffecte}
              onChange={(e) => setBlocAffecte(e.target.value)}
              style={styleUserForm.input}
            >
              {BLOC_AFFECTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <label style={styleUserForm.label}>
        Mot de passe :
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={user ? 'Laisser vide pour ne pas changer' : ''}
          autoComplete="new-password"
          style={styleUserForm.input}
        />
      </label>

      <label style={styleUserForm.label}>
        Confirmer mot de passe :
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={user ? 'Laisser vide pour ne pas changer' : ''}
          autoComplete="new-password"
          style={styleUserForm.input}
        />
      </label>

      <div style={{ display: 'flex', gap: '12px', marginTop: 24 }}>
        <button
          type="submit"
          disabled={loading}
          style={{ ...styleUserForm.buttonSubmit, flexGrow: 1 }}
        >
          {loading ? 'En cours...' : user ? 'Modifier' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={styleUserForm.buttonCancel}
        >
          Retour
        </button>
      </div>
    </form>
  );
}

const styleUserForm = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 400,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 600,
    fontSize: 14,
    color: '#333',
  },
  input: {
    marginTop: 6,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1.5px solid #ccc',
    fontSize: 14,
    outlineColor: '#b71c1c',
  },
  buttonSubmit: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonCancel: {
    backgroundColor: '#ccc',
    color: '#444',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default UserForm;
