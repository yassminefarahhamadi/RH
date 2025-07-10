const express = require('express');
const router = express.Router();
const db = require('../db');

// GET – Liste de toutes les demandes de congés avec infos employé
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS employe_nom, u.email AS employe_email 
       FROM conges c 
       JOIN users u ON c.user_id = u.id 
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur chargement congés', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET – Liste des congés d’un employé spécifique
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

// POST – Nouvelle demande de congé
router.post('/', async (req, res) => {
  const { user_id, date_debut, date_fin, motif } = req.body;

  if (!user_id || !date_debut || !date_fin) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }

  try {
    await db.query(
      'INSERT INTO conges (user_id, date_debut, date_fin, motif, statut, created_at) VALUES (?, ?, ?, ?, "en_attente", NOW())',
      [user_id, date_debut, date_fin, motif]
    );
    res.status(201).json({ message: 'Demande de congé envoyée' });
  } catch (err) {
    console.error('Erreur insertion congé', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT – Mettre à jour le statut d’un congé (valider/refuser)
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  if (!['accepte', 'refuse'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  try {
    const [result] = await db.query(
      'UPDATE conges SET statut = ? WHERE id = ?',
      [statut, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Demande de congé non trouvée' });
    }

    res.json({ message: `Congé ${statut}` });
  } catch (err) {
    console.error('Erreur mise à jour statut congé', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
