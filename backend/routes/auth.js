const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  photoURL: { type: String },
  streak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  totalKgSaved: { type: Number, default: 0 },
  recipesCompleted: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: Date.now },
  lastRecipesUpdate: { type: String, default: "" },
  dailyRecipesDate: { type: String, default: "" }, // YYYY-MM-DD
  dailyRecipes: {
    suggested: { type: Array, default: [] },
    breakfast: { type: Array, default: [] },
    lunch: { type: Array, default: [] },
    dinner: { type: Array, default: [] },
    vegan: { type: Array, default: [] },
    dessert: { type: Array, default: [] }
  },
  favorites: [{ type: String, default: [] }]
});
const User = mongoose.model('User', UserSchema);

// Middleware to authenticate JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      email,
      password: hashedPassword,
      displayName
    });
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { 
      id: user._id, 
      email, 
      displayName, 
      streak: user.streak, 
      level: user.level, 
      xp: user.xp,
      totalKgSaved: user.totalKgSaved,
      recipesCompleted: user.recipesCompleted,
      lastRecipesUpdate: user.lastRecipesUpdate,
      dailyRecipes: user.dailyRecipes
    } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Update streak logic
    const today = new Date().setHours(0,0,0,0);
    const lastLogin = new Date(user.lastLoginDate).setHours(0,0,0,0);
    const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak += 1;
      user.xp += 50; // Daily login bonus
    } else if (diffDays > 1 || diffDays === 0) {
      if (diffDays !== 0) user.streak = 1;
      // Grant XP only once per day
      if (diffDays !== 0) user.xp += 50;
    }
    user.lastLoginDate = Date.now();
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { 
      id: user._id, 
      email: user.email, 
      displayName: user.displayName, 
      streak: user.streak, 
      level: user.level, 
      xp: user.xp,
      totalKgSaved: user.totalKgSaved,
      recipesCompleted: user.recipesCompleted,
      lastRecipesUpdate: user.lastRecipesUpdate,
      dailyRecipes: user.dailyRecipes
    } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update stats
router.put('/stats', authMiddleware, async (req, res) => {
  try {
    const { xp, level, totalKgSaved, recipesCompleted } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (xp !== undefined) user.xp = xp;
    if (level !== undefined) user.level = level;
    if (totalKgSaved !== undefined) user.totalKgSaved = totalKgSaved;
    if (recipesCompleted !== undefined) user.recipesCompleted = recipesCompleted;
    if (req.body.lastRecipesUpdate !== undefined) user.lastRecipesUpdate = req.body.lastRecipesUpdate;
    if (req.body.dailyRecipes !== undefined) user.dailyRecipes = req.body.dailyRecipes;

    await user.save();
    res.json({ 
      xp: user.xp, 
      level: user.level, 
      streak: user.streak,
      totalKgSaved: user.totalKgSaved,
      recipesCompleted: user.recipesCompleted,
      lastRecipesUpdate: user.lastRecipesUpdate,
      dailyRecipes: user.dailyRecipes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.User = User;
