import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserForm from '../components/UserForm';

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (err) {
      setMessage('❌ Erreur de récupération des utilisateurs');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setMessage('✅ Utilisateur supprimé');
      fetchUsers();
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaved = () => {
    fetchUsers();
    setEditingUser(null);
    setMessage('✅ Utilisateur enregistré');
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={styles.userListContainer}>
      <h2 style={styles.sectionTitle}>Gestion des Utilisateurs</h2>
      
      {message && (
        <div style={{
          ...styles.message,
          ...(message.startsWith('✅') ? styles.successMessage : styles.errorMessage)
        }}>
          {message}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>✏️ {editingUser ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</h3>
        </div>
        <div style={styles.cardBody}>
          <UserForm user={editingUser} onSave={handleSaved} />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>👥 Liste des Utilisateurs</h3>
          <div style={styles.cardCount}>{users.length}</div>
        </div>
        <div style={styles.cardBody}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Nom</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Rôle</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{u.name}</td>
                  <td style={styles.tableCell}>{u.email}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.roleBadge,
                      ...(u.role === 'admin' && styles.adminBadge),
                      ...(u.role === 'etudiant' && styles.studentBadge),
                      ...(u.role.includes('admin_') && styles.adminSubBadge),
                      ...(u.role === 'employe' && styles.employeeBadge),
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      onClick={() => handleEdit(u)}
                      style={styles.editButton}
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)}
                      style={styles.deleteButton}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const DashboardAdmin = ({ onLogout }) => {
  const name = localStorage.getItem('name');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoAndWelcome}>
            <img src="/logo.png" alt="Logo" style={styles.logo} />
            <h2 style={styles.welcomeTitle}>
              Bonjour, <span style={styles.nameHighlight}>{name}</span>
            </h2>
          </div>
          <button style={styles.logoutButton} onClick={onLogout}>Déconnexion</button>
        </div>
      </div>

      <div style={styles.content}>
        <UserList />
      </div>
    </div>
  );
};

// Styles (identique au dashboard étudiant avec quelques ajouts)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, rgb(216, 95, 95) 0%, #b71c1c 100%)',
    color: 'white',
    padding: '20px 0',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  headerContent: {
    paddingLeft: '10px',
    paddingRight: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    margin: '0 auto',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '300',
    margin: 0,
  },
  nameHighlight: {
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    borderRadius: '25px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
    }
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px 40px',
  },
  message: {
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center',
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
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  cardHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.05)'
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  cardCount: {
    backgroundColor: '#e0e0e0',
    color: '#616161',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: '20px',
  },
  logoAndWelcome: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '150px',
    height: '60px',
    objectFit: 'contain',
    display: 'block',
    borderRadius: '8px',
  },
  // Styles spécifiques à la liste des utilisateurs
  userListContainer: {
    display: 'grid',
    gap: '20px',
  },
  sectionTitle: {
    color: '#b71c1c',
    fontSize: '22px',
    marginBottom: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#f5f5f5',
  },
  tableHeader: {
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#424242',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
    '&:hover': {
      backgroundColor: '#fafafa',
    }
  },
  tableCell: {
    padding: '12px 15px',
    color: '#616161',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
  },
  adminBadge: {
    backgroundColor: '#d32f2f',
    color: 'white',
  },
  adminSubBadge: {
    backgroundColor: '#ffcdd2',
    color: '#b71c1c',
  },
  studentBadge: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  employeeBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  editButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    marginRight: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};

export default DashboardAdmin;