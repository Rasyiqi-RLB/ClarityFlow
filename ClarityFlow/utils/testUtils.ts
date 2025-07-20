import { Task, EisenhowerQuadrant } from '../types';
import { ValidationUtils } from './validation';

// Test utilities for ClarityFlow

export class TestUtils {
  // Generate test tasks
  static generateTestTasks(count: number = 5): Task[] {
    const tasks: Task[] = [];
    const quadrants: EisenhowerQuadrant[] = [
      'urgent-important',
      'not-urgent-important',
      'urgent-not-important',
      'not-urgent-not-important',
    ];
    
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const titles = [
      'Review project proposal',
      'Respond to client email',
      'Schedule team meeting',
      'Update documentation',
      'Fix critical bug',
      'Prepare presentation',
      'Organize workspace',
      'Check social media',
      'Delegate task to team member',
      'Plan next week',
    ];

    for (let i = 0; i < count; i++) {
      const quadrant = quadrants[i % quadrants.length];
      const priority = priorities[i % priorities.length];
      const title = titles[i % titles.length];
      
      const task: Task = {
        id: `test-${i + 1}`,
        title: `${title} ${i + 1}`,
        description: `Test description for task ${i + 1}`,
        quadrant,
        priority,
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // i+1 days from now
        completed: i % 3 === 0, // Every 3rd task is completed
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        tags: [`test-${i + 1}`, quadrant.split('-')[0], priority],
        estimatedTime: (i + 1) * 30, // 30, 60, 90, etc. minutes
        actualTime: i % 3 === 0 ? (i + 1) * 25 : undefined, // Completed tasks have actual time
        aiSuggestion: {
          quadrant,
          confidence: 0.7 + (i * 0.1), // 0.7 to 0.9
          reasoning: `AI suggested ${quadrant} for this task`,
        },
      };
      
      tasks.push(task);
    }
    
    return tasks;
  }

  // Generate test task with specific properties
  static generateTestTask(overrides: Partial<Task> = {}): Task {
    const baseTask: Task = {
      id: ValidationUtils.generateTaskId(),
      title: 'Test Task',
      description: 'Test task description',
      quadrant: 'not-urgent-important',
      priority: 'medium',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test'],
      estimatedTime: 60,
    };

    return { ...baseTask, ...overrides };
  }

  // Test AI analysis with different inputs
  static getTestAIInputs(): { input: string; expectedQuadrant: EisenhowerQuadrant }[] {
    return [
      { input: 'Urgent client meeting today', expectedQuadrant: 'urgent-important' },
      { input: 'Review project proposal next week', expectedQuadrant: 'not-urgent-important' },
      { input: 'Delegate team meeting notes', expectedQuadrant: 'urgent-not-important' },
      { input: 'Check social media updates', expectedQuadrant: 'not-urgent-not-important' },
      { input: 'Critical bug fix ASAP', expectedQuadrant: 'urgent-important' },
      { input: 'Plan quarterly strategy', expectedQuadrant: 'not-urgent-important' },
      { input: 'Ask colleague to take notes', expectedQuadrant: 'urgent-not-important' },
      { input: 'Browse internet for fun', expectedQuadrant: 'not-urgent-not-important' },
    ];
  }

  // Mock storage for testing
  static createMockStorage() {
    const storage: Record<string, string> = {};
    
    // Create mock functions that work with or without jest
    const createMockFn = (fn: Function) => {
      // Check if jest is available in global scope
      if (typeof globalThis !== 'undefined' && (globalThis as any).jest?.fn) {
        return (globalThis as any).jest.fn(fn);
      }
      return fn;
    };
    
    return {
      setItem: createMockFn((key: string, value: string) => {
        storage[key] = value;
        return Promise.resolve();
      }),
      getItem: createMockFn((key: string) => {
        return Promise.resolve(storage[key] || null);
      }),
      removeItem: createMockFn((key: string) => {
        delete storage[key];
        return Promise.resolve();
      }),
      clear: createMockFn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
      getAllKeys: createMockFn(() => {
        return Promise.resolve(Object.keys(storage));
      }),
    };
  }

  // Test validation scenarios
  static getValidationTestCases() {
    return {
      validTask: {
        title: 'Valid Task',
        quadrant: 'urgent-important' as EisenhowerQuadrant,
        priority: 'high' as const,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      invalidTask: {
        title: '', // Empty title
        quadrant: 'invalid-quadrant' as any,
        priority: 'invalid-priority' as any,
        completed: 'not-boolean' as any,
      },
      edgeCases: {
        veryLongTitle: {
          title: 'A'.repeat(201), // Too long
          quadrant: 'urgent-important' as EisenhowerQuadrant,
          priority: 'medium' as const,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        invalidDates: {
          title: 'Task with invalid dates',
          quadrant: 'not-urgent-important' as EisenhowerQuadrant,
          priority: 'low' as const,
          completed: false,
          createdAt: new Date('invalid-date'),
          updatedAt: new Date('invalid-date'),
        },
        invalidTimeEstimates: {
          title: 'Task with invalid time',
          quadrant: 'urgent-not-important' as EisenhowerQuadrant,
          priority: 'medium' as const,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          estimatedTime: -1, // Invalid
          actualTime: 1500, // Too high
        },
      },
    };
  }

  // Performance testing utilities
  static async measurePerformance<T>(
    name: string,
    fn: () => Promise<T>,
    iterations: number = 100
  ): Promise<{ result: T; averageTime: number; minTime: number; maxTime: number }> {
    const times: number[] = [];
    let result: T;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = await fn();
      const end = performance.now();
      times.push(end - start);
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`Performance Test - ${name}:`);
    console.log(`  Average: ${averageTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);

    return { result: result!, averageTime, minTime, maxTime };
  }

  // Stress testing utilities
  static async stressTest(
    fn: () => Promise<any>,
    concurrentRequests: number = 10,
    totalRequests: number = 100
  ): Promise<{ successCount: number; errorCount: number; averageTime: number }> {
    const results: { success: boolean; time: number }[] = [];
    
    const executeRequest = async (): Promise<void> => {
      const start = performance.now();
      try {
        await fn();
        results.push({ success: true, time: performance.now() - start });
      } catch (error) {
        results.push({ success: false, time: performance.now() - start });
      }
    };

    const batches = Math.ceil(totalRequests / concurrentRequests);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrentRequests, totalRequests - batch * concurrentRequests);
      const promises = Array(batchSize).fill(null).map(() => executeRequest());
      await Promise.all(promises);
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const averageTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;

    console.log(`Stress Test Results:`);
    console.log(`  Total Requests: ${totalRequests}`);
    console.log(`  Concurrent Requests: ${concurrentRequests}`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Average Time: ${averageTime.toFixed(2)}ms`);

    return { successCount, errorCount, averageTime };
  }

  // Data consistency testing
  static validateDataConsistency(tasks: Task[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate IDs
    const ids = tasks.map(task => task.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate task IDs found: ${duplicateIds.join(', ')}`);
    }

    // Check for invalid dates
    tasks.forEach((task, index) => {
      if (task.createdAt > task.updatedAt) {
        errors.push(`Task ${index}: createdAt is after updatedAt`);
      }
      if (task.dueDate && task.dueDate < task.createdAt) {
        errors.push(`Task ${index}: dueDate is before createdAt`);
      }
    });

    // Check for invalid time estimates
    tasks.forEach((task, index) => {
      if (task.estimatedTime !== undefined && (task.estimatedTime < 0 || task.estimatedTime > 1440)) {
        errors.push(`Task ${index}: Invalid estimatedTime: ${task.estimatedTime}`);
      }
      if (task.actualTime !== undefined && (task.actualTime < 0 || task.actualTime > 1440)) {
        errors.push(`Task ${index}: Invalid actualTime: ${task.actualTime}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Memory usage testing
  static measureMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }
}