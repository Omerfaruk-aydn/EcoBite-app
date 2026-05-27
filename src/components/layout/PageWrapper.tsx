import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`min-h-screen bg-neutral-bg ${noPadding ? '' : 'pb-24'} ${className}`}
    >
      {children}
    </motion.div>
  );
};
