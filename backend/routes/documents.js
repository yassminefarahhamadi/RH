const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const getTunisianDate = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().split('T')[0];
};

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

// Get user documents
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

// Create new attestation request
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

// Cancel a request
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

// Create or update physical dossier
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

// Update physical dossier
router.put('/:id', upload.fields([
  { name: 'carte_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'releve_notes', maxCount: 1 },
  { name: 'doc_sante', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, niveau_etude } = req.body;
    
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dossier non trouvé' });
    }
    
    const currentDoc = rows[0];
    const updateData = {
      niveau_etude,
      date_demande: getTunisianDate()
    };
    
    // Handle file updates
    if (req.files.carte_identite) {
      await deleteOldFiles(id);
      updateData.carte_identite = req.files.carte_identite[0].filename;
    }
    if (req.files.diplome) {
      updateData.diplome = req.files.diplome[0].filename;
    }
    if (req.files.releve_notes) {
      updateData.releve_notes = req.files.releve_notes[0].filename;
    }
    if (req.files.doc_sante) {
      updateData.doc_sante = req.files.doc_sante[0].filename;
    }
    
    await db.query('UPDATE documents SET ? WHERE id = ?', [updateData, id]);
    res.json({ message: 'Dossier mis à jour' });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;