const db = require('../db');

const User = {
  // 🔍 Trouver par email (utilisé dans login/signup)
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // 🔍 Trouver par ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // 🔍 Liste de tous les utilisateurs
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  // ➕ Créer un utilisateur
  create: async ({ name, email, password, role, type_poste, blocAffecte }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, type_poste, blocAffecte) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role, type_poste, blocAffecte]
    );
    return result.insertId;
  },

  // ✏️ Modifier un utilisateur
  update: async (id, { name, email, role, type_poste, blocAffecte }) => {
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, type_poste = ?, blocAffecte = ? WHERE id = ?',
      [name, email, role, type_poste, blocAffecte, id]
    );
    return result.affectedRows;
  },

  // 🗑️ Supprimer un utilisateur
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = User;
 