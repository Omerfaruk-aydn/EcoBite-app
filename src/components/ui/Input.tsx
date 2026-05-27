import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: React.ReactNode;
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  icon,
  label,
  error,
  type,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-body font-medium text-neutral-text mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-muted">
            {icon}
          </span>
        )}
        <input
          type={inputType}
          className={`w-full bg-white border-[1.5px] border-neutral-border rounded-2xl py-3.5 font-body text-neutral-text placeholder:text-neutral-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-light focus:outline-none transition-all duration-200 ${
            icon ? 'pl-12 pr-4' : 'px-4'
          } ${isPassword ? 'pr-12' : ''} ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-text transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger font-body">{error}</p>
      )}
    </div>
  );
};
