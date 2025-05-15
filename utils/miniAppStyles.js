'use client'

/**
 * Optimized styles for MiniApp UI components
 * These provide consistent and touch-friendly styling across the MiniApp
 */

// Base button styles optimized for touch
export const buttonStyles = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-medium',
  danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium',
  success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium',
  disabled: 'opacity-50 cursor-not-allowed',
};

// Input styles with larger touch targets
export const inputStyles = {
  base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
};

// Card styles optimized for MiniApp
export const cardStyles = {
  base: 'bg-white rounded-lg shadow-sm p-4 mb-4',
  interactive: 'bg-white rounded-lg shadow-sm p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200',
};

// Typography styles
export const typographyStyles = {
  title: 'text-xl font-bold mb-2',
  subtitle: 'text-lg font-semibold mb-2',
  body: 'text-base',
  caption: 'text-sm text-gray-500',
};

// Layout styles
export const layoutStyles = {
  container: 'p-4',
  flexRow: 'flex flex-row items-center',
  flexCol: 'flex flex-col',
  spaceBetween: 'flex justify-between items-center',
};

// Form styles
export const formStyles = {
  group: 'mb-4',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  error: 'mt-1 text-sm text-red-600',
};

// List styles
export const listStyles = {
  item: 'border-b border-gray-100 py-3 last:border-0',
  itemInteractive: 'border-b border-gray-100 py-3 last:border-0 hover:bg-gray-50',
}; 