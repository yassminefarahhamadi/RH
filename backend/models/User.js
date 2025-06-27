const db = require('../db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  create: async ({ name, email, password, role, type_poste, blocAffecte }) => {
    await db.query(
      'INSERT INTO users (name, email, password, role, type_poste, blocAffecte) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role, type_poste, blocAffecte]
    );
  }
};

module.exports = User;
