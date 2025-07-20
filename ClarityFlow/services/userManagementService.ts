import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import loggingService from './loggingService';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  isActive: boolean;
  isBanned: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  loginCount: number;
  sessionDuration: number;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  memberCount: number;
  activeToday: number;
  newThisWeek: number;
  bannedUsers: number;
  averageSessionHours: number;
}

class UserManagementService {
  private readonly COLLECTION_NAME = 'users';

  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, this.COLLECTION_NAME);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const users: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName || data.name || data.email?.split('@')[0] || 'Unknown',
          role: data.role || 'member',
          isActive: data.isActive !== undefined ? data.isActive : true,
          isBanned: data.isBanned || false,
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          loginCount: data.loginCount || 0,
          sessionDuration: data.sessionDuration || 0
        });
      });
      
      loggingService.info('Users fetched successfully', 'UserManagementService', { count: users.length });
      return users;
    } catch (error) {
      loggingService.error('Failed to fetch users', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const stats: UserStats = {
        totalUsers: users.length,
        adminCount: users.filter(u => u.role === 'admin').length,
        memberCount: users.filter(u => u.role === 'member').length,
        activeToday: users.filter(u => u.lastLoginAt >= today).length,
        newThisWeek: users.filter(u => u.createdAt >= weekAgo).length,
        bannedUsers: users.filter(u => u.isBanned).length,
        averageSessionHours: users.length > 0 ? users.reduce((sum, u) => sum + u.sessionDuration, 0) / users.length / 3600 : 0
      };

      loggingService.info('User stats calculated', 'UserManagementService', stats);
      return stats;
    } catch (error) {
      loggingService.error('Failed to calculate user stats', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async getActiveUsers(): Promise<User[]> {
    try {
      const users = await this.getAllUsers();
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return users.filter(user => 
        user.isActive && 
        user.lastLoginAt >= hourAgo
      );
    } catch (error) {
      loggingService.error('Failed to fetch active users', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async getBannedUsers(): Promise<User[]> {
    try {
      const users = await this.getAllUsers();
      return users.filter(user => user.isBanned);
    } catch (error) {
      loggingService.error('Failed to fetch banned users', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async banUser(userId: string, reason: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason,
        isActive: false
      });
      
      loggingService.info('User banned successfully', 'UserManagementService', { userId, reason });
    } catch (error) {
      loggingService.error('Failed to ban user', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async unbanUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        isBanned: false,
        bannedAt: null,
        banReason: null
      });
      
      loggingService.info('User unbanned successfully', 'UserManagementService', { userId });
    } catch (error) {
      loggingService.error('Failed to unban user', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await deleteDoc(userRef);
      
      loggingService.info('User deleted successfully', 'UserManagementService', { userId });
    } catch (error) {
      loggingService.error('Failed to delete user', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async updateUserRole(userId: string, newRole: 'admin' | 'member'): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });
      
      loggingService.info('User role updated successfully', 'UserManagementService', { userId, newRole });
    } catch (error) {
      loggingService.error('Failed to update user role', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async updateUserActiveStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(userRef, {
        isActive: isActive,
        lastLoginAt: isActive ? new Date() : undefined,
        updatedAt: new Date()
      });
      
      loggingService.info('User active status updated', 'UserManagementService', { userId, isActive });
    } catch (error) {
      loggingService.error('Failed to update user active status', error as Error, 'UserManagementService');
      throw error;
    }
  }

  async fixUserActiveStatus(): Promise<void> {
    try {
      const users = await this.getAllUsers();
      
      // Use Firestore batch for better performance and atomicity
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      for (const user of users) {
        // Set isActive to true for users who logged in recently (within 24 hours)
        const isRecentlyActive = user.lastLoginAt && 
          (new Date().getTime() - user.lastLoginAt.getTime()) < 24 * 60 * 60 * 1000;
        
        const userRef = doc(db, this.COLLECTION_NAME, user.id);
        batch.update(userRef, {
          isActive: isRecentlyActive || true, // Default to true for existing users
          updatedAt: new Date()
        });
      }
      
      await batch.commit();
      loggingService.info('Fixed active status for all users', 'UserManagementService', { count: users.length });
    } catch (error) {
      loggingService.error('Failed to fix user active status', error as Error, 'UserManagementService');
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();