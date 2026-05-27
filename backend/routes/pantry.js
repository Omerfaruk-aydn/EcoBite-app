const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

// Pantry Model
const PantrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  quantity: { type: String },
  expiryDate: { type: String },
  unit: { type: String },
  addedAt: { type: Date, default: Date.now }
});
const PantryItem = mongoose.model('PantryItem', PantrySchema);

// Get all pantry items for user
router.get('/', auth, async (req, res) => {
  try {
    const items = await PantryItem.find({ userId: req.user.id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add pantry item
router.post('/', auth, async (req, res) => {
  try {
    const newItem = new PantryItem({
      ...req.body,
      userId: req.user.id
    });
    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update pantry item
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await PantryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete pantry item
router.delete('/:id', auth, async (req, res) => {
  try {
    await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
