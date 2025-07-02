import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DetailsUtilisateur() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/${id}`)
      .then(res => setUser(res.data))
      .catch(() => alert("Erreur lors du chargement des détails"));
  }, [id]);

  if (!user) return <p>Chargement...</p>;

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ color: '#b71c1c' }}>👁️ Détails de l'utilisateur</h2>
      <ul style={{ lineHeight: '2em', fontSize: '16px' }}>
        <li><strong>Nom:</strong> {user.name}</li>
        <li><strong>Email:</strong> {user.email}</li>
        <li><strong>Rôle:</strong> {user.role}</li>
      </ul>
      <button onClick={() => navigate('/utilisateurs')} style={{
        marginTop: '20px',
        padding: '10px 16px',
        backgroundColor: '#b71c1c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}>
        🔙 Retour à la liste
      </button>
    </div>
  );
}

export default DetailsUtilisateur;
