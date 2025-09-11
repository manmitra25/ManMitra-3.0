import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    } catch (error) {
      console.warn('PWA: Failed to check if app is installed', error);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
        const event = e as BeforeInstallPromptEvent;
        setDeferredPrompt(event);
        
        // Show install prompt after user has used the app for a bit
        setTimeout(() => {
          if (!sessionStorage.getItem('pwa-install-dismissed')) {
            setShowInstallPrompt(true);
          }
        }, 30000); // Show after 30 seconds
      } catch (error) {
        console.warn('PWA: Failed to handle install prompt', error);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      try {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
        console.log('PWA: App installed successfully');
      } catch (error) {
        console.warn('PWA: Failed to handle app installed event', error);
      }
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    // Add event listeners with error handling
    try {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    } catch (error) {
      console.warn('PWA: Failed to add event listeners', error);
    }

    // Register service worker with comprehensive error handling
    // Skip service worker registration in Figma preview environment
    if ('serviceWorker' in navigator && !window.location.hostname.includes('figma')) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('PWA: Service Worker registered successfully', registration);
          
          // Listen for updates
          try {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('PWA: New version available');
                    // Could show update notification here
                  }
                });
              }
            });
          } catch (error) {
            console.warn('PWA: Failed to listen for service worker updates', error);
          }
        })
        .catch(error => {
          console.warn('PWA: Service Worker registration failed. App will continue to work without offline features.', error);
          // App continues to function normally without service worker
        });
    } else {
      console.info('PWA: Service Worker registration skipped (development/preview environment)');
    }

    return () => {
      try {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      } catch (error) {
        console.warn('PWA: Failed to remove event listeners', error);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted install prompt');
        } else {
          console.log('PWA: User dismissed install prompt');
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.warn('PWA: Failed to show install prompt', error);
        setShowInstallPrompt(false);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if dismissed in this session or in preview environment
  if (sessionStorage.getItem('pwa-install-dismissed') === 'true' || 
      window.location.hostname.includes('figma')) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 text-center text-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>You're offline. Cached features are still available.</span>
              <Wifi className="h-4 w-4 opacity-50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !isInstalled && deferredPrompt && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          >
            <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                      <Download className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Install ManMitra</CardTitle>
                      <CardDescription className="text-xs">
                        Get the full app experience
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissInstallPrompt}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Smartphone className="h-3 w-3" />
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Monitor className="h-3 w-3" />
                    <span>Fast access</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    className="flex-1"
                    size="sm"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install App
                  </Button>
                  <Button
                    variant="outline"
                    onClick={dismissInstallPrompt}
                    size="sm"
                  >
                    Not now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Status Indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 left-2 z-50">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success' : 'bg-destructive'}`} 
               title={isOnline ? 'Online' : 'Offline'} />
        </div>
      )}
    </>
  );
}

// Hook for checking PWA installation status
export function usePWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if can install
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isInstalled, isOnline, canInstall };
}