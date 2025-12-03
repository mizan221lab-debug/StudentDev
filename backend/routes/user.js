const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('subjects');
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password').populate('subjects');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user
router.put('/:userId', async (req, res) => {
  try {
    const { name, username, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      { name, username, role },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
