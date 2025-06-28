import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserForm({ user, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employe',
    type_poste: '',
    blocAffecte: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (user) {
      await axios.put(`http://localhost:5000/api/users/${user.id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/users', formData);
    }
    onSave();
    setFormData({ name: '', email: '', role: 'employe', type_poste: '', blocAffecte: '', password: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nom" value={formData.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      {!user && (
        <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
      )}
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="admin">Admin</option>
        <option value="admin_rh">Admin RH</option>
        <option value="admin_etudes">Admin Études</option>
        <option value="employe">Employé</option>
        <option value="etudiant">Étudiant</option>
      </select>
      <input name="type_poste" placeholder="Poste (si employé)" value={formData.type_poste} onChange={handleChange} />
      <input name="blocAffecte" placeholder="Bloc" value={formData.blocAffecte} onChange={handleChange} />
      <button type="submit">{user ? 'Modifier' : 'Créer'}</button>
    </form>
  );
}

export default UserForm;
