const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// Fonction pour obtenir la date tunisienne
const getTunisianDate = () => {
  const now = new Date();
  // Tunisie est UTC+1
  now.setHours(now.getHours() + 1);
  return now.toISOString().split('T')[0];
};

// Routes
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY date_demande DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/demande', async (req, res) => {
  try {
    const { user_id, title } = req.body;
    const dateDemande = getTunisianDate();

    await db.query(
      'INSERT INTO documents (user_id, title, statut, date_demande) VALUES (?, ?, ?, ?)',
      [user_id, title, 'en_attente', dateDemande]
    );

    res.status(201).json({ message: 'Demande envoyée' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/dossier', upload.fields([
  { name: 'carte_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'releve_notes', maxCount: 1 },
  { name: 'doc_sante', maxCount: 1 }
]), async (req, res) => {
  try {
    const { user_id, niveau_etude } = req.body;
    const dateDemande = getTunisianDate();

    await db.query(
      `INSERT INTO documents 
       (user_id, title, statut, carte_identite, diplome, releve_notes, doc_sante, niveau_etude, date_demande) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        'dossier_physique',
        'en_attente',
        req.files.carte_identite[0].filename,
        req.files.diplome[0].filename,
        req.files.releve_notes[0].filename,
        req.files.doc_sante[0].filename,
        niveau_etude,
        dateDemande
      ]
    );

    res.status(201).json({ message: 'Dossier envoyé' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;