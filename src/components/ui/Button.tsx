import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'google' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-4 text-base',
    lg: 'px-8 py-5 text-lg',
  };

  const baseClasses = `relative inline-flex items-center justify-center gap-3 rounded-full font-heading font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`;

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:shadow-lg shadow-md',
    outline: 'bg-brand-surface text-brand-primary border border-brand-light hover:bg-brand-light/30',
    google: 'bg-white text-neutral-text border border-neutral-border hover:shadow-md',
    gradient: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-lg shadow-md',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
};
