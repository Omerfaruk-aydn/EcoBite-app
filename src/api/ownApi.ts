import apiClient from './apiClient';
import type { Recipe } from '../types';

export const fetchDailyRecipes = async (): Promise<Recipe[]> => {
  const { data } = await apiClient.get('/recipes/daily?type=breakfast');
  return data;
};

export const fetchDailyRecipesByType = async (type: string, number: number = 3): Promise<Recipe[]> => {
  // If we need specifically requested number, backend currently returns 3 random. 
  // For the frontend architecture, 3 is standard. We pass type directly.
  const { data } = await apiClient.get(`/recipes/daily?type=${type}`);
  return data.slice(0, number);
};

export const fetchRecipesByIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  const { data } = await apiClient.post('/recipes/smart-search', { ingredients });
  return data;
};

export const fetchRecipeDetail = async (id: string | number): Promise<Recipe> => {
  const { data } = await apiClient.get(`/recipes/${id}`);
  return data;
};

export const fetchAllRecipes = async (category: string = 'all', page: number = 1, limit: number = 20): Promise<{ recipes: Recipe[], pagination: any }> => {
  const { data } = await apiClient.get(`/recipes/all?category=${category}&page=${page}&limit=${limit}`);
  return data;
};
