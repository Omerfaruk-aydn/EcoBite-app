import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RecipeCardProps {
  id: string | number;
  title: string;
  image: string;
  index?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ id, title, image, index = 0 }) => {
  const navigate = useNavigate();
  
  // Route external images through our proxy to bypass hotlink protection
  const proxyUrl = image && image.startsWith('http') 
    ? `/api/recipes/image-proxy?url=${encodeURIComponent(image)}`
    : image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/recipe/${id}`)}
      className="flex-shrink-0 w-[160px] cursor-pointer group"
    >
      <div className="rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] bg-white">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={proxyUrl}
            alt={title}

            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Show a beautiful gradient placeholder with a food icon instead of burgers
              const colors = ['%234ade80','%2334d399','%2322d3ee','%23818cf8','%23f472b6','%23fb923c','%23facc15'];
              const hash = title.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
              const c1 = colors[Math.abs(hash) % colors.length];
              const c2 = colors[(Math.abs(hash) + 3) % colors.length];
              const encodedTitle = encodeURIComponent(title.slice(0, 20));
              e.currentTarget.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='${c1}'/><stop offset='100%25' stop-color='${c2}'/></linearGradient></defs><rect width='400' height='300' fill='url(%23g)'/><text x='200' y='130' text-anchor='middle' font-size='48' fill='white' opacity='0.9'>🍽️</text><text x='200' y='180' text-anchor='middle' font-size='14' fill='white' font-family='sans-serif' opacity='0.8'>${encodedTitle}</text></svg>`;
            }}
          />

        </div>
        <div className="p-3 flex items-center justify-between gap-1">
          <p className="font-body font-bold text-sm text-neutral-text text-left line-clamp-2">
            {title}
          </p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-muted flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
