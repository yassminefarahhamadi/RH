import React, { useState } from 'react';
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

function Signup({ onShowLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    type_poste: '',
    blocAffecte: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setMessage('✅ Inscription réussie ! Vous pouvez vous connecter.');
      setIsError(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        type_poste: '',
        blocAffecte: '',
      });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur inscription');
      setIsError(true);
    }
  };

  return (
    <div style={signupStyles.wrapper}>
      <form style={signupStyles.card} onSubmit={handleSubmit}>
        <div style={signupStyles.title}>Créer un compte</div>
        <div style={signupStyles.subtitle}>Bienvenue, veuillez remplir le formulaire</div>

        {message && (
          <div
            style={{
              ...signupStyles.message,
              ...(isError ? signupStyles.errorMessage : signupStyles.successMessage),
            }}
          >
            {message}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Nom complet"
          value={formData.name}
          onChange={handleChange}
          style={signupStyles.input}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Adresse Email"
          value={formData.email}
          onChange={handleChange}
          style={signupStyles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          style={signupStyles.input}
          required
        />

        {/* Sélection du rôle */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={signupStyles.select}
          required
        >
          {ROLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Affichage conditionnel si role = employe */}
        {formData.role === 'employe' && (
          <>
            <select
              name="type_poste"
              value={formData.type_poste}
              onChange={handleChange}
              style={signupStyles.select}
              required
            >
              {TYPE_POSTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              name="blocAffecte"
              value={formData.blocAffecte}
              onChange={handleChange}
              style={signupStyles.select}
              required
            >
              {BLOC_AFFECTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        )}

        <button type="submit" style={signupStyles.button}>S'inscrire</button>
      </form>
    </div>
  );
}

const signupStyles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #d32f2f 0%, #fff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(211,47,47,0.15)',
    padding: '40px 32px 32px 32px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  },
  title: {
    fontSize: '1.7rem',
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  subtitle: {
    color: '#b71c1c',
    fontSize: '1rem',
    marginBottom: '28px',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    marginBottom: '18px',
    fontSize: '1rem',
    background: '#fafafa',
    transition: 'border 0.2s',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    marginBottom: '18px',
    fontSize: '1rem',
    background: '#fafafa',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(90deg, #d32f2f 60%, #b71c1c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginTop: '5px',
    boxShadow: '0 2px 8px rgba(211,47,47,0.08)',
    transition: 'background 0.2s',
  },
  message: {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '1rem',
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
};

export default Signup;
