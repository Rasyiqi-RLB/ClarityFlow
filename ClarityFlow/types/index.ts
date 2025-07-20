export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: EisenhowerQuadrant;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  projectId?: string;
  assignedTo?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  aiSuggestion?: {
    quadrant: EisenhowerQuadrant;
    confidence: number;
    reasoning: string;
  };
  reminders?: Reminder[];
  dependencies?: string[]; // array of task IDs
  userId?: string; // Associate task with user
}

export type EisenhowerQuadrant = 
  | 'urgent-important'     // Do First
  | 'not-urgent-important' // Schedule
  | 'urgent-not-important' // Delegate
  | 'not-urgent-not-important'; // Delete

export interface Reminder {
  id: string;
  taskId: string;
  time: Date;
  type: 'notification' | 'email' | 'sms';
  message: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  teamMembers?: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  defaultReminderTime: number; // minutes before due date
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  aiFeatures: {
    autoCategorization: boolean;
    smartSuggestions: boolean;
    productivityAnalysis: boolean;
  };
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  quadrantStats: {
    [key in EisenhowerQuadrant]: {
      total: number;
      completed: number;
      overdue: number;
    };
  };
  timeStats: {
    totalEstimatedTime: number;
    totalActualTime: number;
    averageCompletionTime: number;
  };
  weeklyProgress: {
    date: string;
    completed: number;
    total: number;
  }[];
}

export interface BackupData {
  tasks: Task[];
  projects: Project[];
  user: User;
  stats: ProductivityStats;
  version: string;
  timestamp: Date;
}

export interface AIAnalysisResult {
  quadrant: EisenhowerQuadrant;
  confidence: number;
  reasoning: string;
  suggestedDueDate?: Date;
  estimatedTime?: number;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
}

// User Management & Authentication
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  subscription?: Subscription;
  preferences: UserPreferences;
}

export type UserRole = 'admin' | 'member' | 'guest';

// Subscription Management
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod;
  features: SubscriptionFeatures;
  usage: UsageStats;
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface SubscriptionFeatures {
  maxTasks: number;
  aiAnalysis: boolean;
  cloudSync: boolean;
  teamCollaboration: boolean;
  advancedReports: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
}

export interface UsageStats {
  tasksCreated: number;
  aiAnalysisUsed: number;
  storageUsed: number; // in MB
  lastActivity: Date;
  monthlyLimits: {
    tasks: number;
    aiCalls: number;
    storage: number;
  };
}

// Admin Panel
export interface AdminSettings {
  id: string;
  apiKeys: {
    gemini?: string;
    openrouter?: string;
    lastUpdated: Date;
  };
  systemConfig: {
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    defaultSubscriptionPlan: SubscriptionPlan;
    maxUsersPerPlan: Record<SubscriptionPlan, number>;
  };
  analytics: {
    totalUsers: number;
    activeSubscriptions: number;
    revenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

// Dashboard Data
export interface MemberDashboard {
  user: AuthUser;
  subscription: Subscription;
  recentTasks: Task[];
  productivity: ProductivityStats;
  notifications: Notification[];
  quickActions: QuickAction[];
}

export interface AdminDashboard {
  users: AuthUser[];
  subscriptions: Subscription[];
  systemStats: SystemStats;
  recentActivity: ActivityLog[];
  settings: AdminSettings;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  enabled: boolean;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  systemUptime: number;
  apiUsage: {
    gemini: number;
    openrouter: number;
  };
  storage: {
    used: number;
    total: number;
  };
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}