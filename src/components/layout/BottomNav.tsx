import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Camera, Heart, User, Search } from 'lucide-react';

const tabs = [
  { icon: Home, label: 'Keşfet', path: '/home' },
  { icon: Search, label: 'Tarifler', path: '/all-recipes' },
  { icon: Camera, label: 'Tara', path: '/camera' },
  { icon: Heart, label: 'Favoriler', path: '/favorites' },
  { icon: User, label: 'Profil', path: '/profile' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on camera page
  if (location.pathname === '/camera') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-t border-neutral-border shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-[430px] mx-auto h-[76px] flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path === '/home' && location.pathname === '/');
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.path}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 py-1 px-4 relative"
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon
                  size={24}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-brand-primary' : 'text-neutral-muted'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
              <span className={`text-[10px] font-heading font-bold transition-colors ${
                  isActive ? 'text-brand-primary' : 'text-neutral-muted'
                }`}>
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-[1.5px] w-8 h-[3px] bg-brand-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};
