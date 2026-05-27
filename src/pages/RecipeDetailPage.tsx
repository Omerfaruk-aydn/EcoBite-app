import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, ChefHat, Plus } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { usePantry } from '../hooks/usePantry';
import { useAppStore } from '../store/useAppStore';
import { matchPantryToRecipe } from '../utils/recipeUtils';
import { saveRecipe, unsaveRecipe, fetchSavedRecipes } from '../api/firebase';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getIngredientEmoji } from '../utils/ingredientMapper';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeDetail, loading } = useRecipes();
  const { pantry, addItem } = usePantry();

  const safeUnit = (unit: string): import('../types').PantryItem['unit'] => {
    const u = (unit || '').toLowerCase();
    if (u === 'g' || u === 'gram') return 'g';
    if (u === 'kg') return 'kg';
    if (u === 'ml') return 'ml';
    if (u === 'l' || u === 'litre') return 'l';
    if (u === 'paket') return 'paket';
    if (u === 'kavanoz') return 'kavanoz';
    if (u === 'şişe') return 'şişe';
    if (u === 'diş') return 'diş';
    return 'adet';
  };
  
  const [recipe, setRecipe] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [matchResult, setMatchResult] = useState<{ have: any[], missing: any[] }>({ have: [], missing: [] });
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Helper component for ingredient visuals (Emoji-based)
  const IngredientVisual = ({ name, emoji, className = "" }: { name: string, emoji: string | null, className?: string }) => {
    if (!emoji) {
      return (
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${className} opacity-80`}>
          <span className="font-heading font-bold text-xs uppercase opacity-70">
            {name.slice(0, 2)}
          </span>
        </div>
      );
    }

    return (
      <div className="w-8 h-8 flex items-center justify-center text-2xl select-none leading-none transform translate-y-[1px]">
        {emoji}
      </div>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const data = await getRecipeDetail(id);
      if (data) {
        setRecipe(data);
        const match = matchPantryToRecipe(pantry, data.extendedIngredients);
        setMatchResult(match as any);
      }
      
      // Check if saved
      try {
        const saved = await fetchSavedRecipes();
        const isAlreadySaved = saved.some((r: any) => String(r.id) === String(id));
        setIsSaved(isAlreadySaved);
      } catch (err) {
        console.error('Saved status check failed', err);
      }
    };
    loadData();
  }, [id, getRecipeDetail, pantry]);

  const toggleSave = async () => {
    if (!recipe) return;
    try {
      if (isSaved) {
        await unsaveRecipe(recipe.id);
        setIsSaved(false);
      } else {
        await saveRecipe(recipe.id, {
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          savedAt: new Date().toISOString()
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Kaydetme hatası', err);
    }
  };

  if (loading || !recipe) {
    return (
      <PageWrapper className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </PageWrapper>
    );
  }

  const steps = recipe.analyzedInstructions[0]?.steps || [];

  return (
    <PageWrapper noPadding className="pb-8 bg-neutral-bg">
      {/* Hero Image */}
      <div className="relative w-full h-[280px]">
        <img 
          src={recipe.image?.startsWith('http') ? `/api/recipes/image-proxy?url=${encodeURIComponent(recipe.image)}` : recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Top Gradient for readability */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
        
        {/* Navigation & Actions */}
        <div className="absolute top-0 left-0 right-0 p-5 pt-[env(safe-area-inset-top)] flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <button 
            onClick={toggleSave}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Heart 
              size={24} 
              className={isSaved ? 'text-danger flex-shrink-0' : 'text-neutral-muted'} 
              fill={isSaved ? 'currentColor' : 'none'} 
            />
          </button>
        </div>
      </div>

      {/* Content Container (Overlapping Image) */}
      <div className="relative -mt-7 bg-white rounded-t-4xl px-5 pt-7 pb-10 min-h-[500px]">
        
        {/* Title & Meta */}
        <h1 className="font-heading font-extrabold text-2xl text-neutral-text mb-3 leading-tight">
          {recipe.title}
        </h1>
        
        <div className="flex items-center gap-4 text-sm font-body font-medium text-neutral-muted mb-8">
          <div className="flex items-center gap-1.5">
            <Clock size={18} />
            <span>{recipe.readyInMinutes} dk</span>
          </div>
          <div className="w-[1px] h-4 bg-neutral-border" />
          <div className="flex items-center gap-1.5">
            <ChefHat size={18} />
            <span>{recipe.difficulty || 'Orta'}</span>
          </div>
        </div>

        {/* Have Ingredients */}
        {matchResult.have.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.06)] border border-neutral-border/50 mb-4">
            <h3 className="font-heading font-bold text-[15px] text-neutral-text mb-4">
              Senin Dolabındakiler
            </h3>
            <div className="grid gap-4">
              {matchResult.have.map((item: any) => {
                const emoji = getIngredientEmoji(item.name);

                return (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      <IngredientVisual 
                        name={item.name} 
                        emoji={emoji} 
                        className="bg-brand-primary/5 text-brand-primary" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-[15px] text-neutral-text truncate">
                        {item.name}
                      </p>
                      <p className="font-body text-xs text-neutral-muted">
                        Mevcut
                      </p>
                    </div>
                    <span className="font-body font-medium text-sm text-neutral-muted">
                      {item.amount} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Ingredients */}
        {matchResult.missing.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_1px_6px_rgba(0,0,0,0.06)] border border-neutral-border/50 mb-8">
            <h3 className="font-heading font-bold text-[15px] text-neutral-text mb-4">
              Eksik Malzemeler
            </h3>
            <div className="grid gap-4">
              {matchResult.missing.map((item: any) => {
                const emoji = getIngredientEmoji(item.name);

                return (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-bg border border-neutral-border/50 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      <IngredientVisual 
                        name={item.name} 
                        emoji={emoji} 
                        className="bg-neutral-muted/5 text-neutral-muted" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-[15px] text-neutral-text truncate">
                        {item.name}
                      </p>
                      <p className="font-body text-xs text-brand-primary font-medium">
                        Eksik
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body font-medium text-sm text-neutral-muted">
                        {item.amount} {item.unit}
                      </span>
                      <button
                        onClick={() => addItem({
                          name: item.name,
                          quantity: item.amount || 1,
                          unit: safeUnit(item.unit),
                          emoji: getIngredientEmoji(item.name) ?? '📦',
                          category: 'Eksik',
                          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                        })}
                        className="w-8 h-8 rounded-full bg-white border border-neutral-border shadow-sm flex items-center justify-center hover:bg-brand-surface hover:border-brand-primary/30 transition-all active:scale-95"
                      >
                        <Plus size={18} className="text-brand-primary" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Cooking CTA */}
        {steps.length > 0 && (
          <Button 
            variant="gradient" 
            fullWidth 
            onClick={() => setShowSteps(true)}
            size="lg"
            className="py-4 text-[17px] sticky bottom-4 z-20"
          >
            Adım Adım Pişir
          </Button>
        )}
      </div>

      {/* Cooking Steps Modal */}
      <Modal isOpen={showSteps} onClose={() => setShowSteps(false)} title="Adım Adım Tarif">
        <div className="flex flex-col h-[50vh]">
          {/* Step Progress Container */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <span className="w-12 h-12 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center font-heading font-bold text-xl mb-6">
                {currentStep + 1}
              </span>
              <p className="font-body text-lg text-neutral-text leading-relaxed">
                {steps[currentStep]?.step}
              </p>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="pt-6 mt-auto border-t border-neutral-border flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Önceki
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={async () => {
                  const { user, updateStats } = useAppStore.getState();
                  if (user) {
                    await updateStats({
                      xp: (user.xp || 0) + 100,
                      totalKgSaved: (user.totalKgSaved || 0) + 0.3,
                      recipesCompleted: (user.recipesCompleted || 0) + 1
                    }, true);
                  }
                  setShowSteps(false);
                  navigate('/home');
                }}
                className="flex-1"
              >
                Afiyet Olsun! (+100 XP)
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex-1"
              >
                Sonraki
              </Button>
            )}
          </div>
        </div>
      </Modal>

    </PageWrapper>
  );
};
