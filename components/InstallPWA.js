'use client'

import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      // Store the event for later use
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    // Check if the app is already installed
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = async () => {
    if (!promptInstall) {
      return;
    }
    // Show the install prompt
    promptInstall.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await promptInstall.userChoice;
    // Hide the app install prompt
    setPromptInstall(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!supportsPWA || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 flex justify-between items-center">
      <div>
        <p className="font-medium">Install Intent Solver App</p>
        <p className="text-sm opacity-80">Access even when offline</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={handleDismiss}
          className="py-2 px-4 rounded-md font-medium border border-white text-white hover:bg-white/10 transition-colors"
        >
          Close
        </button>
        <button 
          onClick={onClick}
          className="bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
} 