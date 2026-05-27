import type { PantryItem, Ingredient } from '../types';

export const matchPantryToRecipe = (
  pantry: Pick<PantryItem, 'name' | 'quantity' | 'unit' | 'emoji'>[],
  recipeIngredients: Ingredient[]
) => {
  const have = recipeIngredients.filter((i) =>
    pantry.some(
      (p) =>
        p.name.toLowerCase().includes(i.name.toLowerCase()) ||
        i.name.toLowerCase().includes(p.name.toLowerCase())
    )
  );
  const missing = recipeIngredients.filter((i) =>
    !pantry.some(
      (p) =>
        p.name.toLowerCase().includes(i.name.toLowerCase()) ||
        i.name.toLowerCase().includes(p.name.toLowerCase())
    )
  );
  return { have, missing };
};
