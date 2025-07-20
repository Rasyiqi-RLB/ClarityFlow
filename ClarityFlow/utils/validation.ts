import { Task, EisenhowerQuadrant, AIAnalysisResult } from '../types';

// Validation utilities for ClarityFlow

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationUtils {
  // Validate task data
  static validateTask(task: Partial<Task>): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Task title is required');
    }

    if (task.title && task.title.length > 200) {
      errors.push('Task title must be less than 200 characters');
    }

    if (task.description && task.description.length > 500) {
      errors.push('Task description must be less than 500 characters');
    }

    // Validate quadrant
    if (task.quadrant && !this.isValidQuadrant(task.quadrant)) {
      errors.push('Invalid quadrant value');
    }

    // Validate priority
    if (task.priority && !this.isValidPriority(task.priority)) {
      errors.push('Invalid priority value');
    }

    // Validate dates
    if (task.dueDate && !this.isValidDate(task.dueDate)) {
      errors.push('Invalid due date');
    }

    if (task.createdAt && !this.isValidDate(task.createdAt)) {
      errors.push('Invalid creation date');
    }

    if (task.updatedAt && !this.isValidDate(task.updatedAt)) {
      errors.push('Invalid update date');
    }

    // Validate time estimates
    if (task.estimatedTime !== undefined && (task.estimatedTime < 0 || task.estimatedTime > 1440)) {
      errors.push('Estimated time must be between 0 and 1440 minutes (24 hours)');
    }

    if (task.actualTime !== undefined && (task.actualTime < 0 || task.actualTime > 1440)) {
      errors.push('Actual time must be between 0 and 1440 minutes (24 hours)');
    }

    // Validate tags
    if (task.tags) {
      if (!Array.isArray(task.tags)) {
        errors.push('Tags must be an array');
      } else {
        task.tags.forEach((tag, index) => {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            errors.push(`Tag at index ${index} is invalid`);
          }
          if (tag.length > 50) {
            errors.push(`Tag at index ${index} must be less than 50 characters`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate AI analysis result
  static validateAIAnalysis(analysis: Partial<AIAnalysisResult>): ValidationResult {
    const errors: string[] = [];

    // Validate quadrant
    if (analysis.quadrant && !this.isValidQuadrant(analysis.quadrant)) {
      errors.push('Invalid quadrant in AI analysis');
    }

    // Validate confidence
    if (analysis.confidence !== undefined && (analysis.confidence < 0 || analysis.confidence > 1)) {
      errors.push('Confidence must be between 0 and 1');
    }

    // Validate reasoning
    if (analysis.reasoning && analysis.reasoning.length > 500) {
      errors.push('AI reasoning must be less than 500 characters');
    }

    // Validate priority
    if (analysis.priority && !this.isValidPriority(analysis.priority)) {
      errors.push('Invalid priority in AI analysis');
    }

    // Validate estimated time
    if (analysis.estimatedTime !== undefined && (analysis.estimatedTime < 0 || analysis.estimatedTime > 1440)) {
      errors.push('Estimated time must be between 0 and 1440 minutes');
    }

    // Validate tags
    if (analysis.tags) {
      if (!Array.isArray(analysis.tags)) {
        errors.push('Tags must be an array in AI analysis');
      } else {
        analysis.tags.forEach((tag, index) => {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            errors.push(`AI tag at index ${index} is invalid`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate task input string
  static validateTaskInput(input: string): ValidationResult {
    const errors: string[] = [];

    if (!input || input.trim().length === 0) {
      errors.push('Task input cannot be empty');
    }

    if (input.length > 200) {
      errors.push('Task input must be less than 200 characters');
    }

    // Check for potentially harmful content (basic)
    const harmfulPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];

    harmfulPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        errors.push('Task input contains potentially harmful content');
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Helper methods
  private static isValidQuadrant(quadrant: any): quadrant is EisenhowerQuadrant {
    const validQuadrants: EisenhowerQuadrant[] = [
      'urgent-important',
      'not-urgent-important',
      'urgent-not-important',
      'not-urgent-not-important',
    ];
    return validQuadrants.includes(quadrant);
  }

  private static isValidPriority(priority: any): priority is 'high' | 'medium' | 'low' {
    return ['high', 'medium', 'low'].includes(priority);
  }

  private static isValidDate(date: any): boolean {
    if (!(date instanceof Date)) {
      return false;
    }
    
    // Check if date is valid (not NaN)
    return !isNaN(date.getTime());
  }

  // Sanitize task data
  static sanitizeTask(task: Partial<Task>): Partial<Task> {
    const sanitized = { ...task };

    // Sanitize strings
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim();
    }

    if (sanitized.description) {
      sanitized.description = sanitized.description.trim();
    }

    // Sanitize tags
    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim())
        .slice(0, 10); // Limit to 10 tags
    }

    // Ensure numeric values are within bounds
    if (sanitized.estimatedTime !== undefined) {
      sanitized.estimatedTime = Math.max(0, Math.min(1440, sanitized.estimatedTime));
    }

    if (sanitized.actualTime !== undefined) {
      sanitized.actualTime = Math.max(0, Math.min(1440, sanitized.actualTime));
    }

    return sanitized;
  }

  // Generate a valid task ID
  static generateTaskId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Check if task is overdue
  static isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  }

  // Check if task is due soon (within 24 hours)
  static isTaskDueSoon(task: Task): boolean {
    if (!task.dueDate || task.completed) {
      return false;
    }
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dueDate = new Date(task.dueDate);
    return dueDate <= tomorrow && dueDate > now;
  }
}