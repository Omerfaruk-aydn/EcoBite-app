import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info, AlertTriangle } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RecipeCard } from '../components/features/RecipeCard';
import { useRecipes } from '../hooks/useRecipes';
import { useAppStore } from '../store/useAppStore';
import { usePantry } from '../hooks/usePantry';
import { Button } from '../components/ui/Button';
import type { Recipe, DetectedIngredient } from '../types';

export const RecipesResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSmartSearch = location.state?.smartSearch === true;
  
  const { scannedIngredients } = useAppStore();
  const { pantry, expiringItems } = usePantry();
  const { searchByIngredients } = useRecipes();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'fast'>('match');
  const [retryCount, setRetryCount] = useState(0);
  const hasSearchedRef = useRef(false);

  // Safely calculate the ingredients to search with, memoized to prevent infinite loops
  const searchIngredients = useMemo<DetectedIngredient[]>(() => {
    if (!isSmartSearch) {
      return Array.isArray(scannedIngredients) ? scannedIngredients : [];
    }

    try {
      const safePantry = Array.isArray(pantry) ? pantry : [];
      const safeExpiring = Array.isArray(expiringItems) ? expiringItems : [];
      
      const sortedPantry = [
        ...safeExpiring,
        ...safePantry.filter(p => !safeExpiring.find(e => e.id === p.id))
      ];
      
      return sortedPantry.map(p => ({
        tr: p?.name || '',
        en: p?.name || ''
      })).filter(i => i.tr !== '');
    } catch (err) {
      console.error('Error calculating smart search ingredients:', err);
      return [];
    }
  }, [isSmartSearch, scannedIngredients, pantry, expiringItems]);

  useEffect(() => {
    let isMounted = true;

    const performSearch = async () => {
      // Prevent redundant searches if dependencies haven't fundamentally changed
      if (hasSearchedRef.current || searchIngredients.length === 0) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      hasSearchedRef.current = true;

      try {
        const results = await searchByIngredients(searchIngredients);

        if (isMounted) {
          if (Array.isArray(results)) {
            setRecipes(results);
          } else {
            console.warn('API returned non-array results:', results);
            setRecipes([]); 
          }
        }
      } catch (err) {
        console.error('Search Exception:', err);
        if (isMounted) setError('Tarifler yüklenirken bir sorun oluştu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [searchIngredients, searchByIngredients, retryCount]);

  // Handle active sorting
  const displayedRecipes = useMemo(() => {
    if (!Array.isArray(recipes)) return [];
    if (sortBy === 'fast') {
      return [...recipes].sort((a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
    }
    return recipes;
  }, [recipes, sortBy]);

  const handleRetry = useCallback(() => {
    hasSearchedRef.current = false;
    setError(null);
    setRecipes([]);
    setRetryCount(c => c + 1);
  }, []);

  return (
    <PageWrapper className="bg-neutral-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(isSmartSearch ? '/profile' : '/camera')}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-text active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-heading font-extrabold text-2xl text-neutral-text">
            {isSmartSearch ? 'Kiler Mutfakta' : 'Bulunan Tarifler'}
          </h1>
        </div>
        
        {/* Sort Toggle */}
        <div className="flex bg-white/50 p-1 rounded-xl border border-neutral-border">
          <button 
            onClick={() => setSortBy('match')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'match' ? 'bg-brand-primary text-white shadow-sm' : 'text-neutral-muted'}`}
          >
            En Uygun
          </button>
          <button 
            onClick={() => setSortBy('fast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'fast' ? 'bg-brand-primary text-white shadow-sm' : 'text-neutral-muted'}`}
          >
            En Hızlı
          </button>
        </div>
      </div>

      <main className="px-5 pb-10">
        {/* Ingredient Summary */}
        <div className={`rounded-2xl p-4 mb-8 flex items-start gap-3 ${isSmartSearch ? 'bg-orange-50 border border-orange-200' : 'bg-brand-surface border border-brand-light'}`}>
          {isSmartSearch ? (
            <Info className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <Sparkles className="text-brand-primary flex-shrink-0 mt-0.5" size={20} />
          )}
          <div>
            <p className={`font-body text-sm font-bold mb-1 ${isSmartSearch ? 'text-orange-700' : 'text-brand-primary'}`}>
              {isSmartSearch ? 'Akıllı Kiler Araması' : `${searchIngredients.length} Malzeme Seçildi`}
            </p>
            <p className="font-body text-xs text-neutral-muted leading-relaxed">
              {isSmartSearch 
                ? 'Kilerinizdeki ürünler (öncelikle tarihi yaklaşanlar) değerlendirilerek en uygun tarifler listelendi.'
                : `${searchIngredients.map(i => i.tr).filter(Boolean).join(', ')} kullanarak yapabileceğin en iyi tarifler.`
              }
            </p>
          </div>
        </div>

        {/* State Management Views */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-neutral-border animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl shadow-sm border border-neutral-border">
            <AlertTriangle className="text-red-400 mb-4" size={48} />
            <h2 className="font-heading font-bold text-lg text-neutral-text mb-2">Eyvah, Bir Sorun Oluştu!</h2>
            <p className="font-body text-sm text-neutral-muted max-w-[240px] mb-6">
              {error} Bağlantınızı kontrol edip tekrar deneyin.
            </p>
            <Button onClick={handleRetry} className="bg-neutral-text text-white px-8">
              Tekrar Dene
            </Button>
          </div>
        ) : displayedRecipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {displayedRecipes.map((recipe: Recipe, index: number) => (
              <div key={recipe?.id || index} className="w-full">
                <RecipeCard
                  id={recipe?.id as any}
                  title={recipe?.title || 'İsimsiz Tarif'}
                  image={recipe?.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-6">🍽️</div>
            <h2 className="font-heading font-bold text-xl text-neutral-text mb-2">
              {searchIngredients.length === 0 ? 'Kileriniz Boş Görünüyor' : 'Tarif Bulunamadı'}
            </h2>
            <p className="font-body text-neutral-muted max-w-[240px] mb-8">
              {searchIngredients.length === 0 
                ? 'Öneri alabilmek için kilerinize ürün eklemelisiniz.' 
                : 'Seçili ürünlerle eşleşen tarif bulamadık. Lütfen farklı ürünler deneyin.'}
            </p>
            <Button onClick={() => navigate(isSmartSearch ? '/profile' : '/camera')} variant="outline">
              {isSmartSearch ? 'Kilere Ürün Ekle' : 'Yeniden Tara'}
            </Button>
          </div>
        )}
      </main>
    </PageWrapper>
  );
};
