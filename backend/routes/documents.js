const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/mailer');
const AIOpenSourceVerification = require('../utils/aiOpenSourceVerification');
require('dotenv').config();

const ADMIN_EMAIL = process.env.ADMIN_ETUDES_EMAIL;

// 📂 Configuration Multer (sécurité améliorée)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/\s+/g, '_'); // supprime les espaces
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

// 🕒 Fonction date fuseau Tunis
const getTunisianDate = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().split('T')[0];
};

// 🗑️ Supprimer les anciens fichiers d'un document
const deleteOldFiles = async (docId) => {
  try {
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [docId]);
    if (!rows.length) return;
    const doc = rows[0];
    const files = [doc.carte_identite, doc.diplome, doc.releve_notes, doc.doc_sante].filter(Boolean);
    files.forEach(file => {
      const filePath = path.join(__dirname, '../uploads', file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Fichier supprimé : ${file}`);
      }
    });
  } catch (err) {
    console.error('❌ Erreur lors de la suppression des anciens fichiers:', err);
  }
};

// 📄 GET toutes les demandes hors dossiers physiques
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.id, d.title, d.statut, d.date_demande, u.name AS user_name, u.email AS user_email 
       FROM documents d
       INNER JOIN users u ON d.user_id = u.id
       WHERE d.title != 'Dossier physique'
       ORDER BY d.date_demande DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur chargement demandes:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 📄 GET dossiers physiques
router.get('/dossiers/physiques', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.id, d.title, d.statut, d.date_demande, d.carte_identite, d.diplome, d.releve_notes, d.doc_sante,
              d.niveau_etude, d.ai_verification, d.ai_suggestion,
              u.name AS user_name, u.email AS user_email
       FROM documents d
       INNER JOIN users u ON d.user_id = u.id
       WHERE d.title = 'Dossier physique'
       ORDER BY d.date_demande DESC`
    );
    console.log('📦 Résultat dossiers physiques:', rows);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur chargement dossiers physiques:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👤 GET demandes d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY date_demande DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur récupération demandes utilisateur:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ➕ POST nouvelle demande simple
router.post('/demande', async (req, res) => {
  try {
    const { user_id, title } = req.body;
    if (!user_id || !title) return res.status(400).json({ message: 'Champs manquants' });

    const [existing] = await db.query(
      'SELECT id FROM documents WHERE user_id = ? AND title = ? AND statut IN ("en_attente", "validée")',
      [user_id, title]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà une demande en cours pour ce type d\'attestation' });
    }

    await db.query(
      'INSERT INTO documents (user_id, title, statut, date_demande) VALUES (?, ?, ?, ?)',
      [user_id, title, 'en_attente', getTunisianDate()]
    );

    // 📧 Notifier l'étudiant + admin
    const [userRows] = await db.query('SELECT email, name FROM users WHERE id = ?', [user_id]);
    if (userRows.length) {
      const user = userRows[0];
      sendEmail(user.email, `Votre demande "${title}" a été envoyée`, 
        `<p>Bonjour ${user.name},</p><p>Votre demande "${title}" a été enregistrée.</p>`);
      if (ADMIN_EMAIL) {
        sendEmail(ADMIN_EMAIL, `Nouvelle demande d'attestation`, 
          `<p>L'étudiant <strong>${user.name}</strong> a soumis une demande : <strong>${title}</strong>.</p>`);
      }
    }

    res.status(201).json({ message: 'Demande enregistrée avec succès' });
  } catch (err) {
    console.error('❌ Erreur création demande:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ❌ DELETE annuler une demande
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);

    if (!rows.length) return res.status(404).json({ message: 'Demande non trouvée' });
    if (rows[0].statut !== 'en_attente') {
      return res.status(400).json({ message: 'Seules les demandes en attente peuvent être annulées' });
    }

    await db.query('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ message: 'Demande annulée' });
  } catch (err) {
    console.error('❌ Erreur suppression demande:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🆕 POST créer un dossier physique
router.post('/dossier', upload.fields([
  { name: 'carte_identite', maxCount: 1 },
  { name: 'diplome', maxCount: 1 },
  { name: 'releve_notes', maxCount: 1 },
  { name: 'doc_sante', maxCount: 1 }
]), async (req, res) => {
  try {
    const { user_id, niveau_etude } = req.body;
    if (!user_id) return res.status(400).json({ message: 'Utilisateur manquant' });

    const [existing] = await db.query(
      'SELECT id FROM documents WHERE user_id = ? AND title = "Dossier physique"',
      [user_id]
    );
    if (existing.length > 0) return res.status(400).json({ message: 'Dossier physique déjà existant' });

    await db.query(
      `INSERT INTO documents 
       (user_id, title, statut, carte_identite, diplome, releve_notes, doc_sante, niveau_etude, date_demande) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        'Dossier physique',
        'en_attente',
        req.files.carte_identite?.[0]?.filename || null,
        req.files.diplome?.[0]?.filename || null,
        req.files.releve_notes?.[0]?.filename || null,
        req.files.doc_sante?.[0]?.filename || null,
        niveau_etude || null,
        getTunisianDate()
      ]
    );

    res.status(201).json({ message: 'Dossier envoyé' });
  } catch (err) {
    console.error('❌ Erreur création dossier:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ♻️ PUT modifier un dossier physique (CORRIGÉ)
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
    if (!rows.length) return res.status(404).json({ message: 'Dossier non trouvé' });

    const oldDoc = rows[0];
    const updateData = { niveau_etude, date_demande: getTunisianDate() };

    // Conserver les anciens fichiers si aucun nouveau n'est fourni
    updateData.carte_identite = req.files.carte_identite 
      ? req.files.carte_identite[0].filename 
      : oldDoc.carte_identite;
    
    updateData.diplome = req.files.diplome 
      ? req.files.diplome[0].filename 
      : oldDoc.diplome;
    
    updateData.releve_notes = req.files.releve_notes 
      ? req.files.releve_notes[0].filename 
      : oldDoc.releve_notes;
    
    updateData.doc_sante = req.files.doc_sante 
      ? req.files.doc_sante[0].filename 
      : oldDoc.doc_sante;

    // Supprimer seulement les anciens fichiers qui sont remplacés
    if (req.files.carte_identite && oldDoc.carte_identite) {
      const oldFilePath = path.join(__dirname, '../uploads', oldDoc.carte_identite);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }
    if (req.files.diplome && oldDoc.diplome) {
      const oldFilePath = path.join(__dirname, '../uploads', oldDoc.diplome);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }
    if (req.files.releve_notes && oldDoc.releve_notes) {
      const oldFilePath = path.join(__dirname, '../uploads', oldDoc.releve_notes);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }
    if (req.files.doc_sante && oldDoc.doc_sante) {
      const oldFilePath = path.join(__dirname, '../uploads', oldDoc.doc_sante);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    await db.query('UPDATE documents SET ? WHERE id = ?', [updateData, id]);
    res.json({ message: 'Dossier mis à jour' });
  } catch (err) {
    console.error('❌ Erreur mise à jour dossier:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✏️ PUT mise à jour statut avec notification
router.put('/:id/statut', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!['validée', 'refusée', 'en_attente'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Demande non trouvée' });

    await db.query('UPDATE documents SET statut = ? WHERE id = ?', [statut, id]);

    // 📧 Notifier l'étudiant
    const [userRows] = await db.query('SELECT email, name FROM users WHERE id = ?', [rows[0].user_id]);
    if (userRows.length) {
      sendEmail(userRows[0].email, `Votre demande "${rows[0].title}" a été ${statut}`,
        `<p>Bonjour ${userRows[0].name},</p><p>Votre demande a été <strong>${statut}</strong>.</p>`);
    }

    res.json({ message: `Demande ${statut} et email envoyé` });
  } catch (err) {
    console.error('❌ Erreur mise à jour statut:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔍 POST déclencher manuellement la vérification IA
router.post('/:id/verify-ai', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le dossier
    const [rows] = await db.query(
      `SELECT d.*, u.name AS user_name, u.email AS user_email 
       FROM documents d
       INNER JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [id]
    );
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Dossier non trouvé' });
    }
    
    const dossier = rows[0];
    
    // Vérifier que c'est un dossier physique
    if (dossier.title !== 'Dossier physique') {
      return res.status(400).json({ success: false, message: 'Seuls les dossiers physiques peuvent être vérifiés par IA' });
    }
    
    const aiResults = {};
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Vérifier chaque document présent
    if (dossier.carte_identite) {
      const filePath = path.join(uploadsDir, dossier.carte_identite);
      if (fs.existsSync(filePath)) {
        aiResults.carte_identite = await AIOpenSourceVerification.analyzeDocument(
          filePath,
          'carte_identite'
        );
      } else {
        aiResults.carte_identite = {
          isValid: false,
          issues: ['Fichier introuvable'],
          error: 'Fichier non trouvé sur le serveur'
        };
      }
    }
    
    if (dossier.diplome) {
      const filePath = path.join(uploadsDir, dossier.diplome);
      if (fs.existsSync(filePath)) {
        aiResults.diplome = await AIOpenSourceVerification.analyzeDocument(
          filePath,
          'diplome'
        );
      } else {
        aiResults.diplome = {
          isValid: false,
          issues: ['Fichier introuvable'],
          error: 'Fichier non trouvé sur le serveur'
        };
      }
    }
    
    if (dossier.releve_notes) {
      const filePath = path.join(uploadsDir, dossier.releve_notes);
      if (fs.existsSync(filePath)) {
        aiResults.releve_notes = await AIOpenSourceVerification.analyzeDocument(
          filePath,
          'releve_notes'
        );
      } else {
        aiResults.releve_notes = {
          isValid: false,
          issues: ['Fichier introuvable'],
          error: 'Fichier non trouvé sur le serveur'
        };
      }
    }
    
    if (dossier.doc_sante) {
      const filePath = path.join(uploadsDir, dossier.doc_sante);
      if (fs.existsSync(filePath)) {
        aiResults.doc_sante = await AIOpenSourceVerification.analyzeDocument(
          filePath,
          'doc_sante'
        );
      } else {
        aiResults.doc_sante = {
          isValid: false,
          issues: ['Fichier introuvable'],
          error: 'Fichier non trouvé sur le serveur'
        };
      }
    }
    
    // Déterminer la suggestion globale
    let allValid = true;
    let hasCriticalIssue = false;
    
    Object.values(aiResults).forEach(result => {
      if (result && !result.isValid) {
        allValid = false;
        if (result.issues && result.issues.some(issue => 
          issue.includes('non pertinent') || issue.includes('Aucun texte significatif'))) {
          hasCriticalIssue = true;
        }
      }
    });
    
    let aiSuggestion = 'suggestion_validation';
    if (hasCriticalIssue) {
      aiSuggestion = 'suggestion_rejet';
    } else if (!allValid) {
      aiSuggestion = null; // Aucune suggestion claire
    }
    
    // Mettre à jour la base de données
    await db.query(
      'UPDATE documents SET ai_verification = ?, ai_suggestion = ? WHERE id = ?',
      [JSON.stringify(aiResults), aiSuggestion, id]
    );
    
    res.json({ 
      success: true, 
      message: 'Vérification IA terminée',
      results: aiResults
    });
    
  } catch (err) {
    console.error('❌ Erreur vérification IA:', err.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification IA', error: err.message });
  }
});

module.exports = router;