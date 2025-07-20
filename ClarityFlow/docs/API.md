# ClarityFlow API Documentation

## Overview

ClarityFlow adalah aplikasi manajemen tugas berbasis AI yang menggunakan prinsip Eisenhower Matrix. Dokumentasi ini menjelaskan struktur data, services, dan komponen yang digunakan dalam aplikasi.

## Data Types

### Task
```typescript
interface Task {
  id: string;                    // Unique identifier
  title: string;                 // Task title (required)
  description?: string;          // Optional description
  quadrant: EisenhowerQuadrant;  // Matrix quadrant
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;               // Optional due date
  completed: boolean;           // Completion status
  createdAt: Date;             // Creation timestamp
  updatedAt: Date;             // Last update timestamp
  tags?: string[];             // Optional tags
  projectId?: string;          // Associated project
  assignedTo?: string;         // Assigned team member
  estimatedTime?: number;      // Estimated time in minutes
  actualTime?: number;         // Actual time spent
  aiSuggestion?: {             // AI analysis result
    quadrant: EisenhowerQuadrant;
    confidence: number;
    reasoning: string;
  };
  reminders?: Reminder[];      // Associated reminders
  dependencies?: string[];     // Dependent task IDs
}
```

### EisenhowerQuadrant
```typescript
type EisenhowerQuadrant = 
  | 'urgent-important'         // Do First
  | 'not-urgent-important'     // Schedule
  | 'urgent-not-important'     // Delegate
  | 'not-urgent-not-important'; // Delete
```

### AIAnalysisResult
```typescript
interface AIAnalysisResult {
  quadrant: EisenhowerQuadrant;
  confidence: number;           // 0-1 confidence score
  reasoning: string;           // AI explanation
  suggestedDueDate?: Date;
  estimatedTime?: number;      // Minutes
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
}
```

## Services

### StorageService

Manajemen penyimpanan lokal menggunakan AsyncStorage.

#### Methods

```typescript
// Task Management
static async saveTasks(tasks: Task[]): Promise<void>
static async getTasks(): Promise<Task[]>
static async addTask(task: Task): Promise<void>
static async updateTask(updatedTask: Task): Promise<void>
static async deleteTask(taskId: string): Promise<void>

// Project Management
static async saveProjects(projects: Project[]): Promise<void>
static async getProjects(): Promise<Project[]>

// User Management
static async saveUser(user: User): Promise<void>
static async getUser(): Promise<User | null>

// Stats Management
static async saveStats(stats: ProductivityStats): Promise<void>
static async getStats(): Promise<ProductivityStats | null>

// Backup Management
static async createBackup(): Promise<BackupData>
static async restoreBackup(backupData: BackupData): Promise<void>
static async getBackupData(): Promise<BackupData | null>

// Utility
static async clearAllData(): Promise<void>
static async getStorageSize(): Promise<number>
```

### AIService

Layanan AI untuk analisis tugas dan insights produktivitas.

#### Methods

```typescript
// Task Analysis
static async analyzeTask(
  input: string, 
  context?: {
    existingTasks?: Task[];
    userPreferences?: any;
    currentTime?: Date;
  }
): Promise<AIAnalysisResult>

// Learning
static async learnFromCorrection(
  originalAnalysis: AIAnalysisResult,
  userCorrection: EisenhowerQuadrant,
  taskContext: string
): Promise<void>

// Productivity Insights
static async getProductivityInsights(tasks: Task[]): Promise<{
  insights: string[];
  recommendations: string[];
}>
```

## Components

### EisenhowerMatrix

Komponen utama yang menampilkan matrix 4 kuadran.

#### Props
```typescript
interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: () => void;
  onTaskPress: (task: Task) => void;
}
```

### TaskCard

Komponen untuk menampilkan informasi tugas dalam format card.

#### Props
```typescript
interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onPress: () => void;
  quadrantColor: string;
  isCompleted?: boolean;
}
```

### AddTaskModal

Modal untuk menambahkan tugas baru dengan analisis AI.

#### Props
```typescript
interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
  initialInput?: string;
}
```

## Constants

### QUADRANT_CONFIG
```typescript
const QUADRANT_CONFIG = {
  'urgent-important': {
    title: 'Do First',
    subtitle: 'Urgent & Important',
    description: 'Tasks that need immediate attention',
    color: '#FF6B6B',
    backgroundColor: '#FFE5E5',
    icon: '⚡',
    priority: 1,
  },
  // ... other quadrants
}
```

### THEME_COLORS
```typescript
const THEME_COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  // ... other colors
}
```

## Environment Configuration

### ENV_CONFIG
```typescript
const ENV_CONFIG = {
  GEMINI_API_KEY: string;
  OPENROUTER_API_KEY: string;
  APP_NAME: string;
  APP_VERSION: string;
  ENABLE_AI_FEATURES: boolean;
  ENABLE_CALENDAR_INTEGRATION: boolean;
  ENABLE_GOOGLE_DRIVE_BACKUP: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  // ... other config
}
```

## Error Handling

### ErrorHandler
```typescript
class ErrorHandler {
  static logError(error: Error | string, context?: string): AppError
  static getErrors(): AppError[]
  static clearErrors(): void
  static getRecentErrors(count?: number): AppError[]
  static hasErrors(): boolean
  static getErrorCount(): number
}
```

### ValidationUtils
```typescript
class ValidationUtils {
  static validateTask(task: Partial<Task>): ValidationResult
  static validateAIAnalysis(analysis: Partial<AIAnalysisResult>): ValidationResult
  static validateTaskInput(input: string): ValidationResult
  static sanitizeTask(task: Partial<Task>): Partial<Task>
  static generateTaskId(): string
  static isTaskOverdue(task: Task): boolean
  static isTaskDueSoon(task: Task): boolean
}
```

## Usage Examples

### Adding a New Task
```typescript
import { StorageService } from '../services/storage';
import { AIService } from '../services/aiService';
import { ValidationUtils } from '../utils/validation';

const addNewTask = async (input: string) => {
  // Validate input
  const validation = ValidationUtils.validateTaskInput(input);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Analyze with AI
  const analysis = await AIService.analyzeTask(input);
  
  // Create task
  const task: Task = {
    id: ValidationUtils.generateTaskId(),
    title: input.trim(),
    quadrant: analysis.quadrant,
    priority: analysis.priority,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    estimatedTime: analysis.estimatedTime,
    tags: analysis.tags,
    aiSuggestion: {
      quadrant: analysis.quadrant,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
    },
  };

  // Validate task
  const taskValidation = ValidationUtils.validateTask(task);
  if (!taskValidation.isValid) {
    throw new Error(taskValidation.errors.join(', '));
  }

  // Save to storage
  await StorageService.addTask(task);
  
  return task;
};
```

### Getting Productivity Insights
```typescript
import { StorageService } from '../services/storage';
import { AIService } from '../services/aiService';

const getInsights = async () => {
  const tasks = await StorageService.getTasks();
  const insights = await AIService.getProductivityInsights(tasks);
  
  return {
    tasks,
    insights: insights.insights,
    recommendations: insights.recommendations,
  };
};
```

## Error Codes

```typescript
const ERROR_CODES = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
}
```

## Performance Monitoring

```typescript
import { measurePerformance, measureAsyncPerformance } from '../utils/errorHandler';

// Sync performance measurement
const result = measurePerformance('taskValidation', () => {
  return ValidationUtils.validateTask(task);
});

// Async performance measurement
const result = await measureAsyncPerformance('aiAnalysis', async () => {
  return await AIService.analyzeTask(input);
});
```

## Best Practices

1. **Always validate input data** before processing
2. **Use error handling** for all async operations
3. **Sanitize data** before storage
4. **Monitor performance** for critical operations
5. **Handle AI service failures** gracefully
6. **Use TypeScript** for type safety
7. **Follow React Native** best practices
8. **Test thoroughly** before deployment

## Future Enhancements

- Calendar integration
- Google Drive backup
- Push notifications
- Team collaboration
- Advanced analytics
- Mobile widgets
- Voice input
- Offline support 