import { useState } from 'react';
import { ManMitraLogo } from './ManMitraLogo';
import { LanguageSelector } from './LanguageSelector';
import { Button } from './ui/button';
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Calendar, 
  User, 
  TrendingUp,
  Heart,
  BarChart3,
  Settings,
  Shield,
  FileText,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  section: string;
}

const studentNavItems = {
  en: [
    { id: 'home', label: 'Home', icon: Home, section: 'dashboard' },
    { id: 'chat', label: 'Bestie Chat', icon: MessageCircle, section: 'chat' },
    { id: 'resources', label: 'Resources', icon: BookOpen, section: 'resources' },
    { id: 'forum', label: 'Peer Forum', icon: Users, section: 'forum' },
    { id: 'mood', label: 'Mood Check', icon: Heart, section: 'mood' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, section: 'bookings' },
    { id: 'profile', label: 'Profile', icon: User, section: 'profile' }
  ],
  hi: [
    { id: 'home', label: 'होम', icon: Home, section: 'dashboard' },
    { id: 'chat', label: 'बेस्टी चैट', icon: MessageCircle, section: 'chat' },
    { id: 'resources', label: 'संसाधन', icon: BookOpen, section: 'resources' },
    { id: 'forum', label: 'साथी फोरम', icon: Users, section: 'forum' },
    { id: 'mood', label: 'मूड चेक', icon: Heart, section: 'mood' },
    { id: 'bookings', label: 'बुकिंग', icon: Calendar, section: 'bookings' },
    { id: 'profile', label: 'प्रोफाइल', icon: User, section: 'profile' }
  ],
  ur: [
    { id: 'home', label: 'ہوم', icon: Home, section: 'dashboard' },
    { id: 'chat', label: 'بیسٹی چیٹ', icon: MessageCircle, section: 'chat' },
    { id: 'resources', label: 'وسائل', icon: BookOpen, section: 'resources' },
    { id: 'forum', label: 'ساتھی فورم', icon: Users, section: 'forum' },
    { id: 'mood', label: 'موڈ چیک', icon: Heart, section: 'mood' },
    { id: 'bookings', label: 'بکنگز', icon: Calendar, section: 'bookings' },
    { id: 'profile', label: 'پروفائل', icon: User, section: 'profile' }
  ]
};

const counselorNavItems = {
  en: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'dashboard' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, section: 'appointments' },
    { id: 'alerts', label: 'Alerts', icon: Shield, section: 'alerts' },
    { id: 'notes', label: 'Session Notes', icon: FileText, section: 'notes' },
    { id: 'profile', label: 'Profile', icon: User, section: 'profile' }
  ]
};

const adminNavItems = {
  en: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'dashboard' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'analytics' },
    { id: 'counselors', label: 'Counselors', icon: UserCheck, section: 'counselors' },
    { id: 'content', label: 'Content', icon: FileText, section: 'content' },
    { id: 'moderation', label: 'Moderation', icon: Shield, section: 'moderation' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'settings' }
  ]
};

interface NavigationProps {
  userRole: 'student' | 'counselor' | 'admin';
  currentSection: string;
  language: string;
  onSectionChange: (section: string) => void;
  onLanguageChange: (language: string) => void;
  onLogout?: () => void;
}

export function Navigation({ 
  userRole, 
  currentSection, 
  language, 
  onSectionChange, 
  onLanguageChange,
  onLogout 
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavItems = () => {
    switch (userRole) {
      case 'student':
        return studentNavItems[language as keyof typeof studentNavItems] || studentNavItems.en;
      case 'counselor':
        return counselorNavItems.en;
      case 'admin':
        return adminNavItems.en;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-border">
      <div className="flex items-center gap-3 p-6 border-b">
        <ManMitraLogo size="sm" />
        <span className="font-semibold">ManMitra</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.section;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.section)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        <LanguageSelector 
          currentLanguage={language}
          onLanguageChange={onLanguageChange}
        />
        {onLogout && (
          <Button variant="outline" onClick={onLogout} className="w-full">
            Logout
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile Top Navigation
  const MobileTopNav = () => (
    <div className="lg:hidden bg-white border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <ManMitraLogo size="sm" />
        <span className="font-semibold">ManMitra</span>
      </div>
      
      <LanguageSelector 
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
        variant="minimal"
      />
    </div>
  );

  // Mobile Bottom Navigation (Student only)
  const MobileBottomNav = () => {
    if (userRole !== 'student') return null;
    
    const mainNavItems = navItems.slice(0, 5); // Show first 5 items in bottom nav
    
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.section;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.section)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Mobile Menu Overlay
  const MobileMenuOverlay = () => {
    if (!isMobileMenuOpen) return null;
    
    return (
      <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <ManMitraLogo size="sm" />
              <span className="font-semibold">ManMitra</span>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.section;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.section);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {onLogout && (
            <div className="p-4 border-t">
              <Button variant="outline" onClick={onLogout} className="w-full">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <DesktopSidebar />
      <MobileTopNav />
      <MobileBottomNav />
      <MobileMenuOverlay />
    </>
  );
}