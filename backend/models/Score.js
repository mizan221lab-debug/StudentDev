const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  term: { type: Number, enum: [1, 2], required: true },
  score: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
