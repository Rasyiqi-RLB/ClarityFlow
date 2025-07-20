import { Task, EisenhowerQuadrant } from '../types';

export const DEMO_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    description: 'Go through the new project proposal and provide feedback to the team',
    quadrant: 'not-urgent-important' as EisenhowerQuadrant,
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    completed: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['work', 'review'],
    estimatedTime: 60,
    aiSuggestion: {
      quadrant: 'not-urgent-important' as EisenhowerQuadrant,
      confidence: 0.85,
      reasoning: 'Task is important for project success but not urgent yet.',
    },
  },
  {
    id: '2',
    title: 'Respond to urgent client email',
    description: 'Client needs immediate response regarding their order status',
    quadrant: 'urgent-important' as EisenhowerQuadrant,
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    completed: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['work', 'client', 'urgent'],
    estimatedTime: 15,
    aiSuggestion: {
      quadrant: 'urgent-important' as EisenhowerQuadrant,
      confidence: 0.95,
      reasoning: 'Client communication is both urgent and important for business.',
    },
  },
  {
    id: '3',
    title: 'Organize desk',
    description: 'Clean and organize workspace for better productivity',
    quadrant: 'not-urgent-not-important' as EisenhowerQuadrant,
    priority: 'low',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ['personal', 'organization'],
    estimatedTime: 30,
    aiSuggestion: {
      quadrant: 'not-urgent-not-important' as EisenhowerQuadrant,
      confidence: 0.7,
      reasoning: 'Desk organization can improve productivity but is not urgent.',
    },
  },
  {
    id: '4',
    title: 'Delegate team meeting notes',
    description: 'Ask team member to take notes during the weekly meeting',
    quadrant: 'urgent-not-important' as EisenhowerQuadrant,
    priority: 'medium',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    completed: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    tags: ['work', 'delegate', 'meeting'],
    estimatedTime: 5,
    aiSuggestion: {
      quadrant: 'urgent-not-important' as EisenhowerQuadrant,
      confidence: 0.8,
      reasoning: 'Meeting notes are urgent but can be delegated to team members.',
    },
  },
  {
    id: '5',
    title: 'Prepare presentation for board meeting',
    description: 'Create comprehensive presentation for quarterly board meeting',
    quadrant: 'not-urgent-important' as EisenhowerQuadrant,
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ['work', 'presentation', 'board'],
    estimatedTime: 180,
    aiSuggestion: {
      quadrant: 'not-urgent-important' as EisenhowerQuadrant,
      confidence: 0.9,
      reasoning: 'Board presentation is critical but can be planned in advance.',
    },
  },
  {
    id: '6',
    title: 'Check social media notifications',
    description: 'Quick check of social media updates and messages',
    quadrant: 'not-urgent-not-important' as EisenhowerQuadrant,
    priority: 'low',
    dueDate: undefined,
    completed: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['personal', 'social'],
    estimatedTime: 10,
    aiSuggestion: {
      quadrant: 'not-urgent-not-important' as EisenhowerQuadrant,
      confidence: 0.75,
      reasoning: 'Social media checking is neither urgent nor important for productivity.',
    },
  },
  {
    id: '7',
    title: 'Fix critical bug in production',
    description: 'Address critical security vulnerability in live application',
    quadrant: 'urgent-important' as EisenhowerQuadrant,
    priority: 'high',
    dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    completed: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    tags: ['work', 'bug', 'security', 'critical'],
    estimatedTime: 120,
    aiSuggestion: {
      quadrant: 'urgent-important' as EisenhowerQuadrant,
      confidence: 0.98,
      reasoning: 'Security vulnerabilities are both urgent and critically important.',
    },
  },
  {
    id: '8',
    title: 'Schedule dentist appointment',
    description: 'Book routine dental checkup for next month',
    quadrant: 'not-urgent-important' as EisenhowerQuadrant,
    priority: 'medium',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tags: ['personal', 'health'],
    estimatedTime: 15,
    aiSuggestion: {
      quadrant: 'not-urgent-important' as EisenhowerQuadrant,
      confidence: 0.8,
      reasoning: 'Health appointments are important but not urgent when scheduled in advance.',
    },
  },
];

// Functions removed - not used in codebase
// loadDemoData, getDemoTask, getDemoTasksByQuadrant