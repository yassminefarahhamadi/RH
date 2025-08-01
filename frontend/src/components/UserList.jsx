import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  return (
    <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
      <h2>Gestion des utilisateurs</h2>

      {message && (
        <div style={{ 
          backgroundColor: message.startsWith('✅') ? '#e8f5e9' : '#ffebee',
          color: message.startsWith('✅') ? '#2e7d32' : '#c62828',
          padding: 10,
          borderRadius: 6,
          marginBottom: 15,
          fontWeight: '600',
        }}>
          {message}
        </div>
      )}

      <button
        onClick={() => navigate('/ajouter-utilisateur')}
        style={{
          padding: '10px 15px',
          backgroundColor: '#b71c1c',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: '600',
          marginBottom: 15,
        }}
      >
        ➕ Ajouter un utilisateur
      </button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9' }}>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Nom</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Rôle</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: 20, textAlign: 'center' }}>Aucun utilisateur</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>{user.role}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => navigate(`/modifier-utilisateur/${user.id}`)}
                    style={{
                      marginRight: 8,
                      padding: '5px 10px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#1976d2',
                      color: 'white',
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
