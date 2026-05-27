import { useState, useCallback } from 'react';
import {
  fetchDailyRecipes,
  fetchDailyRecipesByType,
  fetchRecipesByIngredients,
  fetchRecipeDetail
} from '../api/ownApi';
import { useAppStore } from '../store/useAppStore';
import type { Recipe, DetectedIngredient } from '../types';

export const useRecipes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    setSuggestedRecipes,
    setDailyCategorized,
    lastRecipesUpdate,
    setLastRecipesUpdate,
    updateStats
  } = useAppStore();

  const loadDailyRecipes = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const { suggestedRecipes, user } = useAppStore.getState();

    // If we have data for today in store, return it
    if (lastRecipesUpdate === today && suggestedRecipes.length > 0) {
      return suggestedRecipes;
    }

    try {
      setLoading(true);
      setError(null);
      // Our backend already returns recipes in Turkish — no translation needed
      const recipes = await fetchDailyRecipes();

      setSuggestedRecipes(recipes);
      setLastRecipesUpdate(today);

      // Persist to backend
      const currentDailyRecipes = user?.dailyRecipes || { suggested: [], breakfast: [], lunch: [], dinner: [], vegan: [], dessert: [] };
      await updateStats({
        lastRecipesUpdate: today,
        dailyRecipes: { ...currentDailyRecipes, suggested: recipes }
      } as any, true);

      return recipes;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tarifler yüklenemedi';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setSuggestedRecipes, lastRecipesUpdate, setLastRecipesUpdate, updateStats]);

  const loadCategorizedDailyRecipes = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const { dailyBreakfast, user } = useAppStore.getState();

    // If we already updated today and have data, don't re-fetch
    if (lastRecipesUpdate === today && dailyBreakfast.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const typesToFetch: Array<'breakfast' | 'lunch' | 'dinner' | 'vegan' | 'dessert'> = ['breakfast', 'lunch', 'dinner', 'vegan', 'dessert'];

      const newCategories: Record<string, Recipe[]> = {};

      await Promise.all(typesToFetch.map(async (type) => {
        // Our backend returns Turkish recipes directly — no translation needed
        const recipes = await fetchDailyRecipesByType(type, 3);
        setDailyCategorized(type, recipes);
        newCategories[type] = recipes;
      }));

      setLastRecipesUpdate(today);

      // Persist to backend
      const currentDailyRecipes = user?.dailyRecipes || { suggested: [], breakfast: [], lunch: [], dinner: [], vegan: [], dessert: [] };
      await updateStats({
        lastRecipesUpdate: today,
        dailyRecipes: {
          ...currentDailyRecipes,
          ...newCategories
        }
      } as any, true);

    } catch (err: unknown) {
      console.error('Failed to load categorized recipes:', err);
      const message = err instanceof Error ? err.message : 'Kategorize tarifler yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setDailyCategorized, lastRecipesUpdate, setLastRecipesUpdate, updateStats]);

  const searchByIngredients = useCallback(async (ingredients: DetectedIngredient[]) => {
    try {
      setLoading(true);
      setError(null);
      // Our backend speaks Turkish — pass Turkish ingredient names directly
      const turkishNames = ingredients.map(i => i.tr);

      const recipes = await fetchRecipesByIngredients(turkishNames.filter(Boolean) as string[]);
      return recipes;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Arama başarısız';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecipeDetail = useCallback(async (id: number | string): Promise<Recipe | null> => {
    try {
      setLoading(true);
      setError(null);
      // Our own backend returns data already in Turkish
      const detail = await fetchRecipeDetail(id);
      return detail;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tarif yüklenemedi';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadDailyRecipes,
    loadCategorizedDailyRecipes,
    searchByIngredients,
    getRecipeDetail,
  };
};
