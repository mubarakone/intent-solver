'use client'

import React from 'react'

/**
 * A button component optimized for MiniApp context
 * - Larger touch targets
 * - Touch-friendly styling
 * - Proper state indicators
 */
export default function MiniAppButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'primary', // 'primary', 'secondary', 'danger', 'success'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  fullWidth = false,
  ...props
}) {
  // Generate styles based on type and size
  const getTypeStyles = () => {
    switch (type) {
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-700';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm py-1.5 px-3';
      case 'lg':
        return 'text-base py-3 px-6';
      case 'md':
      default:
        return 'text-sm py-2.5 px-5';
    }
  };

  const baseStyles = 'rounded-lg font-medium transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const typeStyles = getTypeStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${typeStyles} ${sizeStyles} ${disabledStyles} ${widthStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
} 