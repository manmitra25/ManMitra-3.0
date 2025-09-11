import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'counselor' | 'admin';
  institution?: string;
  privacy_consents?: {
    share_chat_history: boolean;
    crisis_escalation: boolean;
    analytics_participation: boolean;
  };
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    institution?: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePrivacySettings: (consents: Record<string, boolean>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user storage using localStorage
  const STORAGE_KEY = 'manmitra_auth';
  const USERS_KEY = 'manmitra_users';

  const getStoredAuth = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const setStoredAuth = (authData: { user: User; profile: UserProfile } | null) => {
    if (authData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getStoredUsers = (): Array<{ user: User; profile: UserProfile; password: string }> => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setStoredUsers = (users: Array<{ user: User; profile: UserProfile; password: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const refreshProfile = async () => {
    // Mock implementation - just reload from storage
    const stored = getStoredAuth();
    if (stored) {
      setProfile(stored.profile);
    }
  };

  useEffect(() => {
    // Load initial auth state from localStorage
    setTimeout(() => {
      const stored = getStoredAuth();
      if (stored) {
        setUser(stored.user);
        setProfile(stored.profile);
      }
      setLoading(false);
    }, 100);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const users = getStoredUsers();
      const foundUser = users.find(u => u.user.email === email && u.password === password);
      
      if (!foundUser) {
        return { error: 'Invalid email or password' };
      }

      setUser(foundUser.user);
      setProfile(foundUser.profile);
      setStoredAuth({ user: foundUser.user, profile: foundUser.profile });

      return {};
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: 'An unexpected error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    institution?: string;
  }) => {
    try {
      setLoading(true);
      
      const users = getStoredUsers();
      
      // Check if user already exists
      if (users.find(u => u.user.email === userData.email)) {
        return { error: 'User with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email
      };

      const newProfile: UserProfile = {
        id: newUser.id,
        email: userData.email,
        name: userData.name,
        role: (userData.role as 'student' | 'counselor' | 'admin') || 'student',
        institution: userData.institution,
        privacy_consents: {
          share_chat_history: false,
          crisis_escalation: true,
          analytics_participation: false
        }
      };

      // Store user
      users.push({ user: newUser, profile: newProfile, password: userData.password });
      setStoredUsers(users);

      // Auto sign in
      setUser(newUser);
      setProfile(newProfile);
      setStoredAuth({ user: newUser, profile: newProfile });
      
      return {};
      
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create account. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      setUser(null);
      setProfile(null);
      setStoredAuth(null);
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (consents: Record<string, boolean>) => {
    try {
      if (!user || !profile) {
        return { error: 'User not authenticated' };
      }

      // Update the profile with new consents
      const updatedProfile = {
        ...profile,
        privacy_consents: {
          ...profile.privacy_consents,
          ...consents
        }
      };

      // Update in storage
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.user.id === user.id);
      if (userIndex >= 0) {
        users[userIndex].profile = updatedProfile;
        setStoredUsers(users);
      }

      // Update local state
      setProfile(updatedProfile);
      setStoredAuth({ user, profile: updatedProfile });
      
      return {};
    } catch (error) {
      console.error('Privacy settings update error:', error);
      return { error: 'Failed to update privacy settings' };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updatePrivacySettings,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}