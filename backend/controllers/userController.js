const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.create = async (req, res) => {
  try {
    const id = await User.create(req.body);
    res.status(201).json({ message: 'Utilisateur créé', id });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.update = async (req, res) => {
  try {
    await User.update(req.params.id, req.body);
    res.json({ message: 'Utilisateur modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.remove = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getFiltered = async (req, res) => {
  const { bloc, poste } = req.query;
  try {
    let sql = 'SELECT * FROM users WHERE role = "employe"';
    const params = [];

    if (bloc) {
      sql += ' AND blocAffecte = ?';
      params.push(bloc);
    }
    if (poste) {
      sql += ' AND type_poste = ?';
      params.push(poste);
    }

    const [rows] = await require('../db').query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
