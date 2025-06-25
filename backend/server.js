const express = require('express');
const cors = require('cors'); // 👉 Ajouter ceci

const app = express();
const PORT = 5000;

app.use(cors()); // 👉 Autoriser les requêtes Cross-Origin

app.get('/', (req, res) => {
  res.send('✅ Serveur Node.js fonctionne !');
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
