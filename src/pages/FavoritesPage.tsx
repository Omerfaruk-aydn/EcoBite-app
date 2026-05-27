import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Plus } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RecipeCard } from '../components/features/RecipeCard';
import { fetchSavedRecipes } from '../api/firebase';
import { Button } from '../components/ui/Button';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const data = await fetchSavedRecipes();
        setSavedRecipes(data);
      } catch (err) {
        console.error('Favoriler yüklenemedi', err);
      } finally {
        setLoading(false);
      }
    };
    loadSaved();
  }, []);

  return (
    <PageWrapper className="bg-neutral-bg">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-6">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-text active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-heading font-extrabold text-2xl text-neutral-text">
          Favorilerim
        </h1>
        <button 
          onClick={() => navigate('/add-recipe')}
          className="ml-auto w-10 h-10 rounded-full bg-brand-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          title="Tarif Ekle"
        >
          <Plus size={24} />
        </button>
      </div>

      <main className="px-5 pb-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-neutral-border animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : savedRecipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {savedRecipes.map((recipe, index) => (
              <div key={recipe.id} className="w-full">
                <RecipeCard
                  id={recipe.id}
                  title={recipe.title}
                  image={recipe.image}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
              <Heart size={40} className="text-neutral-muted" />
            </div>
            <h2 className="font-heading font-bold text-xl text-neutral-text mb-2">Henüz Favori Yok</h2>
            <p className="font-body text-neutral-muted max-w-[240px] mb-8">
              Beğendiğin tarifleri kalp ikonuna basarak buraya ekleyebilirsin.
            </p>
            <Button onClick={() => navigate('/home')}>
              Tarifleri Keşfet
            </Button>
          </div>
        )}
      </main>
    </PageWrapper>
  );
};
