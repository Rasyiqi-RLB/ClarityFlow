import { EisenhowerQuadrant } from '../types';

export const QUADRANT_CONFIG = {
  'urgent-important': {
    title: 'Do First',
    subtitle: 'Urgent & Important',
    description: 'Tasks that need immediate attention',
    color: '#FF6B6B',
    backgroundColor: '#FFE5E5',
    icon: '⚡',
    priority: 1,
  },
  'not-urgent-important': {
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    description: 'Tasks to plan and schedule',
    color: '#4ECDC4',
    backgroundColor: '#E5F9F6',
    icon: '📅',
    priority: 2,
  },
  'urgent-not-important': {
    title: 'Delegate',
    subtitle: 'Urgent & Not Important',
    description: 'Tasks to delegate or do quickly',
    color: '#45B7D1',
    backgroundColor: '#E5F4F9',
    icon: '👥',
    priority: 3,
  },
  'not-urgent-not-important': {
    title: 'Delete',
    subtitle: 'Not Urgent & Not Important',
    description: 'Tasks to eliminate or minimize',
    color: '#96CEB4',
    backgroundColor: '#E5F5E5',
    icon: '🗑️',
    priority: 4,
  },
} as const;

export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    color: '#FF6B6B',
    icon: '🔴',
  },
  medium: {
    label: 'Medium',
    color: '#FFA726',
    icon: '🟡',
  },
  low: {
    label: 'Low',
    color: '#66BB6A',
    icon: '🟢',
  },
} as const;

// REMINDER_TYPES removed - not used in codebase

export const THEME_COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  light: '#F8FAFC',
  dark: '#1E293B',
  background: '#FFFFFF',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

// STORAGE_KEYS moved to services/storage.ts to avoid duplication

// DEFAULT_USER_PREFERENCES removed - not used in codebase

// TASK_TEMPLATES removed - not used in codebase

export const PRODUCTIVITY_TIPS = [
  'Focus on the "Do First" quadrant to reduce stress and improve outcomes.',
  'Schedule important but not urgent tasks to prevent them from becoming urgent.',
  'Delegate tasks that are urgent but not important to free up your time.',
  'Eliminate or minimize tasks that are neither urgent nor important.',
  'Review your matrix weekly to ensure you\'re spending time on what matters most.',
  'Break down large tasks into smaller, manageable pieces.',
  'Set specific deadlines for tasks to create urgency when needed.',
  'Use the 2-minute rule: if a task takes less than 2 minutes, do it immediately.',
] as const;

// AI_SUGGESTIONS removed - not used in codebase