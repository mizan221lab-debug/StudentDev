const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subject');
const scoreRoutes = require('./routes/score');
const userRoutes = require('./routes/user');
const exportRoutes = require('./routes/export');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/exports', express.static(path.join(__dirname, 'exports')));

mongoose.connect('mongodb://localhost:27017/studentdev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);

app.get('/', (req, res) => {
  res.send('StudentDev backend is running.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
