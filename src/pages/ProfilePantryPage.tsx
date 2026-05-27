import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePantry } from '../hooks/usePantry';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { getEmojiForIngredient } from '../utils/emojiMap';

export const ProfilePantryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { pantry, expiringItems, getDaysUntilExpiry, addItem } = usePantry();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('adet');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [activeTab, setActiveTab] = useState<'kiler' | 'yaklasan'>('kiler');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    try {
      const emoji = getEmojiForIngredient(newItemName);
      await addItem({
        name: newItemName,
        quantity: Number(newItemQuantity),
        unit: newItemUnit as any,
        emoji: emoji,
        category: 'Diğer',
        expiryDate: newItemExpiry ? new Date(newItemExpiry).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      setNewItemName('');
      setNewItemQuantity(1);
      setNewItemUnit('adet');
      setNewItemExpiry('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Ekleme hatası:', err);
    }
  };

  return (
    <PageWrapper className="bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-neutral-bg transition-colors"
        >
          <ArrowLeft size={24} className="text-neutral-text" />
        </button>
        <button 
          onClick={handleSignOut}
          className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-neutral-bg transition-colors"
        >
          <LogOut size={20} className="text-neutral-muted" />
        </button>
      </div>

      <main className="px-5 pb-24">
        {/* Profile Info Header (Image Style) */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex-shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user?.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-surface flex items-center justify-center">
                  <span className="text-brand-primary font-heading font-black text-4xl">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-brand-primary text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md">
              {user?.level || 1}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-extrabold text-[28px] text-neutral-text leading-tight truncate">
              {user?.displayName}
            </h2>
            <p className="font-body text-base text-neutral-muted truncate">
              @{user?.email?.split('@')[0]}
            </p>
          </div>
        </div>

        {/* Achievement Badges Row (Image Style) */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {/* Sustainability Badge */}
          <div className="flex-shrink-0 flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] px-4 py-2.5 rounded-2xl font-heading font-bold text-sm border border-[#C8E6C9]">
            <span className="text-xl">🌿</span>
            <span>{user?.totalKgSaved || 0} Kilo Gıda İsrafı Önlendi!</span>
          </div>
          
          {/* Level Badge */}
          <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-neutral-border/50">
            <span className="text-2xl">⭐</span>
            <span className="text-[8px] font-black text-neutral-muted uppercase">Seviye {user?.level || 1}</span>
          </div>

          {/* Chef Hat Badge */}
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-neutral-border/50">
            <span className="text-2xl">👨‍🍳</span>
          </div>

          {/* Jar Badge */}
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-neutral-border/50">
            <span className="text-2xl">🫙</span>
          </div>
        </div>

        {/* Stats & Badges */}
        <div className="flex flex-col gap-4 mb-8">
           <div className="flex items-center gap-3">
             <div className="flex-1 bg-brand-surface/50 border border-brand-light rounded-2xl p-3 flex flex-col items-center">
               <span className="text-2xl mb-1">🌿</span>
               <span className="text-lg font-heading font-extrabold text-brand-primary">{user?.totalKgSaved || 0}</span>
                <span className="text-[10px] uppercase font-bold text-brand-primary/60">Kg Önlendi</span>
              </div>
              <div className="flex-1 bg-neutral-bg/[0.5] border border-neutral-border rounded-2xl p-3 flex flex-col items-center">
                <span className="text-2xl mb-1">🍲</span>
                <span className="text-lg font-heading font-extrabold text-neutral-text">{user?.recipesCompleted || 0}</span>
                <span className="text-[10px] uppercase font-bold text-neutral-muted">Tamamlandı</span>
              </div>
              <div className="flex-1 bg-brand-surface/50 border border-brand-light rounded-2xl p-3 flex flex-col items-center">
                <span className="text-2xl mb-1">🔥</span>
                <span className="text-lg font-heading font-extrabold text-brand-primary">{user?.streak || 0}</span>
                <span className="text-[10px] uppercase font-bold text-brand-primary/60">Günlük Seri</span>
             </div>
           </div>
        </div>

        {/* Experience Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-heading font-bold text-neutral-muted uppercase tracking-wider">Mutfak Deneyimi (XP)</span>
            <span className="text-xs font-heading font-bold text-brand-primary">{user?.xp || 0} / {(user?.level || 1) * 500} XP</span>
          </div>
          <div className="h-2 w-full bg-neutral-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary rounded-full" 
              style={{ width: `${Math.min(((user?.xp || 0) / ((user?.level || 1) * 500)) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Tab Selection (Image Style) */}
        <div className="bg-neutral-bg rounded-2xl p-1 flex mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab('kiler')}
            className={`flex-1 py-3 rounded-xl font-heading font-extrabold text-sm transition-all duration-300 ${
              activeTab === 'kiler' ? 'bg-[#43A047] text-white shadow-lg' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Kilerim
          </button>
          <button
            onClick={() => setActiveTab('yaklasan')}
            className={`flex-1 py-3 rounded-xl font-heading font-extrabold text-sm transition-all duration-300 ${
              activeTab === 'yaklasan' ? 'bg-[#43A047] text-white shadow-lg' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Son Kullanım Yaklaşıyor
          </button>
        </div>

        {/* Tab Content: Kilerim */}
        {activeTab === 'kiler' && (
          <div className="mb-8">
            <h3 className="font-heading font-extrabold text-lg text-neutral-text mb-4 px-1">
              Mevcut Malzemeler
            </h3>
            {pantry.length === 0 ? (
              <div className="bg-white rounded-[32px] p-8 border border-neutral-border/50 text-center shadow-sm">
                <p className="text-neutral-muted font-body text-sm">
                  Kilerinizde hiç ürün yok. Eklemek için kamerayı kullanın.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pantry.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-neutral-border/30 hover:border-brand-primary/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji || '📦'}</span>
                      <span className="font-heading font-bold text-neutral-text">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-muted font-heading font-bold text-sm">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-neutral-muted group-hover:text-brand-primary transition-colors">›</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Son Kullanım */}
        {activeTab === 'yaklasan' && (
          <div className="mb-8">
            <h3 className="font-heading font-extrabold text-lg text-neutral-text mb-4 px-1">
              Tarihi Yaklaşıan Ürünler
            </h3>
            {expiringItems.length === 0 ? (
              <div className="bg-white rounded-[32px] p-8 border border-neutral-border/50 text-center shadow-sm">
                <p className="text-neutral-muted font-body text-sm">
                  Son kullanma tarihi yaklaşan ürününüz yok. 😌
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {expiringItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-[#FFF3E0] bg-orange-50/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="font-heading font-bold text-neutral-text">{item.name}</p>
                        <p className="text-[10px] font-bold text-[#E65100] uppercase">Son Kullanım: {getDaysUntilExpiry(item.expiryDate!)} Gün</p>
                      </div>
                    </div>
                    <span className="text-neutral-muted">›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Pantry Button (Image Style) */}
        <Button 
          variant="outline"
          fullWidth
          className="bg-[#E8F5E9] border-[#C8E6C9] py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#C8E6C9] transition-all group"
          onClick={() => navigate('/recipes-search', { state: { smartSearch: true } })}
        >
          <span className="text-2xl">💡</span>
          <span className="font-heading font-black text-[#2E7D32] tracking-normal">Akıllı Kiler Önerileri</span>
        </Button>
      </main>

      {/* Manual Add FAB */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <span className="text-2xl font-bold">+</span>
      </motion.button>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[340px] bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <h3 className="font-heading font-extrabold text-xl text-neutral-text mb-2">Malzeme Ekle</h3>
              <p className="font-body text-sm text-neutral-muted mb-6">Kilerinize manuel olarak yeni bir ürün ekleyin.</p>
              
              <form onSubmit={handleManualAdd}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pb-4 hide-scrollbar">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-muted uppercase tracking-widest mb-1.5 ml-1">
                      Malzeme Adı
                    </label>
                    <input 
                      autoFocus
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Örn: Süt, Yumurta..."
                      className="w-full h-12 bg-neutral-bg border border-neutral-border rounded-xl px-4 font-body text-sm text-neutral-text focus:outline-none focus:border-brand-primary transition-colors"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-neutral-muted uppercase tracking-widest mb-1.5 ml-1">
                        Miktar
                      </label>
                      <input 
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                        className="w-full h-12 bg-neutral-bg border border-neutral-border rounded-xl px-4 font-body text-sm text-neutral-text focus:outline-none focus:border-brand-primary transition-colors"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-neutral-muted uppercase tracking-widest mb-1.5 ml-1">
                        Birim
                      </label>
                      <select 
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="w-full h-12 bg-neutral-bg border border-neutral-border rounded-xl px-4 font-body text-sm text-neutral-text focus:outline-none focus:border-brand-primary transition-colors appearance-none"
                      >
                        <option value="adet">Adet</option>
                        <option value="g">Gram (g)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="ml">Mililitre (ml)</option>
                        <option value="l">Litre (l)</option>
                        <option value="paket">Paket</option>
                        <option value="kavanoz">Kavanoz</option>
                        <option value="şişe">Şişe</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-muted uppercase tracking-widest mb-1.5 ml-1">
                      Son Kullanma Tarihi
                    </label>
                    <input 
                      type="date"
                      value={newItemExpiry}
                      onChange={(e) => setNewItemExpiry(e.target.value)}
                      className="w-full h-12 bg-neutral-bg border border-neutral-border rounded-xl px-4 font-body text-sm text-neutral-text focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    fullWidth 
                    onClick={() => setShowAddModal(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" fullWidth>
                    Ekle
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};
