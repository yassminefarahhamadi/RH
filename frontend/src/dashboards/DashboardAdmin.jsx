import React, { useState, useEffect } from 'react';
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
  { value: 'poste1', label: 'Poste 1' },
  { value: 'poste2', label: 'Poste 2' },
  { value: 'poste3', label: 'Poste 3' },
];

const BLOC_AFFECTE_OPTIONS = [
  { value: '', label: '-- Bloc affecté --' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'G', label: 'G' },
  { value: 'H', label: 'H' },
  { value: 'I', label: 'I' },
  { value: 'J', label: 'J' },
  { value: 'K', label: 'K' },
];

// Supprimer ROLE_COLORS puisque nous ne voulons plus de couleurs

const UserForm = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [type_poste, setTypePoste] = useState(user?.type_poste || '');
  const [blocAffecte, setBlocAffecte] = useState(user?.blocAffecte || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setRole(user?.role || '');
    setTypePoste(user?.type_poste || '');
    setBlocAffecte(user?.blocAffecte || '');
    setPassword('');
    setConfirmPassword('');
  }, [user]);

  useEffect(() => {
    if (role !== 'employe') {
      setTypePoste('');
      setBlocAffecte('');
    }
  }, [role]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nom requis";
    if (!email.trim()) newErrors.email = "Email requis";
    if (!role) newErrors.role = "Rôle requis";
    if (role === 'employe' && !type_poste) newErrors.type_poste = "Type de poste requis";
    if (role === 'employe' && !blocAffecte) newErrors.blocAffecte = "Bloc affecté requis";
    if (password !== confirmPassword) newErrors.password = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = { name, email, role };
      if (role === 'employe') {
        userData.type_poste = type_poste;
        userData.blocAffecte = blocAffecte;
      }
      if (password) userData.password = password;

      if (user && user.id) {
        await axios.put(`http://localhost:5000/api/users/${user.id}`, userData);
      } else {
        await axios.post('http://localhost:5000/api/users', userData);
      }
      onSave();
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styleUserForm.form}>
      <h3 style={{ marginBottom: 20 }}>{user ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</h3>
      <label style={styleUserForm.label}>
        Nom:
        <input type="text" value={name} onChange={e => setName(e.target.value)} style={styleUserForm.input} />
        {errors.name && <span style={styleUserForm.error}>{errors.name}</span>}
      </label>
      <label style={styleUserForm.label}>
        Email:
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styleUserForm.input} />
        {errors.email && <span style={styleUserForm.error}>{errors.email}</span>}
      </label>
      <label style={styleUserForm.label}>
        Rôle:
        <select value={role} onChange={e => setRole(e.target.value)} style={styleUserForm.input}>
          {ROLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.role && <span style={styleUserForm.error}>{errors.role}</span>}
      </label>
      {role === 'employe' && (
        <>
          <label style={styleUserForm.label}>
            Type de poste:
            <select value={type_poste} onChange={e => setTypePoste(e.target.value)} style={styleUserForm.input}>
              {TYPE_POSTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.type_poste && <span style={styleUserForm.error}>{errors.type_poste}</span>}
          </label>
          <label style={styleUserForm.label}>
            Bloc Affecté:
            <select value={blocAffecte} onChange={e => setBlocAffecte(e.target.value)} style={styleUserForm.input}>
              {BLOC_AFFECTE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.blocAffecte && <span style={styleUserForm.error}>{errors.blocAffecte}</span>}
          </label>
        </>
      )}
      <label style={styleUserForm.label}>
        Mot de passe:
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styleUserForm.input} />
      </label>
      <label style={styleUserForm.label}>
        Confirmer mot de passe:
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={styleUserForm.input} />
        {errors.password && <span style={styleUserForm.error}>{errors.password}</span>}
      </label>
      <div style={{ display: 'flex', gap: '12px', marginTop: 24 }}>
        <button type="submit" disabled={loading} style={{ ...styleUserForm.buttonSubmit, flexGrow: 1 }}>
          {loading ? 'En cours...' : user ? 'Modifier' : 'Ajouter'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} style={styleUserForm.buttonCancel}>
          Retour
        </button>
      </div>
    </form>
  );
};

function UserList() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch {
      setMessage('Erreur de récupération des utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setMessage('Utilisateur supprimé');
      fetchUsers();
    } catch {
      setMessage('Erreur lors de la suppression');
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setViewMode('form');
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setViewMode('form');
  };

  const handleSaved = () => {
    fetchUsers();
    setViewMode('list');
    setEditingUser(null);
    setMessage('Utilisateur enregistré');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingUser(null);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(users.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Supprimer getRoleBadgeStyle puisque nous ne voulons plus de couleurs

  return (
    <div>
      {viewMode === 'list' && (
        <>
          <h2 style={styles.sectionTitle}>Gestion des Utilisateurs</h2>
          {message && (
            <div style={message.startsWith('✅') ? styles.successMessage : styles.errorMessage}>{message}</div>
          )}
          <button style={styles.addButton} onClick={handleAdd}>
            Ajouter un utilisateur
          </button>
          
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Nom</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Rôle</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>Aucun utilisateur</td>
                  </tr>
                ) : (
                  currentUsers.map(u => (
                    <tr key={u.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{u.name}</td>
                      <td style={styles.tableCell}>{u.email}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.roleBadge}>
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <button style={styles.editButton} onClick={() => handleEdit(u)}>Modifier</button>
                        <button style={styles.deleteButton} onClick={() => handleDelete(u.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {users.length > usersPerPage && (
              <div style={styles.pagination}>
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  style={currentPage === 1 ? styles.paginationButtonDisabled : styles.paginationButton}
                >
                  Précédent
                </button>
                
                {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    style={number === currentPage ? styles.paginationButtonActive : styles.paginationButton}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                  style={currentPage === Math.ceil(users.length / usersPerPage) ? styles.paginationButtonDisabled : styles.paginationButton}
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {viewMode === 'form' && (
        <UserForm user={editingUser} onSave={handleSaved} onCancel={handleCancel} />
      )}
    </div>
  );
}

const DashboardAdmin = ({ onLogout }) => {
  const name = localStorage.getItem('name') || 'Admin';

  return (
    <div style={styles.container}>
      <header
        style={{
          background: "linear-gradient(135deg, rgb(216, 95, 95) 0%, #b71c1c 100%)",
          color: "white",
          padding: "20px 0",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "95%",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: "150px",
                height: "60px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
            <h2 style={{ margin: 0 }}>
              Bonjour, <span style={{ fontWeight: "600" }}>{name}</span>
            </h2>
          </div>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid white",
              borderRadius: 25,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "background-color 0.3s, color 0.3s",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>
      <main style={styles.content}>
        <UserList />
      </main>
    </div>
  );
};

const styleUserForm = {
  form: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 },
  label: { display: 'flex', flexDirection: 'column', fontWeight: 600, fontSize: 14, color: '#333' },
  input: { marginTop: 6, padding: '10px 12px', borderRadius: 6, border: '1.5px solid #ccc', fontSize: 14 },
  buttonSubmit: { backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, cursor: 'pointer' },
  buttonCancel: { backgroundColor: '#ccc', color: '#444', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, cursor: 'pointer' },
  error: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: "'Segoe UI', sans-serif" },
  content: { maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' },
  sectionTitle: { color: '#b71c1c', fontSize: 22, marginBottom: 16 },
  addButton: { padding: '10px 20px', backgroundColor: '#d32f2f', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', marginBottom: 20, fontWeight: 600 },
  tableContainer: { backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { padding: '14px 15px', textAlign: 'left', fontWeight: 600, color: '#424242', borderBottom: '2px solid #ddd', backgroundColor: '#f8f8f8' },
  tableRow: { transition: 'background-color 0.2s ease' },
  tableCell: { padding: '12px 15px', color: '#616161', fontSize: 14, borderBottom: '1px solid #eee' },
  roleBadge: { 
    display: 'inline-block', 
    padding: '5px 12px', 
    borderRadius: 20, 
    fontSize: 12, 
    fontWeight: 600, 
    textTransform: 'capitalize',
    backgroundColor: '#f0f0f0', // Couleur neutre
    color: '#616161' // Couleur de texte neutre
  },
  editButton: { backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', marginRight: 10, cursor: 'pointer', fontSize: 13 },
  deleteButton: { backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  successMessage: { backgroundColor: '#e8f5e9', color: '#2e7d32', borderLeft: '5px solid #4caf50', padding: 12, marginBottom: 20, borderRadius: 4 },
  errorMessage: { backgroundColor: '#ffebee', color: '#c62828', borderLeft: '5px solid #f44336', padding: 12, marginBottom: 20, borderRadius: 4 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', gap: '8px' },
  paginationButton: { padding: '8px 12px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', color: '#333' },
  paginationButtonActive: { padding: '8px 12px', backgroundColor: '#d32f2f', border: '1px solid #d32f2f', borderRadius: 4, cursor: 'pointer', color: 'white', fontWeight: 'bold' },
  paginationButtonDisabled: { padding: '8px 12px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: 4, color: '#999', cursor: 'not-allowed' }
};

export default DashboardAdmin;