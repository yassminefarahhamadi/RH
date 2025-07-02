import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import axios from 'axios';

function ModifierUtilisateur() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/${id}`)
      .then(res => setUser(res.data))
      .catch(() => alert("Erreur lors du chargement de l'utilisateur"));
  }, [id]);

  const handleSave = () => {
    navigate('/utilisateurs');
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ color: '#b71c1c' }}>✏️ Modifier l'utilisateur</h2>
      {user ? <UserForm user={user} onSave={handleSave} /> : <p>Chargement...</p>}
    </div>
  );
}

export default ModifierUtilisateur;
