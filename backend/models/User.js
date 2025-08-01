const db = require('../db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  create: async ({ name, email, password, role, type_poste, blocAffecte }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, type_poste, blocAffecte) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role, type_poste, blocAffecte]
    );
    return result.insertId;
  },

  update: async (id, { name, email, password, role, type_poste, blocAffecte }) => {
    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      params.push(email);
    }
    if (password !== undefined) {
      fields.push('password = ?');
      params.push(password);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      params.push(role);
    }
    if (type_poste !== undefined) {
      fields.push('type_poste = ?');
      params.push(type_poste);
    }
    if (blocAffecte !== undefined) {
      fields.push('blocAffecte = ?');
      params.push(blocAffecte);
    }

    if (fields.length === 0) {
      return 0;
    }

    params.push(id);

    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = User;
