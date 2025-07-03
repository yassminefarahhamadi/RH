import React, { useState } from 'react';
import axios from 'axios';

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
  toggleBox: {
    marginTop: '24px',
    fontSize: '1rem',
    color: '#555',
  },
  toggleLink: {
    color: '#d32f2f',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginLeft: '6px',
  },
};

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

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      setMessage('✅ Inscription réussie ! Vous pouvez vous connecter.');
      setIsError(false);
      // Optionnel : reset form ou rediriger vers login automatiquement
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
          autoComplete="name"
        />

        <input
          type="email"
          name="email"
          placeholder="Adresse Email"
          value={formData.email}
          onChange={handleChange}
          style={signupStyles.input}
          required
          autoComplete="email"
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          style={signupStyles.input}
          required
          autoComplete="new-password"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={signupStyles.select}
          required
        >
          <option value="">-- Rôle --</option>
          <option value="admin">Admin</option>
          <option value="etudiant">Étudiant</option>
          <option value="employe">Employé</option>
          <option value="admin_rh">Admin RH</option>
          <option value="admin_etudes">Admin Études</option>
        </select>

        {formData.role === 'employe' && (
          <>
            <input
              type="text"
              name="type_poste"
              placeholder="Type de poste (ex: femme de ménage)"
              value={formData.type_poste}
              onChange={handleChange}
              style={signupStyles.input}
            />
            <input
              type="text"
              name="blocAffecte"
              placeholder="Bloc affecté (ex: Bloc A)"
              value={formData.blocAffecte}
              onChange={handleChange}
              style={signupStyles.input}
            />
          </>
        )}

        <button type="submit" style={signupStyles.button}>S'inscrire</button>

       
      </form>
    </div>
  );
}

export default Signup;
