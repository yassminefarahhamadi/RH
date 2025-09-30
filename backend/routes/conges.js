const express = require('express');
const router = express.Router();
const db = require('../db');
const sendEmail = require('../utils/mailer'); 

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

// POST – Nouvelle demande de congé + notification email à l'admin RH
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

    
    const [rows] = await db.query('SELECT name, email FROM users WHERE id = ?', [user_id]);
    const employe = rows[0];

    if (employe) {
      
      const subject = " Nouvelle demande de congé à valider";
      const html = `
        <p>Bonjour Admin RH,</p>
        <p>L'employé <b>${employe.name}</b> a soumis une nouvelle demande de congé :</p>
        <ul>
          <li>Date début : <b>${date_debut}</b></li>
          <li>Date fin : <b>${date_fin}</b></li>
          <li>Motif : ${motif || '-'}</li>
        </ul>
        <p>Veuillez la valider ou la refuser dans le tableau de bord RH.</p>
        <p>Cordialement,<br>Votre application RH</p>
      `;

      
      await sendEmail(process.env.EMAIL_ADMIN_RH, subject, html);
    }

    res.status(201).json({ message: 'Demande de congé envoyée et notification à l’admin RH' });
  } catch (err) {
    console.error('Erreur insertion congé', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


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

    
    const [rows] = await db.query(
      `SELECT u.email, u.name, c.date_debut, c.date_fin, c.motif
       FROM conges c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    const employe = rows[0];
    if (employe) {
      const subject = statut === 'accepte' 
        ? " Votre congé a été accepté" 
        : " Votre congé a été refusé";

      const html = `
        <p>Bonjour ${employe.name},</p>
        <p>Votre demande de congé du <b>${employe.date_debut}</b> au <b>${employe.date_fin}</b> a été <b>${statut}</b>.</p>
        <p>Motif : ${employe.motif || '-'}</p>
        <p>Cordialement,<br>Service RH</p>
      `;

      
      await sendEmail(employe.email, subject, html);
    }

    res.json({ message: `Congé ${statut} et email envoyé à l'employé` });
  } catch (err) {
    console.error('Erreur mise à jour statut congé', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
