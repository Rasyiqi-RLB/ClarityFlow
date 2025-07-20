import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

export interface DailyInsight {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'productivity' | 'motivation' | 'strategy' | 'wellness' | 'focus' | 'growth';
  emoji: string;
  readTime: number; // in minutes
  tips: string[];
  createdAt: Date;
}

export interface DailyInsightResponse {
  insight: DailyInsight;
  isNew: boolean;
}

export interface DynamicAIInsight {
  id: string;
  userId: string;
  type: 'insight' | 'recommendation';
  content: string;
  category: string;
  priority: number;
  createdAt: Date;
  isActive: boolean;
}

export interface AIInsightsResponse {
  insights: DynamicAIInsight[];
  recommendations: DynamicAIInsight[];
}

export interface ProductivityTip {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'focus' | 'time_management' | 'planning' | 'energy' | 'habits' | 'tools';
  priority: number;
  icon: string;
  applicableScenarios: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface ProductivityTipsResponse {
  tips: ProductivityTip[];
}

export class DailyInsightsService {
  private static readonly STORAGE_KEY = 'daily_insights';
  private static readonly LAST_GENERATED_KEY = 'last_insight_date';

  // Expanded insight templates for maximum variety
  private static readonly INSIGHT_TEMPLATES = [
    // Productivity Templates
    {
      category: 'productivity' as const,
      emoji: '⚡',
      title: 'Boost Your Productivity Today',
      contentTemplate: 'Today is a perfect day to optimize your workflow. {analysis}',
      tips: [
        'Use the 2-minute rule: if it takes less than 2 minutes, do it now',
        'Batch similar tasks together to maintain focus',
        'Take breaks every 90 minutes to maintain peak performance'
      ]
    },
    {
      category: 'productivity' as const,
      emoji: '🔥',
      title: 'Peak Performance Mode',
      contentTemplate: 'Unlock your highest potential today. {analysis}',
      tips: [
        'Start with your most challenging task when energy is highest',
        'Use the Pomodoro Technique for sustained focus',
        'Eliminate distractions before they eliminate your progress'
      ]
    },
    {
      category: 'productivity' as const,
      emoji: '⚙️',
      title: 'Efficiency Engine',
      contentTemplate: 'Small optimizations lead to massive gains. {analysis}',
      tips: [
        'Automate repetitive tasks wherever possible',
        'Create templates for common activities',
        'Review and refine your processes weekly'
      ]
    },

    // Motivation Templates
    {
      category: 'motivation' as const,
      emoji: '🚀',
      title: 'Motivation Monday Mindset',
      contentTemplate: 'Start your week with intention and purpose. {analysis}',
      tips: [
        'Set 3 clear priorities for the week',
        'Visualize your success before starting tasks',
        'Celebrate small wins throughout the day'
      ]
    },
    {
      category: 'motivation' as const,
      emoji: '💪',
      title: 'Unstoppable Energy',
      contentTemplate: 'Your determination is your superpower. {analysis}',
      tips: [
        'Remember why you started this journey',
        'Turn obstacles into stepping stones',
        'Progress, not perfection, is the goal'
      ]
    },
    {
      category: 'motivation' as const,
      emoji: '🌟',
      title: 'Champion Mindset',
      contentTemplate: 'Champions are made in moments like these. {analysis}',
      tips: [
        'Embrace challenges as growth opportunities',
        'Focus on what you can control',
        'Your future self will thank you for today\'s efforts'
      ]
    },

    // Strategy Templates
    {
      category: 'strategy' as const,
      emoji: '🎯',
      title: 'Strategic Focus Framework',
      contentTemplate: 'Strategic thinking leads to better outcomes. {analysis}',
      tips: [
        'Focus on important but not urgent tasks',
        'Eliminate or delegate low-value activities',
        'Review and adjust your priorities weekly'
      ]
    },
    {
      category: 'strategy' as const,
      emoji: '🧭',
      title: 'Navigation Mastery',
      contentTemplate: 'Clear direction creates powerful momentum. {analysis}',
      tips: [
        'Define your north star for decision making',
        'Break big goals into actionable steps',
        'Regularly assess if you\'re on the right path'
      ]
    },
    {
      category: 'strategy' as const,
      emoji: '♟️',
      title: 'Chess Master Thinking',
      contentTemplate: 'Think several moves ahead for lasting success. {analysis}',
      tips: [
        'Consider the long-term impact of today\'s decisions',
        'Anticipate potential obstacles and prepare solutions',
        'Build systems that work even when you\'re not watching'
      ]
    },

    // Wellness Templates
    {
      category: 'wellness' as const,
      emoji: '🌱',
      title: 'Work-Life Balance Wisdom',
      contentTemplate: 'Balance is key to sustainable productivity. {analysis}',
      tips: [
        'Schedule breaks as seriously as you schedule meetings',
        'Practice the 20-20-20 rule for eye health',
        'End your workday with a clear shutdown ritual'
      ]
    },
    {
      category: 'wellness' as const,
      emoji: '🧘',
      title: 'Mindful Productivity',
      contentTemplate: 'Presence and purpose create powerful results. {analysis}',
      tips: [
        'Take 5 minutes for mindful breathing before starting work',
        'Practice single-tasking for better quality outcomes',
        'Listen to your body\'s signals for rest and recovery'
      ]
    },
    {
      category: 'wellness' as const,
      emoji: '🌈',
      title: 'Holistic Success',
      contentTemplate: 'True success encompasses all areas of life. {analysis}',
      tips: [
        'Nurture relationships alongside professional goals',
        'Invest in your physical and mental health daily',
        'Create boundaries that protect your energy'
      ]
    },

    // Focus Templates
    {
      category: 'focus' as const,
      emoji: '🧠',
      title: 'Deep Focus Strategies',
      contentTemplate: 'Deep work creates exceptional results. {analysis}',
      tips: [
        'Use time-blocking to protect your focus time',
        'Turn off notifications during deep work sessions',
        'Create a dedicated workspace for concentration'
      ]
    },
    {
      category: 'focus' as const,
      emoji: '🎪',
      title: 'Attention Mastery',
      contentTemplate: 'Your attention is your most valuable resource. {analysis}',
      tips: [
        'Practice the art of saying no to distractions',
        'Use the "focus funnel" to narrow your attention',
        'Train your mind like an athlete trains their body'
      ]
    },
    {
      category: 'focus' as const,
      emoji: '🔍',
      title: 'Laser Precision',
      contentTemplate: 'Focused effort multiplies your impact. {analysis}',
      tips: [
        'Choose one priority and give it your full attention',
        'Use environmental cues to trigger focus states',
        'Measure depth of work, not just hours worked'
      ]
    },

    // Growth Templates
    {
      category: 'growth' as const,
      emoji: '📈',
      title: 'Continuous Improvement',
      contentTemplate: 'Every day is an opportunity to grow. {analysis}',
      tips: [
        'Reflect on what you learned today',
        'Seek feedback to accelerate your development',
        'Embrace the beginner\'s mind in new challenges'
      ]
    },
    {
      category: 'growth' as const,
      emoji: '🌿',
      title: 'Growth Mindset Activation',
      contentTemplate: 'Your potential is unlimited when you embrace growth. {analysis}',
      tips: [
        'View failures as valuable learning experiences',
        'Ask "How can I improve?" instead of "Why me?"',
        'Celebrate progress over perfection'
      ]
    }
  ];

  // Generate daily insight based on user's tasks and current date
  static async generateDailyInsight(tasks: Task[]): Promise<DailyInsightResponse> {
    const today = new Date().toDateString();
    const lastGenerated = await AsyncStorage.getItem(this.LAST_GENERATED_KEY);
    
    // Check if we already generated insight for today
    if (lastGenerated === today) {
      const existingInsight = await this.getTodaysInsight();
      if (existingInsight) {
        return { insight: existingInsight, isNew: false };
      }
    }

    // Generate new insight with enhanced variability
    const template = this.selectTemplate(tasks);
    const analysis = this.analyzeUserData(tasks);

    // Add date-based variation to title
    const dateVariation = new Date().getDate() % 3;
    let variedTitle = template.title;

    if (dateVariation === 1 && template.category === 'productivity') {
      variedTitle = variedTitle.replace('Today', 'This Moment');
    } else if (dateVariation === 2 && template.category === 'motivation') {
      variedTitle = variedTitle.replace('Mindset', 'Power');
    }

    const insight: DailyInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      date: today,
      title: variedTitle,
      content: template.contentTemplate.replace('{analysis}', analysis),
      category: template.category,
      emoji: template.emoji,
      readTime: Math.ceil((template.contentTemplate.length + analysis.length) / 200), // More accurate estimate
      tips: template.tips,
      createdAt: new Date()
    };

    // Save insight and update last generated date
    await this.saveInsight(insight);
    await AsyncStorage.setItem(this.LAST_GENERATED_KEY, today);

    return { insight, isNew: true };
  }

  // Select appropriate template based on day of week, user data, and rotation
  private static selectTemplate(tasks: Task[]) {
    const dayOfWeek = new Date().getDay();
    const dayOfMonth = new Date().getDate();
    const templates = this.INSIGHT_TEMPLATES;

    // Analyze user's current situation
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const urgentTasks = tasks.filter(t => t.quadrant === 'urgent-important').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Get templates for the day's primary category
    let primaryCategory: string;

    // Monday: Motivation (but vary based on performance)
    if (dayOfWeek === 1) {
      primaryCategory = completionRate < 50 ? 'motivation' : 'strategy';
    }
    // Tuesday/Wednesday: Productivity (but consider workload)
    else if (dayOfWeek === 2 || dayOfWeek === 3) {
      primaryCategory = urgentTasks > totalTasks * 0.4 ? 'focus' : 'productivity';
    }
    // Thursday: Strategy or Growth
    else if (dayOfWeek === 4) {
      primaryCategory = dayOfMonth % 2 === 0 ? 'strategy' : 'growth';
    }
    // Friday: Focus or Wellness
    else if (dayOfWeek === 5) {
      primaryCategory = totalTasks > 10 ? 'focus' : 'wellness';
    }
    // Weekend: Wellness or Growth
    else {
      primaryCategory = dayOfWeek === 0 ? 'wellness' : 'growth';
    }

    // Get all templates for the primary category
    const categoryTemplates = templates.filter(t => t.category === primaryCategory);

    if (categoryTemplates.length === 0) {
      return templates[0]; // Fallback
    }

    // Use day of month to rotate through templates in the category
    const templateIndex = dayOfMonth % categoryTemplates.length;
    return categoryTemplates[templateIndex];
  }

  // Analyze user data to create personalized content
  private static analyzeUserData(tasks: Task[]): string {
    if (tasks.length === 0) {
      const welcomeMessages = [
        "Welcome to your productivity journey! Today is a great day to start building better habits and achieving your goals.",
        "Every expert was once a beginner. Start small, think big, and take action today.",
        "Your future self will thank you for the productive choices you make today.",
        "The best time to plant a tree was 20 years ago. The second best time is now. Let's start growing!",
        "Success is the sum of small efforts repeated day in and day out. Begin your journey today."
      ];
      const messageIndex = new Date().getDate() % welcomeMessages.length;
      return welcomeMessages[messageIndex];
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const urgentTasks = tasks.filter(t => t.quadrant === 'urgent-important').length;
    const importantTasks = tasks.filter(t => t.quadrant === 'not-urgent-important').length;
    const delegateTasks = tasks.filter(t => t.quadrant === 'urgent-not-important').length;
    const eliminateTasks = tasks.filter(t => t.quadrant === 'not-urgent-not-important').length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const dayOfWeek = new Date().getDay();
    const timeOfDay = new Date().getHours();

    let analysis = "";

    // Performance-based opening
    if (completionRate > 90) {
      const excellentMessages = [
        "You're absolutely crushing it with a stellar completion rate! ",
        "Your productivity game is on fire - keep this momentum going! ",
        "Outstanding performance! You're setting the bar high for excellence. ",
        "Incredible work ethic! You're turning goals into achievements. "
      ];
      analysis += excellentMessages[new Date().getDate() % excellentMessages.length];
    } else if (completionRate > 70) {
      const goodMessages = [
        "You're making solid progress with consistent execution. ",
        "Strong performance! You're building great momentum. ",
        "Good work! You're developing excellent productivity habits. ",
        "Nice progress! You're on the right track to success. "
      ];
      analysis += goodMessages[new Date().getDate() % goodMessages.length];
    } else if (completionRate > 40) {
      const improvingMessages = [
        "You're building momentum - every step forward counts! ",
        "Progress is progress! You're moving in the right direction. ",
        "Keep pushing forward - consistency will compound your results. ",
        "You're developing your productivity muscles - stay committed! "
      ];
      analysis += improvingMessages[new Date().getDate() % improvingMessages.length];
    } else {
      const encouragingMessages = [
        "Every journey begins with a single step - you've got this! ",
        "Today is a fresh start to build better productivity habits. ",
        "Small improvements today lead to big results tomorrow. ",
        "Focus on progress, not perfection - you're capable of amazing things! "
      ];
      analysis += encouragingMessages[new Date().getDate() % encouragingMessages.length];
    }

    // Context-aware insights based on task distribution
    if (urgentTasks > totalTasks * 0.4) {
      const urgentAdvice = [
        "You have many urgent tasks - consider time-blocking to tackle them systematically.",
        "High urgency detected! Break down big tasks into smaller, manageable chunks.",
        "Lots of urgent items today - prioritize ruthlessly and focus on what truly matters.",
        "Urgent tasks are calling! Use the 'eat the frog' technique - tackle the hardest first."
      ];
      analysis += urgentAdvice[dayOfWeek % urgentAdvice.length];
    } else if (importantTasks > totalTasks * 0.5) {
      const strategicAdvice = [
        "Excellent focus on important tasks! These investments will pay dividends.",
        "You're thinking strategically - important tasks today create tomorrow's success.",
        "Great prioritization! Important work is the foundation of long-term achievement.",
        "Smart focus on what matters most - you're building sustainable success."
      ];
      analysis += strategicAdvice[dayOfWeek % strategicAdvice.length];
    } else if (delegateTasks > totalTasks * 0.3) {
      const delegationAdvice = [
        "Consider which urgent tasks could be delegated or streamlined for efficiency.",
        "Look for opportunities to automate or delegate routine urgent tasks.",
        "Some urgent tasks might be better handled by others - don't hesitate to delegate.",
        "Delegation is a superpower - identify tasks others could handle effectively."
      ];
      analysis += delegationAdvice[dayOfWeek % delegationAdvice.length];
    } else {
      // Time-of-day specific advice
      if (timeOfDay < 12) {
        const morningAdvice = [
          "Perfect timing to tackle your most challenging tasks while energy is high!",
          "Morning momentum is powerful - use this prime time for deep work.",
          "Your brain is fresh - ideal time for complex problem-solving tasks.",
          "Morning clarity is your advantage - focus on what matters most."
        ];
        analysis += morningAdvice[new Date().getDate() % morningAdvice.length];
      } else if (timeOfDay < 17) {
        const afternoonAdvice = [
          "Afternoon energy is perfect for collaborative tasks and communication.",
          "Use this time for tasks that require interaction and relationship building.",
          "Afternoon focus is ideal for reviewing progress and planning ahead.",
          "Great time to tackle administrative tasks and follow-ups."
        ];
        analysis += afternoonAdvice[new Date().getDate() % afternoonAdvice.length];
      } else {
        const eveningAdvice = [
          "Evening reflection time - perfect for planning tomorrow's priorities.",
          "Wind down productively by organizing and preparing for tomorrow.",
          "Evening is ideal for learning, reading, and personal development.",
          "Use this time to celebrate today's wins and set tomorrow's intentions."
        ];
        analysis += eveningAdvice[new Date().getDate() % eveningAdvice.length];
      }
    }

    return analysis;
  }

  // Save insight to storage
  private static async saveInsight(insight: DailyInsight): Promise<void> {
    try {
      const existingInsights = await this.getAllInsights();
      const updatedInsights = [insight, ...existingInsights.slice(0, 29)]; // Keep last 30 insights
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedInsights));
    } catch (error) {
      console.error('Error saving daily insight:', error);
    }
  }

  // Get today's insight
  static async getTodaysInsight(): Promise<DailyInsight | null> {
    try {
      const insights = await this.getAllInsights();
      const today = new Date().toDateString();
      return insights.find(insight => insight.date === today) || null;
    } catch (error) {
      console.error('Error getting today\'s insight:', error);
      return null;
    }
  }

  // Get all insights
  static async getAllInsights(): Promise<DailyInsight[]> {
    try {
      const insightsJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (insightsJson) {
        const insights = JSON.parse(insightsJson);
        return insights.map((insight: any) => ({
          ...insight,
          createdAt: new Date(insight.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting insights:', error);
      return [];
    }
  }

  // Get insights for the last N days
  static async getRecentInsights(days: number = 7): Promise<DailyInsight[]> {
    try {
      const allInsights = await this.getAllInsights();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return allInsights.filter(insight => 
        new Date(insight.createdAt) >= cutoffDate
      ).slice(0, days);
    } catch (error) {
      console.error('Error getting recent insights:', error);
      return [];
    }
  }

  // Clear old insights (keep last 30 days)
  static async cleanupOldInsights(): Promise<void> {
    try {
      const insights = await this.getAllInsights();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const recentInsights = insights.filter(insight =>
        new Date(insight.createdAt) >= cutoffDate
      );

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentInsights));
    } catch (error) {
      console.error('Error cleaning up insights:', error);
    }
  }

  // Generate dynamic AI insights and recommendations
  static async generateDynamicAIInsights(tasks: Task[], userId: string): Promise<AIInsightsResponse> {
    const insights: DynamicAIInsight[] = [];
    const recommendations: DynamicAIInsight[] = [];

    if (tasks.length === 0) {
      // Welcome insights for new users
      insights.push({
        id: `insight_welcome_${Date.now()}`,
        userId,
        type: 'insight',
        content: 'Welcome to ClarityFlow! Your productivity journey starts here.',
        category: 'welcome',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });

      recommendations.push({
        id: `rec_welcome_${Date.now()}`,
        userId,
        type: 'recommendation',
        content: 'Try adding a task with keywords like "urgent", "important", or "meeting" to see AI analysis in action.',
        category: 'getting_started',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });

      return { insights, recommendations };
    }

    // Analyze task patterns for dynamic insights
    const completedTasks = tasks.filter(t => t.completed);
    const urgentTasks = tasks.filter(t => t.quadrant === 'urgent-important');
    const importantTasks = tasks.filter(t => t.quadrant === 'not-urgent-important');
    const totalTasks = tasks.length;

    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    const urgentRatio = totalTasks > 0 ? (urgentTasks.length / totalTasks) * 100 : 0;
    const importantRatio = totalTasks > 0 ? (importantTasks.length / totalTasks) * 100 : 0;

    // Generate insights based on patterns
    if (completionRate > 80) {
      insights.push({
        id: `insight_completion_${Date.now()}`,
        userId,
        type: 'insight',
        content: `Excellent work! You have a ${completionRate.toFixed(0)}% completion rate, showing strong execution skills.`,
        category: 'performance',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });
    } else if (completionRate < 50) {
      insights.push({
        id: `insight_completion_low_${Date.now()}`,
        userId,
        type: 'insight',
        content: `Your current completion rate is ${completionRate.toFixed(0)}%. There's opportunity to improve task execution.`,
        category: 'performance',
        priority: 2,
        createdAt: new Date(),
        isActive: true
      });
    }

    if (urgentRatio > 40) {
      insights.push({
        id: `insight_urgent_${Date.now()}`,
        userId,
        type: 'insight',
        content: `${urgentRatio.toFixed(0)}% of your tasks are urgent. This suggests reactive rather than proactive planning.`,
        category: 'planning',
        priority: 2,
        createdAt: new Date(),
        isActive: true
      });
    }

    if (importantRatio > 30) {
      insights.push({
        id: `insight_strategic_${Date.now()}`,
        userId,
        type: 'insight',
        content: `Great strategic thinking! ${importantRatio.toFixed(0)}% of your tasks focus on important long-term goals.`,
        category: 'strategy',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });
    }

    // Generate recommendations
    if (urgentRatio > 30) {
      recommendations.push({
        id: `rec_planning_${Date.now()}`,
        userId,
        type: 'recommendation',
        content: 'Schedule weekly planning sessions to move tasks from urgent to planned categories.',
        category: 'planning',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });
    }

    if (completionRate < 70) {
      recommendations.push({
        id: `rec_breakdown_${Date.now()}`,
        userId,
        type: 'recommendation',
        content: 'Break large tasks into smaller, more manageable subtasks to improve completion rates.',
        category: 'execution',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });
    }

    if (importantRatio < 20) {
      recommendations.push({
        id: `rec_strategic_${Date.now()}`,
        userId,
        type: 'recommendation',
        content: 'Dedicate time to important but not urgent tasks to prevent future crises.',
        category: 'strategy',
        priority: 2,
        createdAt: new Date(),
        isActive: true
      });
    }

    // Add time-based recommendations
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 9 && hour <= 11) {
      recommendations.push({
        id: `rec_morning_${Date.now()}`,
        userId,
        type: 'recommendation',
        content: 'Morning hours are perfect for tackling your most challenging tasks when energy is highest.',
        category: 'timing',
        priority: 1,
        createdAt: new Date(),
        isActive: true
      });
    }

    // Save to Firestore (with inline import to avoid auto-formatting issues)
    try {
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      const allItems = [...insights, ...recommendations];
      console.log(`💾 Saving ${allItems.length} AI insights/recommendations to Firestore...`);

      // Save insights to Firestore (but don't let it block the response)
      const savePromises = allItems.map(async (insight) => {
        try {
          await setDoc(doc(collection(db, 'ai_insights'), insight.id), {
            ...insight,
            createdAt: insight.createdAt.toISOString()
          });
          console.log(`✅ Saved ${insight.type}: ${insight.content.substring(0, 50)}...`);
        } catch (saveError) {
          console.error(`❌ Error saving ${insight.type} ${insight.id} to Firestore:`, saveError);
        }
      });

      // Wait for saves to complete to ensure data persistence
      await Promise.all(savePromises);
      console.log(`🎉 Successfully saved all ${allItems.length} AI items to Firestore`);

    } catch (error) {
      console.error('❌ Error setting up Firestore save:', error);
      // Continue without Firestore - insights will still work locally
    }

    return { insights, recommendations };
  }

  // Get insights from Firestore for a user (simplified query to avoid index requirement)
  static async getInsightsFromFirestore(userId: string): Promise<AIInsightsResponse> {
    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      // Simplified query - only filter by userId and orderBy createdAt
      // We'll filter by type and isActive in JavaScript to avoid complex index
      const allInsightsQuery = query(
        collection(db, 'ai_insights'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20) // Get more to filter in JS
      );

      const snapshot = await getDocs(allInsightsQuery);

      const insights: DynamicAIInsight[] = [];
      const recommendations: DynamicAIInsight[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const item = {
          ...data,
          createdAt: new Date(data.createdAt)
        } as DynamicAIInsight;

        // Filter in JavaScript to avoid complex Firestore index
        if (item.isActive) {
          if (item.type === 'insight' && insights.length < 5) {
            insights.push(item);
          } else if (item.type === 'recommendation' && recommendations.length < 5) {
            recommendations.push(item);
          }
        }
      });

      return { insights, recommendations };
    } catch (error) {
      console.error('Error getting insights from Firestore:', error);
      // Fallback: return empty arrays instead of crashing
      return { insights: [], recommendations: [] };
    }
  }

  // Save daily insight to Firestore
  static async saveDailyInsightToFirestore(insight: DailyInsight, userId: string): Promise<void> {
    try {
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      await setDoc(doc(collection(db, 'daily_insights'), insight.id), {
        ...insight,
        userId,
        createdAt: insight.createdAt.toISOString()
      });
    } catch (error) {
      console.error('Error saving daily insight to Firestore:', error);
    }
  }

  // Get previous insights from Firestore (excluding today's insight)
  static async getPreviousInsightsFromFirestore(userId: string): Promise<DailyInsight[]> {
    try {
      console.log('🔥 DailyInsightsService: Starting Firestore query for userId:', userId);
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      // Get today's date string for comparison
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today\'s date for filtering:', today);

      // Simple query without orderBy to avoid index requirement
      const insightsQuery = query(
        collection(db, 'daily_insights'),
        where('userId', '==', userId)
      );
      console.log('🔍 Query created for collection daily_insights with userId filter');

      const snapshot = await getDocs(insightsQuery);
      console.log('📊 Query executed, snapshot size:', snapshot.size);

      const insights: DailyInsight[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('📄 Processing document:', doc.id, 'with data:', data);

        const insight = {
          ...data,
          createdAt: new Date(data.createdAt)
        } as DailyInsight;

        // Include all insights for previous insights section
        // We'll show the most recent ones regardless of date
        const insightDate = insight.createdAt.toISOString().split('T')[0];
        console.log('📅 Insight date:', insightDate, 'vs today:', today);

        insights.push(insight);
        console.log('✅ Added insight to results');
      });

      console.log('📋 Total insights before sorting:', insights.length);

      // Sort in JavaScript instead of Firestore
      insights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Return only the first 5 insights
      const result = insights.slice(0, 5);
      console.log('✅ Final result:', result.length, 'insights');
      return result;
    } catch (error) {
      console.error('❌ Error getting previous insights from Firestore:', error);
      return [];
    }
  }

  // Debug method to get all insights
  static async getAllInsightsForDebug(): Promise<any[]> {
    try {
      console.log('🔍 Debug: Getting all insights from Firestore...');
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      const snapshot = await getDocs(collection(db, 'daily_insights'));
      const allInsights: any[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('📄 Debug document:', doc.id, 'userId:', data.userId, 'data:', data);
        allInsights.push({
          id: doc.id,
          ...data
        });
      });

      console.log('📊 Debug: Total insights found:', allInsights.length);
      return allInsights;
    } catch (error) {
      console.error('❌ Debug error getting all insights:', error);
      return [];
    }
  }

  // Generate dynamic productivity tips based on user behavior
  static async generateProductivityTips(tasks: Task[], userId: string): Promise<ProductivityTipsResponse> {
    const tips: ProductivityTip[] = [];

    if (tasks.length === 0) {
      // Welcome tips for new users
      tips.push({
        id: `tip_welcome_${Date.now()}`,
        userId,
        title: 'Start with the Eisenhower Matrix',
        content: 'Categorize your tasks into four quadrants: Urgent & Important, Important but Not Urgent, Urgent but Not Important, and Neither.',
        category: 'planning',
        priority: 1,
        icon: '🎯',
        applicableScenarios: ['new_user', 'getting_started'],
        createdAt: new Date(),
        isActive: true
      });

      tips.push({
        id: `tip_first_task_${Date.now()}`,
        userId,
        title: 'Add Your First Task',
        content: 'Begin by adding a task that you need to complete today. Use keywords like "urgent" or "important" to see AI categorization in action.',
        category: 'habits',
        priority: 1,
        icon: '✅',
        applicableScenarios: ['new_user', 'empty_task_list'],
        createdAt: new Date(),
        isActive: true
      });

      return { tips };
    }

    // Analyze user patterns for personalized tips
    const completedTasks = tasks.filter(t => t.completed);
    const urgentTasks = tasks.filter(t => t.quadrant === 'urgent-important');
    const importantTasks = tasks.filter(t => t.quadrant === 'not-urgent-important');
    const totalTasks = tasks.length;

    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    const urgentRatio = totalTasks > 0 ? (urgentTasks.length / totalTasks) * 100 : 0;
    const importantRatio = totalTasks > 0 ? (importantTasks.length / totalTasks) * 100 : 0;

    // Time-based tips
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour <= 10) {
      tips.push({
        id: `tip_morning_${Date.now()}`,
        userId,
        title: 'Morning Power Hour',
        content: 'Use your morning energy for the most challenging tasks. Your brain is freshest in the first few hours after waking.',
        category: 'energy',
        priority: 1,
        icon: '🌅',
        applicableScenarios: ['morning', 'high_energy'],
        createdAt: new Date(),
        isActive: true
      });
    }

    // Completion rate based tips
    if (completionRate < 50) {
      tips.push({
        id: `tip_completion_${Date.now()}`,
        userId,
        title: 'Break Tasks Into Smaller Steps',
        content: 'Large tasks can feel overwhelming. Break them into 15-30 minute chunks to build momentum and see progress.',
        category: 'planning',
        priority: 1,
        icon: '🔨',
        applicableScenarios: ['low_completion', 'overwhelmed'],
        createdAt: new Date(),
        isActive: true
      });

      tips.push({
        id: `tip_quick_wins_${Date.now()}`,
        userId,
        title: 'Start with Quick Wins',
        content: 'Begin your day with 2-3 small tasks you can complete quickly. This builds momentum for bigger challenges.',
        category: 'habits',
        priority: 2,
        icon: '⚡',
        applicableScenarios: ['low_completion', 'motivation'],
        createdAt: new Date(),
        isActive: true
      });
    } else if (completionRate > 80) {
      tips.push({
        id: `tip_high_performer_${Date.now()}`,
        userId,
        title: 'Level Up Your Goals',
        content: 'You\'re crushing your current tasks! Consider setting more ambitious goals or taking on strategic projects.',
        category: 'planning',
        priority: 1,
        icon: '🚀',
        applicableScenarios: ['high_completion', 'growth'],
        createdAt: new Date(),
        isActive: true
      });
    }

    // Urgent tasks ratio tips
    if (urgentRatio > 40) {
      tips.push({
        id: `tip_urgent_${Date.now()}`,
        userId,
        title: 'Schedule Weekly Planning',
        content: 'Too many urgent tasks suggest reactive planning. Set aside 30 minutes each Sunday to plan your week proactively.',
        category: 'planning',
        priority: 1,
        icon: '📅',
        applicableScenarios: ['too_many_urgent', 'reactive_planning'],
        createdAt: new Date(),
        isActive: true
      });

      tips.push({
        id: `tip_buffer_time_${Date.now()}`,
        userId,
        title: 'Add Buffer Time',
        content: 'Leave 25% of your schedule unplanned for unexpected urgent tasks and interruptions.',
        category: 'time_management',
        priority: 2,
        icon: '⏰',
        applicableScenarios: ['too_many_urgent', 'time_pressure'],
        createdAt: new Date(),
        isActive: true
      });
    }

    // Important tasks ratio tips
    if (importantRatio < 20) {
      tips.push({
        id: `tip_important_${Date.now()}`,
        userId,
        title: 'Focus on Important Tasks',
        content: 'Schedule time for important but not urgent tasks. These drive long-term success and prevent future crises.',
        category: 'planning',
        priority: 1,
        icon: '🎯',
        applicableScenarios: ['neglecting_important', 'long_term_planning'],
        createdAt: new Date(),
        isActive: true
      });
    }

    // Focus and concentration tips
    tips.push({
      id: `tip_focus_${Date.now()}`,
      userId,
      title: 'Use the Pomodoro Technique',
      content: 'Work in 25-minute focused sessions followed by 5-minute breaks. This maintains concentration and prevents burnout.',
      category: 'focus',
      priority: 2,
      icon: '🍅',
      applicableScenarios: ['focus_issues', 'time_management'],
      createdAt: new Date(),
      isActive: true
    });

    // Tools and optimization tips
    if (tasks.length > 10) {
      tips.push({
        id: `tip_tools_${Date.now()}`,
        userId,
        title: 'Automate Repetitive Tasks',
        content: 'Look for patterns in your tasks. Can any be automated, delegated, or eliminated entirely?',
        category: 'tools',
        priority: 2,
        icon: '🤖',
        applicableScenarios: ['many_tasks', 'optimization'],
        createdAt: new Date(),
        isActive: true
      });
    }

    // Save tips to Firestore
    try {
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      const savePromises = tips.map(async (tip) => {
        try {
          await setDoc(doc(collection(db, 'productivity_tips'), tip.id), {
            ...tip,
            createdAt: tip.createdAt.toISOString()
          });
        } catch (saveError) {
          console.error(`Error saving tip ${tip.id} to Firestore:`, saveError);
        }
      });

      Promise.all(savePromises).catch(error => {
        console.error('Some tips failed to save to Firestore:', error);
      });

    } catch (error) {
      console.error('Error setting up Firestore save for tips:', error);
    }

    return { tips };
  }

  // Get productivity tips from Firestore
  static async getProductivityTipsFromFirestore(userId: string): Promise<ProductivityTipsResponse> {
    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      // Try complex query first
      try {
        const tipsQuery = query(
          collection(db, 'productivity_tips'),
          where('userId', '==', userId),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6) // Show max 6 tips
        );

        const snapshot = await getDocs(tipsQuery);
        const tips: ProductivityTip[] = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          tips.push({
            ...data,
            createdAt: new Date(data.createdAt)
          } as ProductivityTip);
        });

        console.log(`✅ Found ${tips.length} productivity tips from Firestore`);
        return { tips };

      } catch (indexError: any) {
        // If index is still building, try simpler query
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.log('🔄 Index still building, trying simpler query...');

          const simpleQuery = query(
            collection(db, 'productivity_tips'),
            where('userId', '==', userId),
            limit(6)
          );

          const snapshot = await getDocs(simpleQuery);
          const tips: ProductivityTip[] = [];

          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.isActive) { // Filter in memory since we can't use compound query
              tips.push({
                ...data,
                createdAt: new Date(data.createdAt)
              } as ProductivityTip);
            }
          });

          // Sort in memory
          tips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          console.log(`✅ Found ${tips.length} productivity tips using fallback query`);
          return { tips: tips.slice(0, 6) };
        }

        throw indexError;
      }

    } catch (error) {
      console.error('Error getting tips from Firestore:', error);
      return { tips: [] };
    }
  }
}
