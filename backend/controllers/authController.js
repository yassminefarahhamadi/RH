const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Email incorrect' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      id: user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📝 SIGN UP
exports.signup = async (req, res) => {
  const { name, email, password, role, type_poste, blocAffecte } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ message: 'Champs requis manquants' });

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(409).json({ message: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      type_poste,
      blocAffecte,
    });

    res.status(201).json({ message: 'Utilisateur inscrit avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
