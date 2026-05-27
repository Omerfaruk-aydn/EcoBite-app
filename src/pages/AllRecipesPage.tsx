import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RecipeCard } from '../components/features/RecipeCard';
import { fetchAllRecipes } from '../api/ownApi';
import { Button } from '../components/ui/Button';
import type { Recipe } from '../types';

const CATEGORIES = [
  { id: 'all', label: 'Tümü', emoji: '🍽️' },
  { id: 'breakfast', label: 'Kahvaltı', emoji: '🍳' },
  { id: 'lunch', label: 'Öğle Yemeği', emoji: '🍲' },
  { id: 'dinner', label: 'Akşam Yemeği', emoji: '🥘' },
  { id: 'vegan', label: 'Vegan', emoji: '🌿' },
  { id: 'dessert', label: 'Tatlılar', emoji: '🍰' },
];

export const AllRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadRecipes = useCallback(async (cat: string, p: number, append: boolean = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data = await fetchAllRecipes(cat, p, 20);
      
      if (append) {
        setRecipes(prev => [...prev, ...data.recipes]);
      } else {
        setRecipes(data.recipes);
      }
      
      setHasMore(p < data.pagination.pages);
    } catch (err) {
      console.error('Tarifler yüklenemedi', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadRecipes(activeCategory, 1, false);
  }, [activeCategory, loadRecipes]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadRecipes(activeCategory, nextPage, true);
  };

  return (
    <PageWrapper className="bg-neutral-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-neutral-bg/80 backdrop-blur-md px-5 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-text active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-heading font-extrabold text-2xl text-neutral-text">
            Tüm Tarifler
          </h1>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap font-heading font-bold text-sm transition-all shadow-sm border ${
                activeCategory === cat.id 
                  ? 'bg-brand-primary text-white border-brand-primary' 
                  : 'bg-white text-neutral-muted border-neutral-border hover:border-brand-light'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-neutral-border animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {recipes.map((recipe, index) => (
                <div key={`${recipe.id}-${index}`} className="w-full">
                  <RecipeCard
                    id={recipe.id}
                    title={recipe.title}
                    image={recipe.image}
                    index={index}
                  />
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pb-8">
                <Button 
                  onClick={handleLoadMore} 
                  loading={loadingMore}
                  variant="outline"
                  className="px-8"
                >
                  Daha Fazla Yükle
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
              <Search size={40} className="text-neutral-muted" />
            </div>
            <h2 className="font-heading font-bold text-xl text-neutral-text mb-2">Tarif Bulunamadı</h2>
            <p className="font-body text-neutral-muted max-w-[240px]">
              Bu kategoride henüz tarif bulunmuyor.
            </p>
          </div>
        )}
      </main>
    </PageWrapper>
  );
};
