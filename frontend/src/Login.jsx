import React, { useState } from 'react';
import axios from 'axios';

const loginStyles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #d32f2f 0%, #fff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: 'white', // this is the plain white "header blanc"
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(211,47,47,0.15)',
    padding: '40px 32px 32px 32px',
    maxWidth: '350px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  },
  logo: {
    width: '120px',
    marginBottom: '18px',
    borderRadius: '6px',
    objectFit: 'contain',
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
  error: {
    color: '#c62828',
    background: '#ffebee',
    borderLeft: '4px solid #f44336',
    padding: '10px',
    borderRadius: '6px',
    margin: '10px 0 0 0',
    fontSize: '0.95rem',
    textAlign: 'left',
  },
  footer: {
    marginTop: '30px',
    color: '#9e9e9e',
    fontSize: '0.95rem',
  },
  link: {
    color: '#d32f2f',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: '500',
    marginLeft: '4px',
  }
};

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const userId = res.data.id || res.data.user?.id;
      if (!userId) throw new Error("ID utilisateur non trouvé dans la réponse du serveur");
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('id', userId);
      onLoginSuccess(res.data.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur login');
    }
  };

  return (
    <div style={loginStyles.wrapper}>
      <form style={loginStyles.card} onSubmit={handleSubmit}>
        <img src="/logo.png" alt="Logo" style={loginStyles.logo} />
        <div style={loginStyles.title}>Connexion</div>
        <div style={loginStyles.subtitle}>Bienvenue sur votre espace </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={loginStyles.input}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={loginStyles.input}
          required
        />
        <button type="submit" style={loginStyles.button}>Se connecter</button>
        {error && <div style={loginStyles.error}>{error}</div>}
        <div style={loginStyles.footer}>
          Mot de passe oublié ?
          <span style={loginStyles.link} onClick={() => alert('Lien de réinitialisation')}>Réinitialiser</span>
        </div>
      </form>
    </div>
  );
}

export default Login;