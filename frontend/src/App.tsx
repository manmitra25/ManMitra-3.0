import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Navigation } from './components/Navigation';
import { StudentDashboard } from './components/student/StudentDashboard';
import { BestieChat } from './components/student/BestieChat';
import { ResourcesHub } from './components/student/ResourcesHub';
import { PeerSupportForum } from './components/student/PeerSupportForum';
import { DailyMoodCheck } from './components/student/DailyMoodCheck';
import { CounselorBookings } from './components/student/CounselorBookings';
import { ProfileSettings } from './components/student/ProfileSettings';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginModal } from './components/auth/LoginModal';
import { PWAInstaller } from './components/PWAInstaller';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineProvider, OfflineStatusIndicator } from './components/OfflineManager';

type UserRole = 'student' | 'counselor' | 'admin' | null;

function AppContent() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [anonymousMessagesLeft, setAnonymousMessagesLeft] = useState(5);

  const { user, profile, loading } = useAuth();
  const [authError, setAuthError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    
    if (role === 'student') {
      // Students can access anonymously
      setCurrentSection('dashboard');
    } else {
      // Counselors and admins need to login
      setShowLoginModal(true);
    }
  };

  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    setUserRole(null);
    setCurrentSection('dashboard');
  };

  const handleSignUpPrompt = () => {
    setShowLoginModal(true);
  };

  // Auto-set user role based on authentication
  if (user && !userRole) {
    if (profile) {
      setUserRole(profile.role);
    } else {
      // Fallback: try to get role from user metadata if profile is not loaded yet
      const metadataRole = user.user_metadata?.role;
      if (metadataRole && ['student', 'counselor', 'admin'].includes(metadataRole)) {
        setUserRole(metadataRole as UserRole);
      }
    }
  }

  const renderCurrentSection = () => {
    if (!userRole) return null;

    const sharedProps = {
      language,
      onNavigate: setCurrentSection,
      isOffline
    };

    switch (userRole) {
      case 'student':
        switch (currentSection) {
          case 'dashboard':
            return <StudentDashboard {...sharedProps} />;
          case 'chat':
            return (
              <BestieChat 
                language={language}
                isAnonymous={!user}
                anonymousMessagesLeft={anonymousMessagesLeft}
                onSignUpPrompt={handleSignUpPrompt}
                onCrisisDetected={(crisisLevel, message) => {
                  console.log('Crisis detected:', crisisLevel, message);
                  // Crisis management is handled within BestieChat component
                }}
              />
            );
          case 'resources':
            return <ResourcesHub language={language} />;
          case 'forum':
            return <PeerSupportForum language={language} />;
          case 'mood':
            return <DailyMoodCheck language={language} />;
          case 'bookings':
            return <CounselorBookings language={language} />;
          case 'profile':
            return <ProfileSettings language={language} />;
          default:
            return <StudentDashboard {...sharedProps} />;
        }

      case 'counselor':
        switch (currentSection) {
          case 'dashboard':
            return <CounselorDashboard />;
          default:
            return <CounselorDashboard />;
        }

      case 'admin':
        switch (currentSection) {
          case 'dashboard':
            return <AdminDashboard />;
          default:
            return <AdminDashboard />;
        }

      default:
        return null;
    }
  };

  // Simulate offline detection
  const handleOfflineToggle = () => {
    setIsOffline(!isOffline);
  };

  // Show loading screen while authentication is being processed
  if (loading && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <LandingPage onRoleSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        userRole={userRole}
        currentSection={currentSection}
        language={language}
        onSectionChange={setCurrentSection}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        <main className={`min-h-screen ${userRole === 'student' ? 'pb-16 lg:pb-0' : ''}`}>
          {authError && (
            <div className="p-4 mb-4 bg-warning/10 border border-warning/20 rounded-lg text-warning">
              ⚠️ {authError}
            </div>
          )}
          {renderCurrentSection()}
        </main>
      </div>

      {/* Demo Controls (Remove in production) */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-sm space-y-2">
        <div className="font-medium">Demo Controls:</div>
        <button 
          onClick={handleOfflineToggle}
          className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
        >
          Toggle Offline: {isOffline ? 'ON' : 'OFF'}
        </button>
        <button 
          onClick={() => setShowLoginModal(true)}
          className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
        >
          Auth: {user ? 'Logged In' : 'Anonymous'}
        </button>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal && !user}
        onClose={() => setShowLoginModal(false)}
        language={language}
        userRole={userRole || 'student'}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <OfflineProvider>
          <AuthProvider>
            <AppContent />
            <OfflineStatusIndicator />
            <PWAInstaller />
          </AuthProvider>
        </OfflineProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}