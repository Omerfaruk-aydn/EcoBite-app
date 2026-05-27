import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/apiClient';
import type { PantryItem, Recipe, User, DetectedIngredient } from '../types';

interface AppState {
  user: User | null;
  pantry: PantryItem[];
  scannedIngredients: DetectedIngredient[];
  suggestedRecipes: Recipe[];
  isLoading: boolean;
  dailyBreakfast: Recipe[];
  dailyLunch: Recipe[];
  dailyDinner: Recipe[];
  dailyVegan: Recipe[];
  dailyDessert: Recipe[];
  lastRecipesUpdate: string | null;
  setUser: (user: User | null) => void;
  setPantry: (items: PantryItem[]) => void;
  setScannedIngredients: (items: DetectedIngredient[]) => void;
  setSuggestedRecipes: (recipes: Recipe[]) => void;
  setIsLoading: (loading: boolean) => void;
  setDailyCategorized: (type: 'breakfast' | 'lunch' | 'dinner' | 'vegan' | 'dessert', recipes: Recipe[]) => void;
  setLastRecipesUpdate: (date: string) => void;
  updateStats: (stats: Partial<User>, syncWithBackend?: boolean) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      pantry: [],
      scannedIngredients: [],
      suggestedRecipes: [],
      isLoading: false,
      dailyBreakfast: [],
      dailyLunch: [],
      dailyDinner: [],
      dailyVegan: [],
      dailyDessert: [],
      lastRecipesUpdate: null,
      setUser: (user) => {
        if (user?.dailyRecipes) {
          const { suggested, breakfast, lunch, dinner, vegan, dessert } = user.dailyRecipes;
          set({ 
            user, 
            lastRecipesUpdate: user.lastRecipesUpdate || get().lastRecipesUpdate,
            suggestedRecipes: suggested || [],
            dailyBreakfast: breakfast || [],
            dailyLunch: lunch || [],
            dailyDinner: dinner || [],
            dailyVegan: vegan || [],
            dailyDessert: dessert || []
          });
        } else {
          set({ user, lastRecipesUpdate: user?.lastRecipesUpdate || get().lastRecipesUpdate });
        }
      },
      setPantry: (pantry) => set({ pantry }),
      setScannedIngredients: (items) => set({ scannedIngredients: items }),
      setSuggestedRecipes: (suggestedRecipes) => set({ suggestedRecipes }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setDailyCategorized: (type, recipes) => set((state) => ({ 
        ...state, 
        [`daily${type.charAt(0).toUpperCase() + type.slice(1)}`]: recipes 
      })),
      setLastRecipesUpdate: (date) => {
        set({ lastRecipesUpdate: date });
        get().updateStats({ lastRecipesUpdate: date } as any, true);
      },
      updateStats: async (stats, syncWithBackend = false) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...stats };
        
        // Basic level up logic for immediate feedback
        const nextLevelXp = updatedUser.level * 500;
        if (updatedUser.xp >= nextLevelXp) {
          updatedUser.level += 1;
          updatedUser.xp -= nextLevelXp;
        }

        set({ user: updatedUser });

        if (syncWithBackend) {
          try {
            const { xp, level, totalKgSaved, recipesCompleted, lastRecipesUpdate, dailyRecipes } = updatedUser;
            await apiClient.put('/auth/stats', { xp, level, totalKgSaved, recipesCompleted, lastRecipesUpdate, dailyRecipes });
          } catch (err) {
            console.error('Stats sync failed', err);
          }
        }
      },
    }),
    {
      name: 'ecobite-storage-v2',
    }
  )
);
