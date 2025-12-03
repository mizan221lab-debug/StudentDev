const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Score = require('../models/Score');
const User = require('../models/User');
const Subject = require('../models/Subject');

const router = express.Router();

/**
 * GET /api/export/student/:studentId
 * Export PDF of student's scores each subject & term
 */
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    const scores = await Score.find({ student: req.params.studentId }).populate('subject');
    const fileName = `exports/report_student_${student.username}_${Date.now()}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(path.join(__dirname, '..', fileName)));

    doc.fontSize(20).text('รายงานคะแนนนักเรียน');
    doc.moveDown();
    doc.fontSize(14).text(`ชื่อนักเรียน: ${student.name || student.username}`);
    doc.moveDown();
    doc.fontSize(14).text('คะแนนแยกรายวิชาและเทอม');
    doc.moveDown();

    scores.forEach(s => {
      doc.fontSize(12).text(
        `วิชา: ${s.subject.name} | เทอม: ${s.term} | คะแนน: ${s.score}`
      );
    });

    doc.end();
    // ส่งลิงค์ไฟล์ pdf กลับ
    res.json({ url: `/${fileName}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/export/subject/:subjectId
 * Export PDF of subject scores of all students
 */
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId).populate('teacher');
    const scores = await Score.find({ subject: req.params.subjectId }).populate('student');
    const fileName = `exports/report_subject_${subject.name}_${Date.now()}.pdf`;
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(path.join(__dirname, '..', fileName)));

    doc.fontSize(20).text('รายงานคะแนนรายวิชา');
    doc.moveDown();
    doc.fontSize(14).text(`ชื่อวิชา: ${subject.name}`);
    doc.fontSize(14).text(`ครู: ${subject.teacher ? subject.teacher.name : ''}`);
    doc.moveDown();

    scores.forEach(s => {
      doc.fontSize(12).text(
        `นักเรียน: ${s.student.name} | เทอม: ${s.term} | คะแนน: ${s.score}`
      );
    });

    doc.end();
    res.json({ url: `/${fileName}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
