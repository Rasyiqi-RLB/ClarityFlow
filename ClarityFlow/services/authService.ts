import { AuthUser, UserRole } from '../types/auth';
import { FirebaseAuthService } from './firebaseauthservice';

// Main AuthService class that wraps FirebaseAuthService
// This provides a clean interface for authentication operations
export class AuthService {
  private static isInitialized = false;

  // Initialize the auth service
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing AuthService...');
      
      // Initialize Firebase Auth
      await FirebaseAuthService.initialize();
      
      console.log('AuthService initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing AuthService:', error);
      throw error;
    }
  }

  // Register new user
  static async register(
    email: string,
    password: string,
    displayName: string,
    role: UserRole = 'member'
  ): Promise<AuthUser> {
    try {
      const user = await FirebaseAuthService.register(email, password, displayName, role);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthUser> {
    try {
      const user = await FirebaseAuthService.login(email, password);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google Sign-In
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await FirebaseAuthService.signInWithGoogle();
      return result.user;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      console.log('🟡 AuthService: logout called');
      await FirebaseAuthService.logout();
      console.log('🟡 AuthService: FirebaseAuthService.logout completed');
    } catch (error) {
      console.error('🟡 AuthService: Logout error:', error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await FirebaseAuthService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return FirebaseAuthService.isAuthenticated();
  }

  static hasRole(role: UserRole): boolean {
    return FirebaseAuthService.hasRole(role);
  }

  static isAdmin(): boolean {
    return FirebaseAuthService.isAdmin();
  }

  static isMember(): boolean {
    return FirebaseAuthService.isMember();
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<AuthUser[]> {
    try {
      return await FirebaseAuthService.getAllUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const currentUser = await FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      await FirebaseAuthService.updateUserProfile(currentUser.uid, updates);
      const updatedUser = await FirebaseAuthService.getCurrentUser();
      if (!updatedUser) {
        throw new Error('Failed to get updated user');
      }
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get admin dashboard data
  static async getAdminDashboard(): Promise<any> {
    try {
      return await FirebaseAuthService.getAdminDashboard();
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      throw error;
    }
  }

  // Get member dashboard data
  static async getMemberDashboard(userId: string): Promise<any> {
    try {
      return await FirebaseAuthService.getMemberDashboard(userId);
    } catch (error) {
      console.error('Error getting member dashboard:', error);
      throw error;
    }
  }

  // Update admin settings
  static async updateAdminSettings(settings: Partial<any>): Promise<void> {
    try {
      await FirebaseAuthService.updateAdminSettings(settings);
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  }

  // Update API keys
  static async updateApiKeys(apiKeys: { gemini?: string; openrouter?: string }): Promise<void> {
    try {
      await FirebaseAuthService.updateApiKeys(apiKeys);
    } catch (error) {
      console.error('Error updating API keys:', error);
      throw error;
    }
  }

  // Cleanup
  static cleanup(): void {
    FirebaseAuthService.cleanup();
    this.isInitialized = false;
  }
}