const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  id: Number,
  name: String,
  amount: Number,
  unit: String,
  image: String
});

const StepSchema = new mongoose.Schema({
  number: Number,
  step: String
});

const InstructionSchema = new mongoose.Schema({
  name: String,
  steps: [StepSchema]
});

const RecipeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  image: { type: String },
  readyInMinutes: { type: Number, default: 30 },
  difficulty: { type: String, enum: ['Kolay', 'Orta', 'Zor'], default: 'Orta' },
  extendedIngredients: [IngredientSchema],
  analyzedInstructions: [InstructionSchema],
  summary: { type: String },
  tags: [String], // searchable tags like 'breakfast', 'domates', 'vegan'
  createdAt: { type: Date, default: Date.now }
});

// Text index for smart search by tags or title
RecipeSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', RecipeSchema);
