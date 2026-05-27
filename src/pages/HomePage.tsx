import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { RecipeCard } from '../components/features/RecipeCard';
import { useRecipes } from '../hooks/useRecipes';
import { useAppStore } from '../store/useAppStore';

// Custom Refrigerator Icon for Hero Section
const FridgeIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-primary mb-6">
    <rect x="36" y="24" width="48" height="72" rx="4" stroke="currentColor" strokeWidth="4" />
    <path d="M36 48H84" stroke="currentColor" strokeWidth="4" />
    <rect x="42" y="32" width="4" height="8" rx="2" fill="currentColor" />
    <rect x="42" y="60" width="4" height="20" rx="2" fill="currentColor" />
    <rect x="48" y="56" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="4" />
    <circle cx="60" cy="65" r="4" fill="currentColor" />
    <path d="M28 72C28 72 32 64 24 56C16 48 24 40 24 40C24 40 32 44 32 52C32 60 28 72 28 72Z" fill="#8BC34A" />
    <path d="M92 72C92 72 88 64 96 56C104 48 96 40 96 40C96 40 88 44 88 52C88 60 92 72 92 72Z" fill="#8BC34A" />
    <path d="M44 100H76" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { dailyBreakfast, dailyLunch, dailyDinner, dailyVegan, dailyDessert, user } = useAppStore();
  const { loadCategorizedDailyRecipes, loading } = useRecipes();

  const [activeCategory, setActiveCategory] = React.useState('Hepsi');

  const categories = [
    { name: 'Hepsi', emoji: '🍽️', target: 'all' },
    { name: 'Kahvaltı', emoji: '🍳', target: 'breakfast' },
    { name: 'Öğle Yemeği', emoji: '🍲', target: 'lunch' },
    { name: 'Akşam Yemeği', emoji: '🍝', target: 'dinner' },
    { name: 'Vegan', emoji: '🌿', target: 'vegan' },
    { name: 'Tatlı', emoji: '🍰', target: 'dessert' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'Tünaydın';
    return 'İyi Akşamlar';
  };

  // Load daily recipes on mount
  useEffect(() => {
    loadCategorizedDailyRecipes();
  }, [loadCategorizedDailyRecipes]);

  const RecipeSection = ({ title, recipes, id }: { title: string, recipes: any[], id: string }) => (
    <section id={id} className="mb-10 px-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-heading font-extrabold text-neutral-text">
          {title}
        </h3>
        <span className="text-xs font-bold text-brand-primary bg-brand-surface px-2 py-1 rounded-full">
          Günün Özeli
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
        {loading && recipes.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[180px] h-[220px] bg-neutral-border animate-pulse rounded-3xl" />
          ))
        ) : (
          recipes.map((recipe, index) => (
            <div key={recipe.id} className="snap-center">
              <RecipeCard
                id={recipe.id}
                title={recipe.title}
                image={recipe.image}
                index={index}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );


  return (
    <PageWrapper noPadding className="bg-white">
      <TopBar />
      
      <main className="pb-20">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center mt-6 mb-10 px-5">
          <p className="text-sm font-body font-bold text-brand-primary/60 uppercase tracking-widest mb-1">
            {getGreeting()}, {user?.displayName || 'EcoBite Dostu'}
          </p>
          <h2 className="text-[34px] font-heading font-extrabold text-brand-primary mb-6 leading-tight">
            Bugün ne <br/> pişiriyoruz?
          </h2>
          
          <FridgeIcon />

          <Button 
            variant="gradient"
            className="w-full max-w-[300px] py-6 rounded-3xl shadow-[0_12px_24px_-8px_rgba(46,125,50,0.5)]" 
            onClick={() => navigate('/camera')}
          >
            Buzdolabını Tara
          </Button>
        </section>

        {/* Discovery Categories */}
        <section className="mb-10 px-5">
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  if (cat.target !== 'all') {
                    // Timeout to let the DOM update if we were filtering
                    setTimeout(() => {
                      const element = document.getElementById(cat.target);
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap border transition-all duration-300 ${
                  activeCategory === cat.name
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                    : 'bg-white border-neutral-border text-neutral-text hover:border-brand-light'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-heading font-bold text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Categorized Recipes */}
        <div className="bg-neutral-bg/30 py-10 rounded-t-[40px] min-h-[400px]">
          {(activeCategory === 'Hepsi' || activeCategory === 'Kahvaltı') && dailyBreakfast.length > 0 && (
            <RecipeSection id="breakfast" title="Kahvaltı Keyfi" recipes={dailyBreakfast} />
          )}
          {(activeCategory === 'Hepsi' || activeCategory === 'Öğle Yemeği') && dailyLunch.length > 0 && (
            <RecipeSection id="lunch" title="Hızlı Öğle Yemeği" recipes={dailyLunch} />
          )}
          {(activeCategory === 'Hepsi' || activeCategory === 'Akşam Yemeği') && dailyDinner.length > 0 && (
            <RecipeSection id="dinner" title="Akşam Ziyafeti" recipes={dailyDinner} />
          )}
          {(activeCategory === 'Hepsi' || activeCategory === 'Vegan') && dailyVegan.length > 0 && (
            <RecipeSection id="vegan" title="Vegan Lezzetler" recipes={dailyVegan} />
          )}
          {(activeCategory === 'Hepsi' || activeCategory === 'Tatlı') && dailyDessert.length > 0 && (
            <RecipeSection id="dessert" title="Tatlı Kaçamakları" recipes={dailyDessert} />
          )}
          
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
};
