const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'your_secret_key_here';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, name } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role, name });
    await user.save();
    res.json({ message: 'Registered successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (!await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Invalid password.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role, name: user.name } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
