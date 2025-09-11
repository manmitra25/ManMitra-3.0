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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setProfile(null);
        return;
      }

      const { api } = await import('../../services/api');
      const response = await api.get('/auth/profile');
      const profileData = response.data.data;
      
      setProfile(profileData);
    } catch (error: any) {
      console.error('Profile refresh error:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        await signOut();
      }
    }
  };

  useEffect(() => {
    // Initialize auth state from token
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { api } = await import('../../services/api');
          const response = await api.get('/auth/profile');
          const { user: userData, ...profileData } = response.data.data;
          
          setUser(userData);
          setProfile(profileData);
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          if (error.response?.status === 401) {
            // Clear invalid tokens
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Import API service
      const { api } = await import('../../services/api');
      
      // Call backend login API
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, refreshToken, user: userData, profile: profileData } = response.data.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set user state
      setUser(userData);
      setProfile(profileData);
      setStoredAuth({ user: userData, profile: profileData });

      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred during sign in';
      return { error: errorMessage };
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
      
      // Import API service
      const { api } = await import('../../services/api');
      
      // Call backend signup API
      const response = await api.post('/auth/signup', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role || 'student',
        institution: userData.institution,
        privacy_consents: {
          share_chat_history: false,
          crisis_escalation: true,
          analytics_participation: false
        }
      });

      const { token, refreshToken, user: newUser, profile: newProfile } = response.data.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set user state
      setUser(newUser);
      setProfile(newProfile);
      setStoredAuth({ user: newUser, profile: newProfile });

      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred during sign up';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Call backend logout endpoint
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { api } = await import('../../services/api');
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with local logout even if API fails
        }
      }
      
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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

      const { api } = await import('../../services/api');
      const response = await api.put('/auth/profile', {
        privacy_consents: {
          ...profile.privacy_consents,
          ...consents
        }
      });

      const updatedProfile = response.data.data;
      setProfile(updatedProfile);
      setStoredAuth({ user, profile: updatedProfile });
      
      return {};
    } catch (error: any) {
      console.error('Privacy settings update error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update privacy settings';
      return { error: errorMessage };
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