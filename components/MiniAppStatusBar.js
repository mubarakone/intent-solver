'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * A status bar component specifically designed for MiniApp context
 * This provides non-intrusive notifications for actions
 */
export default function MiniAppStatusBar({ 
  message = '', 
  type = 'info', // 'info', 'success', 'error', 'warning'
  duration = 3000, // milliseconds
  show = false 
}) {
  const [isVisible, setIsVisible] = useState(show);

  // Handle visibility changes
  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
  };

  // Early return if not visible
  if (!isVisible) return null;

  // Determine styles based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <CheckCircle className="w-4 h-4 text-green-500" />
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: <AlertCircle className="w-4 h-4 text-red-500" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: <AlertCircle className="w-4 h-4 text-yellow-500" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <AlertCircle className="w-4 h-4 text-blue-500" />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2">
      <div className={`flex items-center justify-between w-full max-w-sm px-4 py-2 rounded-md shadow-sm ${styles.bg} ${styles.text} ${styles.border}`}>
        <div className="flex items-center gap-2">
          {styles.icon}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button 
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-white/20"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 