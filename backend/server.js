const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const congeRoutes = require('./routes/conges');

const app = express();

// 🌐 CORS
app.use(cors());

// ✅ Support JSON et form-data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📁 Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Dossier uploads créé');
}

// Servir les fichiers statiques
app.use('/uploads', express.static(uploadsDir));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/conges', congeRoutes);

// Route de test pour vérifier l'accès aux fichiers
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Fichier non trouvé' });
  }
});

// Route test serveur
app.get('/', (req, res) => res.send('Serveur Node.js opérationnel 🚀'));

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`)
);