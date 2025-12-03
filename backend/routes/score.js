const express = require('express');
const Score = require('../models/Score');
const router = express.Router();

// Create or update score
router.post('/', async (req, res) => {
  try {
    const { studentId, subjectId, term, score } = req.body;
    let found = await Score.findOne({ student: studentId, subject: subjectId, term });
    if (found) {
      found.score = score;
      await found.save();
      return res.json(found);
    }
    const newScore = new Score({ student: studentId, subject: subjectId, term, score });
    await newScore.save();
    res.json(newScore);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get scores (query: studentId/subjectId/term)
router.get('/', async (req, res) => {
  const { studentId, subjectId, term } = req.query;
  let query = {};
  if (studentId) query.student = studentId;
  if (subjectId) query.subject = subjectId;
  if (term) query.term = parseInt(term);
  try {
    const scores = await Score.find(query).populate('student subject');
    res.json(scores);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update score
router.put('/:scoreId', async (req, res) => {
  try {
    const { score } = req.body;
    const updated = await Score.findByIdAndUpdate(
      req.params.scoreId,
      { score: score },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete score
router.delete('/:scoreId', async (req, res) => {
  try {
    await Score.findByIdAndDelete(req.params.scoreId);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
