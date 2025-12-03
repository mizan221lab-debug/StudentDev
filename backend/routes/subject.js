const express = require('express');
const Subject = require('../models/Subject');
const User = require('../models/User');
const router = express.Router();

// Create subject
router.post('/', async (req, res) => {
  try {
    const { name, teacherId, studentIds } = req.body;
    const subject = new Subject({ name, teacher: teacherId, students: studentIds });
    await subject.save();
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher students');
    res.json(subjects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read by teacher
router.get('/by-teacher/:teacherId', async (req, res) => {
  try {
    const subjects = await Subject.find({ teacher: req.params.teacherId }).populate('students');
    res.json(subjects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read by student
router.get('/by-student/:studentId', async (req, res) => {
  try {
    const subjects = await Subject.find({ students: req.params.studentId }).populate('teacher');
    res.json(subjects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update subject
router.put('/:subjectId', async (req, res) => {
  try {
    const { name, teacher, students } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.subjectId,
      { name, teacher, students },
      { new: true }
    ).populate('teacher students');
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete subject
router.delete('/:subjectId', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.subjectId);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
