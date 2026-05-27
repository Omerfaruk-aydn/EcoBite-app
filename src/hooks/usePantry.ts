import { useState, useEffect } from 'react';
import { addPantryItem, updatePantryItem, deletePantryItem, fetchPantryItems } from '../api/firebase';
import { useAppStore } from '../store/useAppStore';
import type { PantryItem } from '../types';

export const usePantry = () => {
  const { pantry, setPantry, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a user or a token
    const token = localStorage.getItem('token');
    if (!token && !user) {
      setLoading(false);
      return;
    }

    const loadPantry = async () => {
      try {
        const items = await fetchPantryItems();
        setPantry(items);
        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kiler yüklenemedi';
        setError(message);
        setLoading(false);
      }
    };

    loadPantry();
    
    // Optional: poll every 30s if real-time is desired without WebSockets
    const interval = setInterval(loadPantry, 30000);
    return () => clearInterval(interval);
  }, [setPantry, user]);

  const addItem = async (item: Omit<PantryItem, 'id'>) => {
    const tempId = Math.random().toString(36).substring(7);
    const newItem = { ...item, id: tempId };
    
    // Optimistic Update
    const previousPantry = [...pantry];
    setPantry([...pantry, newItem]);

    try {
      setError(null);
      await addPantryItem(item);
      // Backend will refresh on next interval or we could call loadPantry()
    } catch (err: unknown) {
      // Revert on error
      setPantry(previousPantry);
      const message = err instanceof Error ? err.message : 'Ürün eklenemedi';
      setError(message);
    }
  };

  const updateItem = async (id: string, data: Partial<PantryItem>) => {
    // Optimistic Update
    const previousPantry = [...pantry];
    const updatedPantry = pantry.map(item => 
      item.id === id ? { ...item, ...data } : item
    );
    setPantry(updatedPantry);

    try {
      setError(null);
      await updatePantryItem(id, data);
    } catch (err: unknown) {
      // Revert on error
      setPantry(previousPantry);
      const message = err instanceof Error ? err.message : 'Ürün güncellenemedi';
      setError(message);
    }
  };

  const removeItem = async (id: string) => {
    // Optimistic Update
    const previousPantry = [...pantry];
    const itemToRemove = pantry.find(i => i.id === id);
    setPantry(pantry.filter(item => item.id !== id));

    try {
      setError(null);
      const isExpiring = itemToRemove && itemToRemove.expiryDate && (getDaysUntilExpiry(itemToRemove.expiryDate) <= 3);

      await deletePantryItem(id);
      
      if (isExpiring && user) {
        const { updateStats } = useAppStore.getState();
        await updateStats({
          xp: (user.xp || 0) + 20,
          totalKgSaved: (user.totalKgSaved || 0) + 0.1
        }, true);
      }
    } catch (err: unknown) {
      // Revert on error
      setPantry(previousPantry);
      const message = err instanceof Error ? err.message : 'Ürün silinemedi';
      setError(message);
    }
  };

  const expiringItems = pantry.filter((item) => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return {
    pantry,
    loading,
    error,
    expiringItems,
    addItem,
    updateItem,
    removeItem,
    getDaysUntilExpiry,
  };
};
