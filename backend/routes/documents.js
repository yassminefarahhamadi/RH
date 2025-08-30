const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration Multer pour uploads
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

// Fonction pour récupérer la date au fuseau tunisien (format YYYY-MM-DD)
const getTunisianDate = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().split('T')[0];
};

// Supprimer les anciens fichiers liés à un document
const deleteOldFiles = async (docId) => {
  try {
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [docId]);
    if (rows.length === 0) return;

    const doc = rows[0];
    const files = [
      doc.carte_identite,
      doc.diplome,
      doc.releve_notes,
      doc.doc_sante
    ].filter(Boolean);

    files.forEach(file => {
      const filePath = path.join(__dirname, '../uploads', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error('Error deleting old files:', err);
  }
};

// GET toutes les demandes avec infos utilisateur (hors dossiers physiques)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, u.name AS user_name, u.email AS user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.title != 'Dossier physique'
       ORDER BY d.date_demande DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur chargement demandes', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET tous les dossiers physiques avec infos utilisateur
router.get('/dossiers/physiques', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, u.name AS user_name, u.email AS user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.title = 'Dossier physique'
       ORDER BY d.date_demande DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur chargement dossiers physiques', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET demandes d’un utilisateur (toutes, y compris dossiers physiques)
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

// POST nouvelle demande simple d’attestation
router.post('/demande', async (req, res) => {
  try {
    const { user_id, title } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM documents WHERE user_id = ? AND title = ? AND statut IN ("en_attente", "approuvé")',
      [user_id, title]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà une demande en cours pour ce type d\'attestation' });
    }

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

// DELETE annuler une demande (seulement si en_attente)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (rows[0].statut !== 'en_attente') {
      return res.status(400).json({ message: 'Seules les demandes en attente peuvent être annulées' });
    }

    await db.query('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ message: 'Demande annulée' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST créer un dossier physique avec fichiers
router.post('/dossier', upload.fields([
  { name: 'carte_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'releve_notes', maxCount: 1 },
  { name: 'doc_sante', maxCount: 1 }
]), async (req, res) => {
  try {
    const { user_id, niveau_etude } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM documents WHERE user_id = ? AND title = "Dossier physique"',
      [user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà un dossier physique. Utilisez la modification.' });
    }

    const dateDemande = getTunisianDate();

    await db.query(
      `INSERT INTO documents 
       (user_id, title, statut, carte_identite, diplome, releve_notes, doc_sante, niveau_etude, date_demande) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        'Dossier physique',
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

// PUT modifier un dossier physique avec fichiers
router.put('/:id', upload.fields([
  { name: 'carte_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'releve_notes', maxCount: 1 },
  { name: 'doc_sante', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { niveau_etude } = req.body;

    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }

    const updateData = { niveau_etude, date_demande: getTunisianDate() };

    if (req.files.carte_identite) {
      await deleteOldFiles(id);
      updateData.carte_identite = req.files.carte_identite[0].filename;
    }
    if (req.files.diplome) updateData.diplome = req.files.diplome[0].filename;
    if (req.files.releve_notes) updateData.releve_notes = req.files.releve_notes[0].filename;
    if (req.files.doc_sante) updateData.doc_sante = req.files.doc_sante[0].filename;

    await db.query('UPDATE documents SET ? WHERE id = ?', [updateData, id]);
    res.json({ message: 'Dossier mis à jour' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d’une demande (accepter/refuser)
// Autorise aussi la mise à jour des dossiers physiques
router.put('/:id/statut', async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  // Accept only 'validée', 'refusée' or 'en_attente'
  if (!['validée', 'refusée', 'en_attente'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    const [result] = await db.query(
      'UPDATE documents SET statut = ? WHERE id = ?',
      [statut, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    res.json({ message: `Demande ${statut}` });
  } catch (err) {
    console.error('Erreur mise à jour statut', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
