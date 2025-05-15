// This script helps force browsers to reload favicons by clearing cache
// The version number is updated whenever we need to refresh the favicon
window.faviconVersion = "1.0.0"; 

// Try to clear any cached favicons
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    cacheNames.forEach(function(cacheName) {
      if (cacheName.includes('favicon') || cacheName.includes('icon')) {
        caches.delete(cacheName);
      }
    });
  });
} 