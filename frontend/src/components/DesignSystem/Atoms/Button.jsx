import React from 'react';
import { useKidsMode } from '../../../hooks/useKidsMode';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  ...props 
}) => {
  const { isKidsMode } = useKidsMode();
  
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const adultVariants = {
    primary: 'bg-neighbor-primary text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-neighbor-neutral text-slate-900 border border-slate-200 hover:bg-slate-200 focus:ring-slate-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
    outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
  };

  const kidsVariants = {
    primary: 'bubble-button bg-scout-orange text-white hover:bg-orange-600',
    secondary: 'bubble-button bg-scout-green text-slate-800 hover:bg-green-500',
    ghost: 'bg-transparent text-scout-orange font-bold hover:bg-scout-yellow/20',
    outline: 'bg-transparent border-4 border-scout-orange text-scout-orange font-bold hover:bg-scout-orange/10',
  };

  const variants = isKidsMode ? kidsVariants : adultVariants;

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
  };

  const finalSize = isKidsMode ? 'px-8 py-4 text-xl' : sizes[size];

  return (
    <button
      className={`${isKidsMode ? '' : baseStyles} ${variants[variant]} ${finalSize} ${className}`}
      disabled={disabled}
      style={isKidsMode ? { minWidth: '48px', minHeight: '48px' } : {}}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

