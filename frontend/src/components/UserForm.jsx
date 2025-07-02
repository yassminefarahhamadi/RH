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
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        type_poste: user.type_poste || '',
        blocAffecte: user.blocAffecte || '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (user) {
        await axios.put(`http://localhost:5000/api/users/${user.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/users', formData);
      }
      onSave();
      if (!user) {
        setFormData({ 
          name: '', 
          email: '', 
          role: 'employe', 
          type_poste: '', 
          blocAffecte: '', 
          password: '' 
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Nom complet</label>
        <input 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required
          style={styles.formInput}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Email</label>
        <input 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          required
          style={styles.formInput}
        />
      </div>

      {!user && (
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Mot de passe</label>
          <input 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            required
            style={styles.formInput}
          />
        </div>
      )}

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Rôle</label>
        <select 
          name="role" 
          value={formData.role} 
          onChange={handleChange}
          style={styles.formSelect}
        >
          <option value="admin">Administrateur</option>
          <option value="admin_rh">Admin RH</option>
          <option value="admin_etudes">Admin Études</option>
          <option value="employe">Employé</option>
          <option value="etudiant">Étudiant</option>
        </select>
      </div>

      {formData.role === 'employe' && (
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Type de poste</label>
          <input 
            name="type_poste" 
            value={formData.type_poste} 
            onChange={handleChange}
            style={styles.formInput}
          />
        </div>
      )}

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Bloc affecté</label>
        <input 
          name="blocAffecte" 
          value={formData.blocAffecte} 
          onChange={handleChange}
          style={styles.formInput}
        />
      </div>

      <div style={styles.formActions}>
        <button type="submit" style={styles.submitButton}>
          {user ? 'Mettre à jour' : 'Créer utilisateur'}
        </button>
        {user && (
          <button 
            type="button" 
            onClick={() => onSave()} 
            style={styles.cancelButton}
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: 'grid',
    gap: '20px',
  },
  formGroup: {
    display: 'grid',
    gap: '8px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#616161',
  },
  formInput: {
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  },
  formSelect: {
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    backgroundColor: '#fafafa',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  submitButton: {
    padding: '12px 20px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1,
  },
  cancelButton: {
    padding: '12px 20px',
    backgroundColor: '#e0e0e0',
    color: '#616161',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1,
  },
};

export default UserForm;