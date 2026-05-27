import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-4xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white rounded-t-4xl px-5 pt-4 pb-3 border-b border-neutral-border z-10">
              <div className="w-10 h-1 bg-neutral-border rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className="font-heading font-bold text-lg text-neutral-text">{title}</h3>
                )}
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-full hover:bg-neutral-bg transition-colors"
                >
                  <X size={20} className="text-neutral-muted" />
                </button>
              </div>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
