export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'adet' | 'g' | 'kg' | 'ml' | 'l' | 'paket' | 'kavanoz' | 'şişe' | 'diş';
  emoji: string;
  expiryDate?: string;
  category?: string;
}

export interface Recipe {
  id: string | number;
  title: string;
  image: string;
  readyInMinutes: number;
  difficulty?: 'Kolay' | 'Orta' | 'Zor';
  extendedIngredients: Ingredient[];
  analyzedInstructions: AnalyzedInstruction[];
  summary?: string;
  url?: string;
}

export interface AnalyzedInstruction {
  name: string;
  steps: InstructionStep[];
}

export interface InstructionStep {
  number: number;
  step: string;
  ingredients: { id: number; name: string; image: string }[];
  equipment: { id: number; name: string; image: string }[];
}

export interface DetectedIngredient {
  tr: string;
  en: string;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  image: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  streak: number;
  level: number;
  xp: number;
  totalKgSaved: number;
  recipesCompleted: number;
  lastRecipesUpdate: string;
  dailyRecipes?: {
    suggested: Recipe[];
    breakfast: Recipe[];
    lunch: Recipe[];
    dinner: Recipe[];
    vegan: Recipe[];
    dessert: Recipe[];
  };
}
