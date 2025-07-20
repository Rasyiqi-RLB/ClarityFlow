import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';
import NotificationService from './notificationService';

export interface Achievement {
  id: string;
  type: 'task_completed' | 'streak' | 'goal_reached' | 'productivity_milestone';
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  data?: any;
}

export interface AchievementStats {
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  weeklyGoal: number;
  weeklyCompleted: number;
  monthlyGoal: number;
  monthlyCompleted: number;
}

class AchievementService {
  private static instance: AchievementService;
  private readonly ACHIEVEMENTS_KEY = 'user_achievements';
  private readonly STATS_KEY = 'achievement_stats';

  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  // Get user achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements = await AsyncStorage.getItem(`${this.ACHIEVEMENTS_KEY}_${userId}`);
      if (achievements) {
        return JSON.parse(achievements).map((achievement: any) => ({
          ...achievement,
          unlockedAt: new Date(achievement.unlockedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }

  // Get achievement stats
  async getStats(userId: string): Promise<AchievementStats> {
    try {
      const stats = await AsyncStorage.getItem(`${this.STATS_KEY}_${userId}`);
      if (stats) {
        return JSON.parse(stats);
      }
      
      return {
        totalTasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
        weeklyGoal: 7,
        weeklyCompleted: 0,
        monthlyGoal: 30,
        monthlyCompleted: 0
      };
    } catch (error) {
      console.error('Failed to get achievement stats:', error);
      return {
        totalTasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
        weeklyGoal: 7,
        weeklyCompleted: 0,
        monthlyGoal: 30,
        monthlyCompleted: 0
      };
    }
  }

  // Update achievement stats
  async updateStats(userId: string, stats: Partial<AchievementStats>): Promise<void> {
    try {
      const currentStats = await this.getStats(userId);
      const newStats = { ...currentStats, ...stats };
      await AsyncStorage.setItem(`${this.STATS_KEY}_${userId}`, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to update achievement stats:', error);
    }
  }

  // Add new achievement
  async addAchievement(userId: string, achievement: Omit<Achievement, 'id' | 'unlockedAt'>): Promise<Achievement> {
    try {
      const achievements = await this.getAchievements(userId);
      
      const newAchievement: Achievement = {
        ...achievement,
        id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        unlockedAt: new Date()
      };

      achievements.push(newAchievement);
      await AsyncStorage.setItem(`${this.ACHIEVEMENTS_KEY}_${userId}`, JSON.stringify(achievements));

      // Send achievement notification
      await this.sendAchievementNotification(newAchievement);

      console.log(`🏆 Achievement unlocked: ${newAchievement.title}`);
      return newAchievement;
    } catch (error) {
      console.error('Failed to add achievement:', error);
      throw error;
    }
  }

  // Process task completion and check for achievements
  async processTaskCompletion(userId: string, task: Task): Promise<Achievement[]> {
    try {
      const newAchievements: Achievement[] = [];
      const stats = await this.getStats(userId);
      
      // Update basic stats
      const today = new Date().toDateString();
      const lastCompletion = stats.lastCompletionDate ? new Date(stats.lastCompletionDate).toDateString() : null;
      
      // Update streak
      let newStreak = stats.currentStreak;
      if (lastCompletion === today) {
        // Already completed a task today, don't change streak
      } else if (lastCompletion === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
        // Completed yesterday, continue streak
        newStreak += 1;
      } else {
        // Streak broken or first task
        newStreak = 1;
      }

      // Update stats
      const updatedStats: Partial<AchievementStats> = {
        totalTasksCompleted: stats.totalTasksCompleted + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastCompletionDate: new Date().toISOString(),
        weeklyCompleted: this.isThisWeek(stats.lastCompletionDate) ? stats.weeklyCompleted + 1 : 1,
        monthlyCompleted: this.isThisMonth(stats.lastCompletionDate) ? stats.monthlyCompleted + 1 : 1
      };

      await this.updateStats(userId, updatedStats);

      // Check for achievements
      const achievements = await this.checkAchievements(userId, updatedStats, task);
      newAchievements.push(...achievements);

      return newAchievements;
    } catch (error) {
      console.error('Failed to process task completion:', error);
      return [];
    }
  }

  // Check for new achievements
  private async checkAchievements(userId: string, stats: Partial<AchievementStats>, task: Task): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const existingAchievements = await this.getAchievements(userId);
    const existingTypes = existingAchievements.map(a => `${a.type}_${a.data?.milestone || ''}`);

    // First task completion
    if (stats.totalTasksCompleted === 1 && !existingTypes.includes('task_completed_first')) {
      newAchievements.push(await this.addAchievement(userId, {
        type: 'task_completed',
        title: '🎉 First Task Completed!',
        description: 'You completed your first task. Great start!',
        icon: '🎯',
        data: { milestone: 'first' }
      }));
    }

    // Task completion milestones
    const milestones = [5, 10, 25, 50, 100, 250, 500];
    for (const milestone of milestones) {
      if (stats.totalTasksCompleted === milestone && !existingTypes.includes(`task_completed_${milestone}`)) {
        newAchievements.push(await this.addAchievement(userId, {
          type: 'task_completed',
          title: `🏆 ${milestone} Tasks Completed!`,
          description: `You've completed ${milestone} tasks. Amazing progress!`,
          icon: '🎯',
          data: { milestone }
        }));
      }
    }

    // Streak achievements
    const streakMilestones = [3, 7, 14, 30, 60, 100];
    for (const milestone of streakMilestones) {
      if (stats.currentStreak === milestone && !existingTypes.includes(`streak_${milestone}`)) {
        newAchievements.push(await this.addAchievement(userId, {
          type: 'streak',
          title: `🔥 ${milestone} Day Streak!`,
          description: `You've completed tasks for ${milestone} consecutive days!`,
          icon: '🔥',
          data: { milestone }
        }));
      }
    }

    // Weekly goal achievement
    if (stats.weeklyCompleted && stats.weeklyCompleted >= (stats as AchievementStats).weeklyGoal && 
        !existingTypes.includes('goal_reached_weekly')) {
      newAchievements.push(await this.addAchievement(userId, {
        type: 'goal_reached',
        title: '📅 Weekly Goal Reached!',
        description: `You've completed your weekly goal of ${(stats as AchievementStats).weeklyGoal} tasks!`,
        icon: '📅',
        data: { type: 'weekly' }
      }));
    }

    // Monthly goal achievement
    if (stats.monthlyCompleted && stats.monthlyCompleted >= (stats as AchievementStats).monthlyGoal && 
        !existingTypes.includes('goal_reached_monthly')) {
      newAchievements.push(await this.addAchievement(userId, {
        type: 'goal_reached',
        title: '🗓️ Monthly Goal Reached!',
        description: `You've completed your monthly goal of ${(stats as AchievementStats).monthlyGoal} tasks!`,
        icon: '🗓️',
        data: { type: 'monthly' }
      }));
    }

    // Quadrant-specific achievements
    if (task.quadrant === 'urgent-important') {
      const urgentTasks = existingAchievements.filter(a => a.data?.quadrant === 'urgent-important').length + 1;
      if (urgentTasks === 10 && !existingTypes.includes('productivity_milestone_urgent_master')) {
        newAchievements.push(await this.addAchievement(userId, {
          type: 'productivity_milestone',
          title: '⚡ Urgent Task Master!',
          description: 'You\'ve completed 10 urgent and important tasks!',
          icon: '⚡',
          data: { quadrant: 'urgent-important', milestone: 'urgent_master' }
        }));
      }
    }

    return newAchievements;
  }

  // Send achievement notification
  private async sendAchievementNotification(achievement: Achievement): Promise<void> {
    try {
      await NotificationService.scheduleAchievementNotification({
        type: 'task_completed',
        title: achievement.title,
        message: achievement.description,
        data: {
          achievementId: achievement.id,
          type: achievement.type,
          icon: achievement.icon
        }
      });
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
    }
  }

  // Helper: Check if date is this week
  private isThisWeek(dateString: string | null): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    return date >= startOfWeek;
  }

  // Helper: Check if date is this month
  private isThisMonth(dateString: string | null): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  // Get recent achievements (for display)
  async getRecentAchievements(userId: string, limit: number = 5): Promise<Achievement[]> {
    try {
      const achievements = await this.getAchievements(userId);
      return achievements
        .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent achievements:', error);
      return [];
    }
  }
}

export default AchievementService.getInstance();
