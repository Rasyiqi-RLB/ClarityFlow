// Enhanced TypeScript types for authentication

export interface AuthServiceInterface {
  signInWithGoogle(): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  checkAuthState(): Promise<boolean>;
  checkUserRole(uid: string): Promise<UserRole>;
  getUserData(uid: string): Promise<AuthUser | null>;
  updateUserProfile(uid: string, data: Partial<AuthUser>): Promise<void>;
}

export interface AuthResult {
  user: AuthUser | null;
  isNewUser?: boolean;
  isRedirecting?: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export type UserRole = 'admin' | 'member';

// Error types for better error handling
export type AuthErrorType = 
  | 'NETWORK_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'SERVICE_UNAVAILABLE'
  | 'GOOGLE_SIGNIN_UNAVAILABLE'
  | 'EXPO_GO_LIMITATION'
  | 'UNKNOWN_ERROR';

export interface AuthError extends Error {
  type: AuthErrorType;
  code?: string;
  details?: any;
}

export class AuthenticationError extends Error implements AuthError {
  type: AuthErrorType;
  code?: string;
  details?: any;

  constructor(type: AuthErrorType, message: string, code?: string, details?: any) {
    super(message);
    this.name = 'AuthenticationError';
    this.type = type;
    this.code = code;
    this.details = details;
  }
}

// Platform detection types
export interface PlatformInfo {
  isWeb: boolean;
  isMobile: boolean;
  isExpoGo: boolean;
  canUseGoogleSignIn: boolean;
}

// Auth context types
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  platformInfo: PlatformInfo;
}

// Configuration types
export interface GoogleSignInConfig {
  webClientId: string;
  offlineAccess?: boolean;
  hostedDomain?: string;
  forceCodeForRefreshToken?: boolean;
}

export interface AuthConfig {
  googleSignIn: GoogleSignInConfig;
  enableFallbacks: boolean;
  retryAttempts: number;
  timeoutMs: number;
}