import Constants from 'expo-constants';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { login as authLogin, logout as authLogout, signInWithGoogle as authSignInWithGoogle, getCurrentUser, initialize } from '../services/firebaseauthservice';
import { AuthUser } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 AuthContext: Refreshing user state...');
      const currentUser = await getCurrentUser();

      // Only update if there's a change to prevent unnecessary re-renders
      if (currentUser?.uid !== user?.uid) {
        console.log('🔄 AuthContext: User state changed, updating...');
        setUser(currentUser);
      }
    } catch (error) {
      console.error('🔄 AuthContext: Error refreshing user:', error);
      // Only set user to null if we're sure they're not authenticated
      if (user) {
        console.log('🔄 AuthContext: Setting user to null due to refresh error');
        setUser(null);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    initializeAuth();

    // Set up periodic auth state check for web platform
    if (Platform.OS === 'web') {
      const interval = setInterval(refreshUser, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [refreshUser]);

  // Debug effect to track user state changes
  useEffect(() => {
    console.log('🔵 AuthContext: User state changed:', user ? `${user.email} (${user.role})` : 'null');
  }, [user]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      await initialize();
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthUser> => {
     try {
       console.log('🔵 AuthContext: login function called');
       const user = await authLogin(email, password);
       console.log('🔵 AuthContext: authLogin completed, user:', user);
       setUser(user);
       console.log('🔵 AuthContext: user state updated');
       return user;
     } catch (error: any) {
       console.error('🔵 AuthContext: login error:', error);
       throw error;
     }
   };



  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Check if running in Expo Go on mobile
      if (Platform.OS !== 'web' && Constants.appOwnership === 'expo') {
        Alert.alert(
          'Google Sign-In Tidak Tersedia',
          'Google Sign-In tidak dapat digunakan di Expo Go. Silakan:\n\n1. Gunakan development build, atau\n2. Akses aplikasi melalui web browser',
          [
            {
              text: 'Buka Web Version',
              onPress: () => {
                // Redirect ke web version jika memungkinkan
                console.log('Redirect to web version: http://localhost:8081');
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }
      
      const result = await authSignInWithGoogle();

      // Handle redirect case
      if (result.isRedirecting) {
        console.log('Google Sign-In redirect initiated');
        // Don't set user yet, will be handled by redirect result
        return;
      }

      setUser(result.user);
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error types
      if (error.message.includes('Expo Go') || error.message.includes('RNGoogleSignin')) {
        Alert.alert(
          'Authentication Error',
          error.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sign In Failed',
          'Terjadi kesalahan saat sign in. Silakan coba lagi.',
          [{ text: 'OK' }]
        );
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
     try {
       console.log('🔵 AuthContext: logout function called');
       setLoading(true);
       await authLogout();
       console.log('🔵 AuthContext: AuthService.logout completed');
       setUser(null);
       console.log('🔵 AuthContext: user set to null');
     } catch (error) {
       console.error('🔵 AuthContext: Logout error:', error);
       throw error;
     } finally {
       setLoading(false);
       console.log('🔵 AuthContext: loading set to false');
     }
   };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signInWithGoogle,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };

