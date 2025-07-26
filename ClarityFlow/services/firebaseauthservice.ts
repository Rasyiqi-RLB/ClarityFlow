import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Conditional import for Google Sign-In to avoid TurboModule errors in Expo Go
let GoogleSignin: any = null;
try {
  if (Platform.OS !== 'web') {
    const isExpoGo = Constants.appOwnership === 'expo';
    
    if (!isExpoGo) {
      GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    }
  }
} catch (error: any) {
  console.log('Google Sign-In module not available:', error.message);
}

import {
    createUserWithEmailAndPassword,
    getRedirectResult,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    updateProfile,
    UserCredential
} from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { auth, db, GoogleAuthProvider } from '../config/firebase';
import { logger } from '../services/loggingService';
import { AuthenticationError, AuthResult, AuthUser, UserRole } from '../types/auth';
import { getAuthErrorMessage, getPlatformInfo } from '../utils/platformUtils';

export class FirebaseAuthService {
  private static currentUser: AuthUser | null = null;
  private static authStateListener: (() => void) | null = null;
  private static platformInfo = getPlatformInfo();

  // Initialize Firebase Auth listener
  static initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      let isResolved = false;

      const resolveOnce = () => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      };

      const rejectOnce = (error: any) => {
        if (!isResolved) {
          isResolved = true;
          reject(error);
        }
      };

      try {
        console.log('Initializing Firebase Auth...');

        // Note: Using Firebase Authentication for Google Sign-In
        // No need to configure Google Sign-In SDK separately

        // Handle redirect result for web platform only
        const handleRedirectResult = async () => {
          // Only handle redirect result on web platform
          if (Platform.OS !== 'web') {
            return;
          }

          try {
            const result = await getRedirectResult(auth);
            if (result) {
              console.log('Google Sign-In redirect successful:', result.user.uid);
              // Handle the redirect result like a normal sign-in
              const userData = await this.getUserData(result.user.uid);
              this.currentUser = userData;
            }
          } catch (redirectError: any) {
            console.error('Error handling redirect result:', redirectError);
          }
        };

        // Initialize everything
        const initializeAuth = async () => {
          try {
            await handleRedirectResult();

            this.authStateListener = onAuthStateChanged(auth, async (firebaseUser) => {
              if (firebaseUser) {
                try {
                  const userData = await this.getUserData(firebaseUser.uid);
                  this.currentUser = userData;
                } catch (error) {
                  console.error('Error loading user data:', error);
                  this.currentUser = null;
                }
              } else {
                this.currentUser = null;
              }

              // Only resolve on the first auth state change
              resolveOnce();
            });

            console.log('Firebase Auth initialized successfully');
          } catch (error) {
            console.error('Error initializing Firebase Auth:', error);
            resolveOnce(); // Still resolve to prevent hanging
          }
        };

        initializeAuth();

      } catch (error) {
        console.error('Error in Firebase Auth initialization:', error);
        rejectOnce(error);
      }
    });
  }

  // Register new user
  static async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = 'member'
  ): Promise<AuthUser> {
    try {
      // Create Firebase user
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const firebaseUser = userCredential.user;
      
      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: name
      });

      // Create user document in Firestore
      const userData: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: name,
        photoURL: firebaseUser.photoURL || undefined,
        role: role,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      this.currentUser = userData;
      return userData;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData = await this.getUserData(firebaseUser.uid);
      this.currentUser = userData;
      
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Google Sign-In dengan enhanced error handling
  static async signInWithGoogle(): Promise<AuthResult> {
    const startTime = Date.now();
    logger.logAuthEvent('google_signin_attempt', { platform: Platform.OS });
    
    try {
      // Check platform capabilities
      if (!this.platformInfo.canUseGoogleSignIn) {
        const error = new AuthenticationError(
          'EXPO_GO_LIMITATION',
          'Google Sign-In tidak tersedia di Expo Go. Silakan gunakan development build atau akses melalui web browser.',
          'EXPO_GO_LIMITATION'
        );
        logger.logAuthEvent('google_signin_failed', { reason: 'expo_go_limitation' }, error);
        throw error;
      }
      
      let userCredential;
      
      if (Platform.OS === 'web') {
        // Web platform - use Firebase Auth popup with CORS handling
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Set custom parameters for better UX and CORS handling
        provider.setCustomParameters({
          prompt: 'select_account',
          // Add parameters to handle CORS issues
          access_type: 'online',
          include_granted_scopes: 'true'
        });
        
        try {
          console.log('🔍 Attempting Google Sign-In with Firebase Auth...');
          console.log('🔍 Current domain:', window.location.hostname);
          console.log('🔍 Current origin:', window.location.origin);

          userCredential = await signInWithPopup(auth, provider);
          console.log('✅ Google Sign-In successful');
        } catch (popupError: any) {
          console.error('❌ Google Sign-In popup error:', popupError);
          console.error('❌ Error code:', popupError.code);
          console.error('❌ Error message:', popupError.message);
          
          // Handle specific popup and CORS errors
          if (popupError.code === 'auth/popup-blocked') {
            throw new Error('Popup diblokir browser. Silakan aktifkan popup untuk domain ini.');
          } else if (popupError.code === 'auth/popup-closed-by-user') {
            throw new Error('Login dibatalkan. Silakan coba lagi.');
          } else if (popupError.code === 'auth/unauthorized-domain' ||
                     popupError.message?.includes('DEVELOPER_ERROR') ||
                     popupError.message?.includes('not authorized')) {
            const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
            throw new Error(`Domain '${currentDomain}' tidak diotorisasi untuk Google Sign-In. Silakan tambahkan domain ini ke Firebase Console > Authentication > Settings > Authorized domains.`);
          } else if (popupError.message?.includes('Cross-Origin-Opener-Policy') ||
                     popupError.message?.includes('window.closed')) {
            // Try redirect method as fallback for CORS issues
             console.log('Popup blocked by CORS policy, trying redirect method...');
             try {
               await signInWithRedirect(auth, provider);
               // Note: signInWithRedirect doesn't return immediately
               // We need to handle this in app initialization
               // Return a special result to indicate redirect is in progress
               return {
                 user: null, // Will be handled by redirect result
                 isNewUser: false,
                 isRedirecting: true
               };
             } catch (redirectError: any) {
               console.error('Redirect method also failed:', redirectError);
               throw new Error('Login gagal karena kebijakan browser. Silakan coba browser lain atau aktifkan popup.');
             }
          }
          throw popupError;
        }
      } else {
        // Check if running in Expo Go or GoogleSignin not available
        const isExpoGo = Constants.appOwnership === 'expo';
        
        if (isExpoGo || !GoogleSignin) {
          const error = new AuthenticationError(
            'EXPO_GO_LIMITATION',
            'Google Sign-In tidak tersedia di Expo Go atau development build. Silakan gunakan web browser untuk login dengan Google.',
            'EXPO_GO_LIMITATION'
          );
          logger.logAuthEvent('google_signin_failed', { reason: 'module_unavailable' }, error);
          throw error;
        }
        
        // Mobile platform: use Google Sign-In SDK
        try {
          // Check if device supports Google Play Services
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          
          // Get the user's ID token
          const signInResult = await GoogleSignin.signIn();
          const idToken = signInResult.data?.idToken;
          
          if (!idToken) {
            throw new Error('Failed to get ID token from Google Sign-In');
          }
          
          // Create a Google credential with the token
          const googleCredential = GoogleAuthProvider.credential(idToken);
          
          // Sign in with the credential
          userCredential = await signInWithCredential(auth, googleCredential);
        } catch (error: any) {
          console.error('Google Sign-In error:', error);
          if (error.message.includes('RNGoogleSignin') || error.message.includes('TurboModuleRegistry')) {
            const authError = new AuthenticationError(
              'GOOGLE_SIGNIN_UNAVAILABLE',
              'Google Sign-In module tidak tersedia. Pastikan menggunakan development build yang tepat.',
              'GOOGLE_SIGNIN_UNAVAILABLE'
            );
            logger.logAuthEvent('google_signin_failed', { reason: 'module_error' }, authError);
            throw authError;
          }
          throw error;
        }
      }
      
      const firebaseUser = userCredential.user;
      
      // Check if user exists in Firestore with better error handling
      let userData: AuthUser;
      try {
        userData = await this.getUserData(firebaseUser.uid);
        console.log('Existing user data loaded successfully');
      } catch (error: any) {
        console.log('User data not found, creating new user document');
        // User doesn't exist, create new user document
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Google User',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'member' as UserRole,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isActive: true
        };
        
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          console.log('New user document created successfully');
        } catch (firestoreError: any) {
          console.error('Error creating user document:', firestoreError);
          // Continue with in-memory user data if Firestore fails
        }
      }
      
      this.currentUser = userData;
      const duration = Date.now() - startTime;
      logger.logAuthEvent('google_signin_success', { 
        userId: userData.uid, 
        duration,
        isNewUser: !userData.createdAt || (Date.now() - userData.createdAt.getTime()) < 60000
      });
      
      return {
        user: userData,
        isNewUser: !userData.createdAt || (Date.now() - userData.createdAt.getTime()) < 60000
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.logAuthEvent('google_signin_failed', { duration, error: error.message }, error);
      
      // Enhanced error handling
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      const errorMessage = getAuthErrorMessage(error);
      const authError = new AuthenticationError(
        this.getAuthErrorType(error),
        errorMessage,
        error.code,
        { originalError: error.message }
      );
      
      throw authError;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      console.log('🟢 FirebaseAuthService: logout called');
      console.log('🟢 FirebaseAuthService: current user before logout:', auth.currentUser?.email);
      
      // Clear local user data first
      this.currentUser = null;
      console.log('🟢 FirebaseAuthService: currentUser set to null');
      
      // Sign out from Firebase
      await signOut(auth);
      console.log('🟢 FirebaseAuthService: signOut completed');
      
      // Additional cleanup for Google Sign-In on mobile
      if (Platform.OS !== 'web' && GoogleSignin) {
        try {
          await GoogleSignin.signOut();
          console.log('🟢 FirebaseAuthService: Google Sign-In signOut completed');
        } catch (googleError) {
          console.log('🟢 FirebaseAuthService: Google Sign-In signOut not needed or failed:', googleError);
        }
      }
      
    } catch (error) {
      console.error('🟢 FirebaseAuthService: Logout error:', error);
      // Even if signOut fails, clear local state
      this.currentUser = null;
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        const userData = await this.getUserData(firebaseUser.uid);
        this.currentUser = userData;
        return userData;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    }

    return null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Check auth state (required by AuthServiceInterface)
  static async checkAuthState(): Promise<boolean> {
    return this.isAuthenticated();
  }

  // Check user role (required by AuthServiceInterface)
  static async checkUserRole(uid: string): Promise<UserRole> {
    try {
      const userData = await this.getUserData(uid);
      return userData.role;
    } catch (error) {
      console.error('Error checking user role:', error);
      return 'member'; // default role
    }
  }

  // Check user role
  static hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  static isMember(): boolean {
    return this.hasRole('member');
  }

  // Get user data from Firestore with enhanced error handling
  private static async getUserData(uid: string): Promise<AuthUser> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        // Don't log as error for new users - this is expected behavior
        console.log(`User document not found for UID: ${uid} - this is normal for new users`);
        throw new Error('User data not found');
      }

      const data = userDoc.data();
      
      // Map Firestore data to AuthUser interface
      return {
        uid: uid,
        email: data.email || '',
        displayName: data.displayName || data.name || '',
        photoURL: data.photoURL || data.avatar,
        role: data.role || 'member',
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        isActive: data.isActive !== undefined ? data.isActive : true
      };
    } catch (error: any) {
      // Only log as error if it's not the expected "user not found" case
      if (error.message !== 'User data not found') {
        console.error(`Error fetching user data for UID ${uid}:`, error);
      }
      throw error;
    }
  }

  // Update user profile (interface compatible)
  static async updateUserProfile(uid: string, data: Partial<AuthUser>): Promise<void> {
    try {
      // Update Firebase profile if name or photo changed
      const firebaseUser = auth.currentUser;
      if (firebaseUser && firebaseUser.uid === uid) {
        if ((data as any).name || (data as any).avatar) {
          await updateProfile(firebaseUser, {
            displayName: (data as any).name || firebaseUser.displayName,
            photoURL: (data as any).avatar || firebaseUser.photoURL
          });
        }
      }

      // Update Firestore document
      const updatedData = {
        ...data,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', uid), updatedData);
      
      // Update local user data if it's the current user
       if (this.currentUser && this.currentUser.uid === uid) {
         this.currentUser = {
           ...this.currentUser,
           ...updatedData
         };
       }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  static async updateCurrentUserProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !this.currentUser) {
      throw new Error('No authenticated user');
    }

    await this.updateUserProfile(firebaseUser.uid, updates);
    return this.currentUser!;
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<AuthUser[]> {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin role required');
    }

    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => {
         const data = doc.data();
         return {
         uid: doc.id,
         email: data.email || '',
         displayName: data.displayName || data.name || '',
         photoURL: data.photoURL || data.avatar,
         role: data.role || 'member',
         createdAt: data.createdAt?.toDate() || new Date(),
         lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
         isActive: data.isActive !== undefined ? data.isActive : true
       };
       });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get admin dashboard data
  static async getAdminDashboard(): Promise<any> {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin role required');
    }

    try {
      const users = await this.getAllUsers();
      
      // Get admin settings from Firestore
      let adminSettings = {
        apiKeys: {
          gemini: undefined,
          openrouter: undefined,
          lastUpdated: new Date()
        },
        systemConfig: {
          maintenanceMode: false,
          allowNewRegistrations: true,
          defaultSubscriptionPlan: 'free' as const,
          maxUsersPerPlan: {
            free: 1000,
            basic: 5000,
            premium: 10000,
            enterprise: -1
          }
        }
      };

      try {
        const settingsDoc = await getDoc(doc(db, 'admin', 'settings'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          adminSettings = {
            ...adminSettings,
            ...data,
            apiKeys: {
              ...adminSettings.apiKeys,
              ...data.apiKeys
            }
          };
        }
      } catch (settingsError) {
        console.log('Admin settings not found, using defaults');
      }
      
      return {
        users,
        systemStats: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.lastLoginAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          totalTasks: 0,
          completedTasks: 0,
          systemUptime: 99.9,
          apiUsage: {
            gemini: 0,
            openrouter: 0
          },
          storage: {
            used: 0,
            total: 1000
          },
          recentUsers: users.slice(0, 5)
        },
        settings: {
          id: 'admin-settings',
          ...adminSettings,
          analytics: {
            totalUsers: users.length,
            activeSubscriptions: 0,
            revenue: 0,
            systemHealth: 'healthy' as const
          }
        }
      };
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      throw error;
    }
  }

  // Get member dashboard data
  static async getMemberDashboard(userId: string): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock data for now - in real implementation, this would fetch from Firestore
      return {
        user,
        recentTasks: [],
        productivity: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          quadrantStats: {
            'urgent-important': { total: 0, completed: 0, overdue: 0 },
            'not-urgent-important': { total: 0, completed: 0, overdue: 0 },
            'urgent-not-important': { total: 0, completed: 0, overdue: 0 },
            'not-urgent-not-important': { total: 0, completed: 0, overdue: 0 }
          },
          timeStats: {
            totalEstimatedTime: 0,
            totalActualTime: 0,
            averageCompletionTime: 0
          },
          weeklyProgress: []
        },
        notifications: [],
        quickActions: []
      };
    } catch (error) {
      console.error('Error getting member dashboard:', error);
      throw error;
    }
  }

  // Update admin settings
  static async updateAdminSettings(settings: Partial<any>): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin role required');
    }

    try {
      const settingsRef = doc(db, 'admin', 'settings');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('Admin settings updated successfully');
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  }

  // Update API keys
  static async updateApiKeys(apiKeys: { gemini?: string; openrouter?: string }): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin role required');
    }

    try {
      const settingsRef = doc(db, 'admin', 'settings');
      
      // Prepare API keys data, removing undefined values
      const apiKeysData: any = {
        lastUpdated: new Date()
      };
      
      if (apiKeys.gemini !== undefined) {
        apiKeysData.gemini = apiKeys.gemini;
      }
      
      if (apiKeys.openrouter !== undefined) {
        apiKeysData.openrouter = apiKeys.openrouter;
      }
      
      await setDoc(settingsRef, {
        apiKeys: apiKeysData,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('API keys updated successfully:', { gemini: !!apiKeys.gemini, openrouter: !!apiKeys.openrouter });
    } catch (error) {
      console.error('Error updating API keys:', error);
      throw error;
    }
  }

  // Helper method to get auth error type
  private static getAuthErrorType(error: any): import('../types/auth').AuthErrorType {
    if (error.message?.includes('RNGoogleSignin') || error.message?.includes('TurboModuleRegistry')) {
      return 'GOOGLE_SIGNIN_UNAVAILABLE';
    }
    if (error.message?.includes('Expo Go')) {
      return 'EXPO_GO_LIMITATION';
    }
    if (error.code?.includes('network') || error.message?.includes('Network')) {
      return 'NETWORK_ERROR';
    }
    if (error.code?.includes('invalid') || error.code?.includes('wrong')) {
      return 'INVALID_CREDENTIALS';
    }
    return 'UNKNOWN_ERROR';
  }

  // Helper method to get user-friendly error messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Email tidak ditemukan';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/email-already-in-use':
        return 'Email sudah digunakan';
      case 'auth/weak-password':
        return 'Password terlalu lemah (minimal 6 karakter)';
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Coba lagi nanti';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah';
      default:
        return 'Terjadi kesalahan. Silakan coba lagi';
    }
  }

  // Cleanup listener
  static cleanup(): void {
    if (this.authStateListener) {
      this.authStateListener();
      this.authStateListener = null;
    }
  }
}

// Named exports for easier importing
export const initialize = FirebaseAuthService.initialize.bind(FirebaseAuthService);
export const login = FirebaseAuthService.login.bind(FirebaseAuthService);
export const register = FirebaseAuthService.register.bind(FirebaseAuthService);
export const signInWithGoogle = FirebaseAuthService.signInWithGoogle.bind(FirebaseAuthService);
export const logout = FirebaseAuthService.logout.bind(FirebaseAuthService);
export const getCurrentUser = FirebaseAuthService.getCurrentUser.bind(FirebaseAuthService);
export const isAuthenticated = FirebaseAuthService.isAuthenticated.bind(FirebaseAuthService);
export const hasRole = FirebaseAuthService.hasRole.bind(FirebaseAuthService);
export const isAdmin = FirebaseAuthService.isAdmin.bind(FirebaseAuthService);
export const isMember = FirebaseAuthService.isMember.bind(FirebaseAuthService);
export const updateUserProfile = FirebaseAuthService.updateUserProfile.bind(FirebaseAuthService);
export const getAllUsers = FirebaseAuthService.getAllUsers.bind(FirebaseAuthService);
export const getAdminDashboard = FirebaseAuthService.getAdminDashboard.bind(FirebaseAuthService);
export const getMemberDashboard = FirebaseAuthService.getMemberDashboard.bind(FirebaseAuthService);
export const updateAdminSettings = FirebaseAuthService.updateAdminSettings.bind(FirebaseAuthService);
export const updateApiKeys = FirebaseAuthService.updateApiKeys.bind(FirebaseAuthService);
export const cleanup = FirebaseAuthService.cleanup.bind(FirebaseAuthService);

// Default export
export default FirebaseAuthService;