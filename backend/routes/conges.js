const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔄 GET – Liste des congés d’un employé
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM conges WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur chargement congés', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ➕ POST – Nouvelle demande de congé
router.post('/', async (req, res) => {
  const { user_id, date_debut, date_fin, motif } = req.body;

  if (!user_id || !date_debut || !date_fin) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }

  try {
    await db.query(
      'INSERT INTO conges (user_id, date_debut, date_fin, motif) VALUES (?, ?, ?, ?)',
      [user_id, date_debut, date_fin, motif]
    );
    res.status(201).json({ message: 'Demande de congé envoyée' });
  } catch (err) {
    console.error('Erreur insertion congé', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
