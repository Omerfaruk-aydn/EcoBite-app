const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://db:27017/ecobite';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('EcoBite API is running');
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));
// Pantry Routes
app.use('/api/pantry', require('./routes/pantry'));
// Recipe Routes
app.use('/api/recipes', require('./routes/recipes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
