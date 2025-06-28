// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // 👈 Ajouter ceci

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);      // ✅ pour /api/auth/login et /api/auth/signup
app.use('/api/users', userRoutes);     // ✅ pour /api/users (CRUD utilisateurs)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur en écoute sur http://localhost:${PORT}`));
