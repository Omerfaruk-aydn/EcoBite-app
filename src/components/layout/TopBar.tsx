import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <h1
        className="font-heading font-extrabold text-xl text-brand-primary cursor-pointer"
        onClick={() => navigate('/home')}
      >
        EcoBite
      </h1>
      <button
        onClick={() => navigate('/profile')}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-light hover:border-brand-primary transition-colors"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user?.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-surface flex items-center justify-center">
            <span className="text-brand-primary font-heading font-bold text-sm">
              {user?.displayName?.charAt(0) || 'U'}
            </span>
          </div>
        )}
      </button>
    </div>
  );
};
