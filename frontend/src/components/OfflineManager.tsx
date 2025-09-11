import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Wifi, 
  WifiOff, 
  CloudOff, 
  RefreshCw, 
  Database, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface OfflineData {
  chatMessages: any[];
  forumPosts: any[];
  moodEntries: any[];
  userPreferences: any;
  lastSync: string | null;
}

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  syncData: () => Promise<void>;
  saveOfflineData: (key: keyof OfflineData, data: any) => void;
  getOfflineData: (key: keyof OfflineData) => any;
  pendingSyncCount: number;
  lastSyncTime: string | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    chatMessages: [],
    forumPosts: [],
    moodEntries: [],
    userPreferences: {},
    lastSync: null
  });
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Load offline data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('manmitra-offline-data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOfflineData(parsed);
        
        // Count pending sync items
        const pending = Object.values(parsed).flat().filter((item: any) => 
          item && typeof item === 'object' && item.pendingSync
        ).length;
        setPendingSyncCount(pending);
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }
  }, []);

  // Save offline data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('manmitra-offline-data', JSON.stringify(offlineData));
  }, [offlineData]);

  // Listen for online/offline events
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowOfflineAlert(false);
      // Auto-sync when coming back online
      if (pendingSyncCount > 0) {
        syncData();
      }
    }

    function handleOffline() {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setIsOfflineMode(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount]);

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
  };

  const saveOfflineData = (key: keyof OfflineData, data: any) => {
    setOfflineData(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key]) 
        ? [...prev[key], { ...data, pendingSync: true, timestamp: new Date().toISOString() }]
        : { ...data, pendingSync: true, timestamp: new Date().toISOString() }
    }));
    
    if (!isOnline || isOfflineMode) {
      setPendingSyncCount(prev => prev + 1);
    }
  };

  const getOfflineData = (key: keyof OfflineData) => {
    return offlineData[key];
  };

  const syncData = async () => {
    if (!isOnline) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      // Simulate API calls to sync data
      console.log('Syncing offline data...');
      
      // Reset pending sync flags
      const updatedData = { ...offlineData };
      Object.keys(updatedData).forEach(key => {
        if (Array.isArray(updatedData[key as keyof OfflineData])) {
          updatedData[key as keyof OfflineData] = (updatedData[key as keyof OfflineData] as any[])
            .map(item => ({ ...item, pendingSync: false }));
        } else if (typeof updatedData[key as keyof OfflineData] === 'object') {
          updatedData[key as keyof OfflineData] = { 
            ...updatedData[key as keyof OfflineData], 
            pendingSync: false 
          };
        }
      });
      
      updatedData.lastSync = new Date().toISOString();
      setOfflineData(updatedData);
      setPendingSyncCount(0);
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const contextValue: OfflineContextType = {
    isOnline,
    isOfflineMode,
    toggleOfflineMode,
    syncData,
    saveOfflineData,
    getOfflineData,
    pendingSyncCount,
    lastSyncTime: offlineData.lastSync
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
      <OfflineNotification 
        show={showOfflineAlert || (!isOnline && !isOfflineMode)}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onDismiss={() => setShowOfflineAlert(false)}
        onSync={syncData}
      />
    </OfflineContext.Provider>
  );
}

interface OfflineNotificationProps {
  show: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  onDismiss: () => void;
  onSync: () => void;
}

function OfflineNotification({ 
  show, 
  isOnline, 
  pendingSyncCount, 
  onDismiss, 
  onSync 
}: OfflineNotificationProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert className={`border-2 ${isOnline ? 'border-success bg-success/10' : 'border-warning bg-warning/10'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-warning" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <AlertDescription>
                <div className="font-medium mb-1">
                  {isOnline ? 'Back Online!' : 'You\'re Offline'}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {isOnline 
                    ? 'Your connection has been restored.' 
                    : 'Don\'t worry - you can continue using ManMitra offline.'
                  }
                </div>
                
                {pendingSyncCount > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-3 w-3" />
                    <span className="text-xs">
                      {pendingSyncCount} items waiting to sync
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {isOnline && pendingSyncCount > 0 && (
                    <Button 
                      size="sm" 
                      onClick={onSync}
                      className="h-6 px-2 text-xs bg-success hover:bg-success/90 text-success-foreground"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onDismiss}
                    className="h-6 px-2 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
    </div>
  );
}

// Offline Status Indicator Component
export function OfflineStatusIndicator() {
  const { isOnline, isOfflineMode, pendingSyncCount, lastSyncTime } = useOffline();
  
  if (isOnline && !isOfflineMode && pendingSyncCount === 0) {
    return null;
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <Badge 
        variant={isOnline && !isOfflineMode ? 'secondary' : 'outline'}
        className={`flex items-center gap-2 px-3 py-1 ${
          isOnline && !isOfflineMode 
            ? 'bg-success/10 text-success border-success/20' 
            : 'bg-warning/10 text-warning border-warning/20'
        }`}
      >
        {isOnline && !isOfflineMode ? (
          <>
            <CheckCircle className="h-3 w-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <CloudOff className="h-3 w-3" />
            <span>Offline Mode</span>
          </>
        )}
        
        {pendingSyncCount > 0 && (
          <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
            {pendingSyncCount}
          </Badge>
        )}
      </Badge>
      
      {lastSyncTime && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          Last sync: {formatLastSync(lastSyncTime)}
        </div>
      )}
    </div>
  );
}