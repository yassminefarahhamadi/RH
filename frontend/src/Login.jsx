import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      console.log("Réponse login:", res.data);  // Pour debug

      // Adapte selon la structure réelle de ta réponse :
      // Exemple 1: id est directement dans res.data
      // const userId = res.data.id;

      // Exemple 2: id dans un sous-objet user
      const userId = res.data.id || res.data.user?.id;

      if (!userId) {
        throw new Error("ID utilisateur non trouvé dans la réponse du serveur");
      }

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
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      /><br/>
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      /><br/>
      <button type="submit">Se connecter</button>
      {error && <p style={{color:'red'}}>{error}</p>}
    </form>
  );
}

export default Login;
