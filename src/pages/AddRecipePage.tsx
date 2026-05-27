import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, ListChecks, ChefHat, Trash2 } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { saveCustomRecipe } from '../api/firebase';

export const AddRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length ? newIngredients : ['']);
  };

  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleRemoveInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions.length ? newInstructions : ['']);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen bir başlık girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recipeData = {
        title,
        readyInMinutes: parseInt(cookTime) || 30,
        ingredients: ingredients.filter(i => i.trim() !== ''),
        instructions: instructions.filter(i => i.trim() !== ''),
        image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800', // Placeholder
        sourceName: 'Benim Tarifim'
      };

      await saveCustomRecipe(recipeData);
      navigate('/favorites');
    } catch (err) {
      console.error('Tarif kaydedilemedi', err);
      setError('Tarif kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="bg-neutral-bg">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-text active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-heading font-extrabold text-2xl text-neutral-text">
          Tarif Ekle
        </h1>
      </div>

      <main className="px-5 pb-24">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Title & Time */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-border/50 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-muted uppercase tracking-widest mb-2 ml-1">
                Tarif Adı
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Anne Usulü Mercimek Çorbası"
                className="w-full h-14 bg-neutral-bg border border-neutral-border rounded-2xl px-5 font-body text-neutral-text focus:outline-none focus:border-brand-primary transition-colors"
                required
              />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-neutral-muted uppercase tracking-widest mb-2 ml-1">
                Hazırlama Süresi (dk)
              </label>
              <div className="relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-muted" size={20} />
                <input 
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="30"
                  className="w-full h-14 bg-neutral-bg border border-neutral-border rounded-2xl pl-12 pr-5 font-body text-neutral-text focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListChecks size={20} className="text-brand-primary" />
                <h2 className="font-heading font-bold text-lg text-neutral-text">Malzemeler</h2>
              </div>
              <button 
                type="button"
                onClick={handleAddIngredient}
                className="text-brand-primary font-bold text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Ekle
              </button>
            </div>
            
            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text"
                    value={ing}
                    onChange={(e) => {
                      const newIngs = [...ingredients];
                      newIngs[idx] = e.target.value;
                      setIngredients(newIngs);
                    }}
                    placeholder={`Malzeme ${idx + 1}`}
                    className="flex-1 h-12 bg-neutral-bg border border-neutral-border rounded-xl px-4 font-body text-sm text-neutral-text focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ChefHat size={20} className="text-brand-primary" />
                <h2 className="font-heading font-bold text-lg text-neutral-text">Yapılışı</h2>
              </div>
              <button 
                type="button"
                onClick={handleAddInstruction}
                className="text-brand-primary font-bold text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Adım Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {instructions.map((ins, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="w-8 h-8 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center font-bold text-xs shrink-0 mt-2">
                    {idx + 1}
                  </div>
                  <textarea 
                    value={ins}
                    onChange={(e) => {
                      const newIns = [...instructions];
                      newIns[idx] = e.target.value;
                      setInstructions(newIns);
                    }}
                    placeholder={`${idx + 1}. Adım`}
                    className="flex-1 min-h-[80px] bg-neutral-bg border border-neutral-border rounded-xl p-4 font-body text-sm text-neutral-text focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-transform mt-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-body text-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Tarifi Kaydet'}
          </Button>
        </form>
      </main>
    </PageWrapper>
  );
};
