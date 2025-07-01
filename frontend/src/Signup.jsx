import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    type_poste: '',
    blocAffecte: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      setMessage('✅ Inscription réussie ! Vous pouvez vous connecter.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur inscription');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>
      {message && <p style={{ color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}

      <input
        type="text"
        name="name"
        placeholder="Nom complet"
        value={formData.name}
        onChange={handleChange}
        required
      /><br />

      <input
        type="email"
        name="email"
        placeholder="Adresse Email"
        value={formData.email}
        onChange={handleChange}
        required
      /><br />

      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
      /><br />

      <select name="role" value={formData.role} onChange={handleChange} required>
        <option value="">-- Rôle --</option>
        <option value="admin">Admin</option>
        <option value="etudiant">Étudiant</option>
        <option value="employe">Employé</option>
        <option value="admin_rh">Admin RH</option>
        <option value="admin_etudes">Admin Études</option>
      </select><br />

      {(formData.role === 'employe') && (
        <>
          <input
            type="text"
            name="type_poste"
            placeholder="Type de poste (ex: femme de ménage)"
            value={formData.type_poste}
            onChange={handleChange}
          /><br />

          <input
            type="text"
            name="blocAffecte"
            placeholder="Bloc affecté (ex: Bloc A)"
            value={formData.blocAffecte}
            onChange={handleChange}
          /><br />
        </>
      )}

      <button type="submit">S'inscrire</button>
    </form>
  );
}

export default Signup;
