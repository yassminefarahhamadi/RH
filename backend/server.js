const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const congeRoutes = require('./routes/conges'); // notre route conge.js

const app = express();

// 🌐 CORS
app.use(cors());

// ✅ Support JSON et form-data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📁 Dossier uploads accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/conges', congeRoutes);

// Route test serveur
app.get('/', (req, res) => res.send('Serveur Node.js opérationnel 🚀'));

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`)
);
