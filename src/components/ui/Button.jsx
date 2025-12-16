import React from 'react';
import { cn } from '../../libs/utils';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading, 
  ...props 
}) => {
  
  // Define styles for different variants
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/20",
    secondary: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border-2 border-orange-600 text-orange-600 hover:bg-orange-50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button 
      className={cn(
        "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant], // Apply the specific variant style
        className // Allow custom classes to override if needed
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;