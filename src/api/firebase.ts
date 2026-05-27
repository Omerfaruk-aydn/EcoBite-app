import apiClient from './apiClient';
import type { PantryItem, User } from '../types';

// --- User Profile ---
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const res = await apiClient.get(`/auth/profile/${uid}`);
    return res.data;
  } catch (err) {
    console.error('User profile fetch failed', err);
    return null;
  }
};

export const createOrUpdateUserProfile = async (userData: Partial<User> & { uid: string }) => {
  try {
    await apiClient.post('/auth/profile', userData);
  } catch (err) {
    console.error('User profile update failed', err);
  }
};

// --- Pantry ---
export const fetchPantryItems = async (): Promise<PantryItem[]> => {
  const res = await apiClient.get('/pantry');
  return res.data;
};

export const addPantryItem = async (item: Omit<PantryItem, 'id'>) => {
  const res = await apiClient.post('/pantry', item);
  return res.data;
};

export const updatePantryItem = async (id: string, data: Partial<PantryItem>) => {
  const res = await apiClient.put(`/pantry/${id}`, data);
  return res.data;
};

export const deletePantryItem = async (id: string) => {
  const res = await apiClient.delete(`/pantry/${id}`);
  return res.data;
};

// Mock subscription for backward compatibility
export const subscribeToPantry = (
  callback: (items: PantryItem[]) => void
) => {
  fetchPantryItems().then(callback);
  // Real-time could be added later with WebSockets/SSE if needed
  return () => {}; 
};

// --- Saved Recipes ---
export const fetchSavedRecipes = async () => {
  const res = await apiClient.get('/recipes/saved');
  return res.data;
};

export const saveRecipe = async (recipeId: number, recipeData: Record<string, unknown>) => {
  const res = await apiClient.post('/recipes/save', { ...recipeData, id: String(recipeId) });
  return res.data;
};

export const unsaveRecipe = async (recipeId: number | string) => {
  const res = await apiClient.delete(`/recipes/unsave/${recipeId}`);
  return res.data;
};

// --- Custom Recipes ---
export const saveCustomRecipe = async (recipeData: Record<string, unknown>) => {
  const res = await apiClient.post('/recipes/save', { ...recipeData, isCustom: true });
  return res.data;
};
