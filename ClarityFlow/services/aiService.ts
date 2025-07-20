import { ENV_CONFIG, getPrimaryAIProvider, hasAIFeatures, hasExternalAI } from '../config/env';
import { AIAnalysisResult, EisenhowerQuadrant, Task } from '../types';

// AI service - 100% AI-driven task analysis
export class AIService {
  // Check if user is online
  static isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    // For React Native, assume online if no navigator
    return true;
  }

  // Analyze task input and suggest quadrant - 100% AI only
  static async analyzeTask(input: string, context?: {
    existingTasks?: Task[];
    userPreferences?: any;
    currentTime?: Date;
  }): Promise<AIAnalysisResult> {
    console.log('🤖 AI Service: Starting 100% AI analysis for task:', input);
    
    // Check if user is online first
    if (!this.isOnline()) {
      console.log('❌ User is offline');
      throw new Error('OFFLINE');
    }

    // Check if AI features are enabled
    const hasFeatures = hasAIFeatures();
    console.log('🤖 AI Features enabled:', hasFeatures);
    
    if (!hasFeatures) {
      console.log('❌ AI features disabled');
      throw new Error('AI_DISABLED');
    }

    // Check if external AI APIs are available
    const hasExternal = await hasExternalAI();
    console.log('🤖 External AI available:', hasExternal);
    
    if (!hasExternal) {
      console.log('❌ No AI API configured');
      throw new Error('NO_AI_API');
    }

    const provider = await getPrimaryAIProvider();
    console.log('🤖 Using AI analysis with provider:', provider);
    
    try {
      const result = await this.enhancedAIAnalysis(input, context, provider);
      console.log('🤖 AI analysis completed successfully:', result);
      return result;
    } catch (enhancedError) {
      console.error('❌ AI analysis failed:', enhancedError);
      throw new Error('AI_FAILED');
    }
  }

  // Create manual task when AI fails but user is online
  static createManualTask(
    input: string, 
    selectedQuadrant: EisenhowerQuadrant,
    estimatedTime?: number,
    dueDate?: Date,
    tags?: string[]
  ): AIAnalysisResult {
    console.log('📝 Creating manual task for quadrant:', selectedQuadrant);
    
    const quadrantDescriptions = {
      'urgent-important': 'Urgent & Important - Do First',
      'not-urgent-important': 'Important, Not Urgent - Schedule',
      'urgent-not-important': 'Urgent, Not Important - Delegate',
      'not-urgent-not-important': 'Neither Urgent nor Important - Eliminate'
    };

    return {
      quadrant: selectedQuadrant,
      confidence: 1.0, // Manual selection = 100% confidence
      reasoning: `Manual placement in ${quadrantDescriptions[selectedQuadrant]} quadrant`,
      suggestedDueDate: dueDate || undefined,
      estimatedTime: estimatedTime || 30,
      tags: tags || [],
      priority: this.determinePriority(selectedQuadrant, 1.0, dueDate),
    };
  }

  private static async enhancedAIAnalysis(
    input: string, 
    context?: any, 
    provider: 'gemini' | 'openrouter' | 'none' = 'gemini'
  ): Promise<AIAnalysisResult> {
    try {
      console.log(`🚀 Starting enhanced AI analysis with provider: ${provider}`);
      console.log(`📝 Input text: "${input}"`);
      console.log(`🤖 Using ${provider} AI for enhanced analysis`);
      
      if (provider === 'gemini') {
        console.log('🧠 Using Gemini for analysis');
        const result = await this.analyzeWithGemini(input, context);
        console.log('✅ Gemini analysis completed:', result);
        return result;
      } else if (provider === 'openrouter') {
        console.log('🌐 Using OpenRouter for analysis');
        const result = await this.analyzeWithOpenRouter(input, context);
        console.log('✅ OpenRouter analysis completed:', result);
        return result;
      }
      
      console.log('⚠️ No valid provider specified');
      throw new Error('NO_VALID_PROVIDER');
    } catch (error) {
      console.error(`❌ Error with ${provider} AI:`, error);
      throw error;
    }
  }

  private static async analyzeWithGemini(input: string, context?: any): Promise<AIAnalysisResult> {
    const apiKey = await this.getAPIKey('gemini');
    if (!apiKey) {
      console.log('🤖 Gemini API key not found');
      throw new Error('NO_GEMINI_API_KEY');
    }

    // Validate API key format for Gemini (should start with AIzaSy)
    if (!apiKey.startsWith('AIzaSy')) {
      console.error('❌ Invalid Gemini API key format. Gemini API keys should start with "AIzaSy"');
      throw new Error('INVALID_GEMINI_API_KEY');
    }

    const prompt = this.buildAnalysisPrompt(input, context);
    
    try {
      console.log('🧠 Making request to Gemini API with key:', apiKey.substring(0, 10) + '...');
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      console.log('📡 Gemini API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Gemini API response data:', data);
      
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        console.error('❌ No response content from Gemini API');
        throw new Error('Invalid response from Gemini API');
      }

      console.log('🤖 Gemini response content:', aiResponse);
      return this.parseAIResponse(aiResponse, 'Gemini AI', input);
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw error;
    }
  }

  private static async analyzeWithOpenRouter(input: string, context?: any): Promise<AIAnalysisResult> {
    console.log('🌐 Starting OpenRouter analysis');
    
    const apiKey = await this.getAPIKey('openrouter');
    if (!apiKey) {
      console.error('❌ OpenRouter API key not found');
      throw new Error('NO_OPENROUTER_API_KEY');
    }
    
    console.log('✅ OpenRouter API key found, length:', apiKey.length);

    const prompt = this.buildAnalysisPrompt(input, context);
    console.log('📝 Built analysis prompt:', prompt.substring(0, 200) + '...');
    
    try {
      console.log('🌐 Making API call to OpenRouter...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://clarityflow.app',
          'X-Title': 'ClarityFlow Task Manager'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      console.log('📡 OpenRouter API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error response:', errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 OpenRouter API response data:', data);
      
      const aiResponse = data.choices?.[0]?.message?.content;
      console.log('🤖 AI response content:', aiResponse);
      
      if (!aiResponse) {
        console.error('❌ No response content from OpenRouter API');
        throw new Error('Invalid response from OpenRouter API');
      }

      console.log('🔍 Parsing AI response...');
      const result = this.parseAIResponse(aiResponse, 'OpenRouter AI', input);
      console.log('✅ Parsed result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ OpenRouter API error:', error);
      throw error;
    }
  }

  private static async getAPIKey(provider: 'gemini' | 'openrouter'): Promise<string | null> {
    try {
      console.log(`🔑 Getting API key for ${provider}`);
      
      // Use the new apiKeyService for consistent API key management
const { default: apiKeyService } = await import('./apiKeyService');
const configs = await apiKeyService.loadAPIConfigs();
      
      console.log(`🔑 API configs loaded:`, configs.length > 0);
      
      const config = configs.find((c: any) => 
        (provider === 'gemini' && c.name === 'Gemini') ||
        (provider === 'openrouter' && c.name === 'OpenRouter')
      );
      
      console.log(`🔑 Found config for ${provider}:`, {
        found: !!config,
        enabled: config?.enabled,
        hasApiKey: !!config?.apiKey,
        apiKeyLength: config?.apiKey?.length || 0
      });
      
      if (config?.enabled && config?.apiKey) {
        // Validate API key format before using
        const isValidFormat = apiKeyService.validateAPIKeyFormat(provider, config.apiKey);
        if (!isValidFormat) {
          console.error(`❌ Invalid ${provider} API key format:`, config.apiKey.substring(0, 10) + '...');
          return null;
        }
        console.log(`✅ Using configured API key for ${provider}`);
        return config.apiKey;
      }
      
      // Fallback to environment variables
      console.log(`🔑 Checking environment variables for ${provider}`);
      if (provider === 'gemini') {
        const envKey = ENV_CONFIG.GEMINI_API_KEY;
        console.log(`🔑 Gemini env key available:`, !!envKey);
        return envKey || null;
      } else if (provider === 'openrouter') {
        const envKey = ENV_CONFIG.OPENROUTER_API_KEY;
        console.log(`🔑 OpenRouter env key available:`, !!envKey);
        return envKey || null;
      }
      
      console.log(`❌ No API key found for ${provider}`);
      return null;
    } catch (error) {
      console.error(`❌ Error getting ${provider} API key:`, error);
      return null;
    }
  }

  private static detectLanguage(input: string): 'id' | 'en' {
    const lowerInput = input.toLowerCase();
    
    // Indonesian keywords and patterns
    const indonesianKeywords = [
      'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'dalam', 'yang', 'ini', 'itu',
      'saya', 'aku', 'kamu', 'dia', 'mereka', 'kita', 'kami',
      'buat', 'bikin', 'lakukan', 'kerjakan', 'selesaikan', 'tugas', 'pekerjaan',
      'hari', 'minggu', 'bulan', 'tahun', 'jam', 'menit',
      'penting', 'urgent', 'mendesak', 'segera', 'cepat',
      'rapat', 'meeting', 'presentasi', 'laporan', 'proyek',
      'besok', 'nanti', 'sekarang', 'hari ini', 'kemarin'
    ];
    
    // Count Indonesian keywords
    let indonesianScore = 0;
    indonesianKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) {
        indonesianScore++;
      }
    });
    
    // Check for Indonesian sentence patterns
    if (lowerInput.includes('harus') || lowerInput.includes('perlu') || 
        lowerInput.includes('mau') || lowerInput.includes('ingin') ||
        lowerInput.includes('akan') || lowerInput.includes('sudah')) {
      indonesianScore += 2;
    }
    
    // Return Indonesian if score is high enough, otherwise English
    return indonesianScore >= 2 ? 'id' : 'en';
  }

  private static buildAnalysisPrompt(input: string, context?: any): string {
    const currentTime = new Date().toLocaleString();
    const language = this.detectLanguage(input);
    
    if (language === 'id') {
      // Indonesian prompt
      return `Analisis tugas ini dan kategorikan menggunakan Matriks Eisenhower. Respons HANYA dengan objek JSON yang valid dalam format yang tepat ini:

{
  "quadrant": "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important",
  "confidence": 0.8,
  "reasoning": "Penjelasan singkat mengapa tugas ini termasuk dalam kuadran ini",
  "suggestedDueDate": "2024-01-15" | undefined,
  "estimatedTime": 60,
  "tags": ["kerja", "rapat"],
  "priority": "high" | "medium" | "low"
}

Tugas yang akan dianalisis: "${input}"
Waktu saat ini: ${currentTime}

PENTING:
- WAJIB berikan reasoning dalam bahasa yang sama dengan bahasa input user
- Gunakan terminologi yang sesuai dengan bahasa input untuk menjelaskan analisis
- Jangan gunakan bahasa lain selain bahasa yang digunakan user
- Respons harus sesuai dengan bahasa yang digunakan user saat input

Pertimbangkan:
- Urgent (Mendesak) = perlu perhatian segera, sensitif waktu, didorong deadline
- Important (Penting) = berkontribusi pada tujuan jangka panjang, memiliki dampak signifikan
- Gunakan kata kunci, petunjuk konteks, dan waktu untuk menentukan urgensi dan kepentingan
- Estimasi waktu dalam menit
- Sarankan tanggal jatuh tempo yang realistis jika ada indikator waktu
- Ekstrak tag yang relevan dari konten
- Tetapkan prioritas berdasarkan kuadran dan urgensi

Respons HANYA dengan objek JSON, tanpa teks tambahan. WAJIB berikan reasoning dalam bahasa yang sama dengan input user.`;
    } else {
      // English prompt (default)
      return `Analyze this task and categorize it using the Eisenhower Matrix. Respond ONLY with a valid JSON object in this exact format:

{
  "quadrant": "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important",
  "confidence": 0.8,
  "reasoning": "Brief explanation of why this task belongs in this quadrant",
  "suggestedDueDate": "2024-01-15" | undefined,
  "estimatedTime": 60,
  "tags": ["work", "meeting"],
  "priority": "high" | "medium" | "low"
}

Task to analyze: "${input}"
Current time: ${currentTime}

IMPORTANT:
- MUST provide reasoning in the same language as user input
- Use appropriate terminology for the input language in analysis
- Do not use other languages besides the user's input language
- Response must match the language used by user in input

Consider:
- Urgent = needs immediate attention, time-sensitive, deadline-driven
- Important = contributes to long-term goals, has significant impact
- Use keywords, context clues, and timing to determine urgency and importance
- Estimate time in minutes
- Suggest realistic due date if time indicators are present
- Extract relevant tags from content
- Set priority based on quadrant and urgency

Respond with ONLY the JSON object, no additional text. MUST provide reasoning in the same language as user input.`;
    }
  }

  private static parseAIResponse(response: string, provider: string, originalInput?: string): AIAnalysisResult {
    try {
      // Extract JSON from response if it contains other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const parsed = JSON.parse(jsonStr);
      
      // Validate required fields
      if (!parsed.quadrant || !parsed.reasoning) {
        throw new Error('Invalid AI response format');
      }
      
      // Ensure quadrant is valid
      const validQuadrants = ['urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important'];
      if (!validQuadrants.includes(parsed.quadrant)) {
        throw new Error('Invalid quadrant in AI response');
      }
      
      return {
        quadrant: parsed.quadrant as EisenhowerQuadrant,
        confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1),
        reasoning: parsed.reasoning,
        suggestedDueDate: parsed.suggestedDueDate ? new Date(parsed.suggestedDueDate) : undefined,
        estimatedTime: parsed.estimatedTime || 60,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        priority: ['high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : 'medium'
      };
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      console.log('Raw response:', response);
      
      // Throw error instead of fallback - 100% AI requirement
      throw new Error('AI_RESPONSE_PARSE_ERROR');
    }
  }

  private static extractDueDate(input: string): Date | undefined {
    const lowerInput = input.toLowerCase();
    
    // Simple date extraction patterns
    const today = new Date();
    
    // English patterns
    if (lowerInput.includes('today')) {
      return today;
    }
    
    if (lowerInput.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    if (lowerInput.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    // Indonesian patterns
    if (lowerInput.includes('hari ini') || lowerInput.includes('sekarang')) {
      return today;
    }
    
    if (lowerInput.includes('besok')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    if (lowerInput.includes('minggu depan') || lowerInput.includes('pekan depan')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    if (lowerInput.includes('bulan depan')) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }
    
    // Extract specific dates (basic pattern)
    const datePattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const match = input.match(datePattern);
    if (match) {
      const [, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return undefined;
  }

  private static estimateTaskTime(input: string): number | undefined {
    const lowerInput = input.toLowerCase();
    
    // English keywords
    if (lowerInput.includes('quick') || lowerInput.includes('simple') || lowerInput.includes('easy')) {
      return 15; // 15 minutes
    }
    
    if (lowerInput.includes('meeting') || lowerInput.includes('call')) {
      return 30; // 30 minutes
    }
    
    if (lowerInput.includes('review') || lowerInput.includes('read')) {
      return 45; // 45 minutes
    }
    
    if (lowerInput.includes('project') || lowerInput.includes('complex') || lowerInput.includes('detailed')) {
      return 120; // 2 hours
    }
    
    // Indonesian keywords
    if (lowerInput.includes('cepat') || lowerInput.includes('sederhana') || lowerInput.includes('mudah') || lowerInput.includes('singkat')) {
      return 15; // 15 minutes
    }
    
    if (lowerInput.includes('rapat') || lowerInput.includes('meeting') || lowerInput.includes('telepon') || lowerInput.includes('call')) {
      return 30; // 30 minutes
    }
    
    if (lowerInput.includes('review') || lowerInput.includes('baca') || lowerInput.includes('tinjau') || lowerInput.includes('periksa')) {
      return 45; // 45 minutes
    }
    
    if (lowerInput.includes('proyek') || lowerInput.includes('kompleks') || lowerInput.includes('detail') || lowerInput.includes('rumit')) {
      return 120; // 2 hours
    }
    
    return 60; // Default 1 hour
  }

  private static extractTags(input: string): string[] {
    const tags: string[] = [];
    const lowerInput = input.toLowerCase();
    
    // Extract hashtags
    const hashtagPattern = /#(\w+)/g;
    const hashtags = input.match(hashtagPattern);
    if (hashtags) {
      tags.push(...hashtags.map(tag => tag.substring(1)));
    }
    
    // English categories
    if (lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('office')) {
      tags.push('work');
    }
    
    if (lowerInput.includes('personal') || lowerInput.includes('home') || lowerInput.includes('family')) {
      tags.push('personal');
    }
    
    if (lowerInput.includes('health') || lowerInput.includes('exercise') || lowerInput.includes('gym')) {
      tags.push('health');
    }
    
    if (lowerInput.includes('finance') || lowerInput.includes('money') || lowerInput.includes('budget')) {
      tags.push('finance');
    }
    
    // Indonesian categories
    if (lowerInput.includes('kerja') || lowerInput.includes('pekerjaan') || lowerInput.includes('kantor') || lowerInput.includes('tugas')) {
      tags.push('kerja');
    }
    
    if (lowerInput.includes('pribadi') || lowerInput.includes('rumah') || lowerInput.includes('keluarga') || lowerInput.includes('personal')) {
      tags.push('pribadi');
    }
    
    if (lowerInput.includes('kesehatan') || lowerInput.includes('olahraga') || lowerInput.includes('gym') || lowerInput.includes('sehat')) {
      tags.push('kesehatan');
    }
    
    if (lowerInput.includes('keuangan') || lowerInput.includes('uang') || lowerInput.includes('budget') || lowerInput.includes('anggaran')) {
      tags.push('keuangan');
    }
    
    if (lowerInput.includes('belajar') || lowerInput.includes('study') || lowerInput.includes('pendidikan') || lowerInput.includes('kursus')) {
      tags.push('belajar');
    }
    
    if (lowerInput.includes('rapat') || lowerInput.includes('meeting') || lowerInput.includes('presentasi')) {
      tags.push('rapat');
    }
    
    return tags;
  }

  private static determinePriority(
    quadrant: EisenhowerQuadrant, 
    confidence: number, 
    dueDate?: Date
  ): 'high' | 'medium' | 'low' {
    if (quadrant === 'urgent-important') {
      return 'high';
    }
    
    if (quadrant === 'not-urgent-important') {
      return dueDate ? 'medium' : 'low';
    }
    
    if (quadrant === 'urgent-not-important') {
      return 'medium';
    }
    
    return 'low';
  }

  // Learn from user corrections
  static async learnFromCorrection(
    originalAnalysis: AIAnalysisResult,
    userCorrection: EisenhowerQuadrant,
    taskContext: string
  ): Promise<void> {
    // In a real implementation, this would update the AI model
    // For now, we'll just log the correction for future improvements
    console.log('AI Learning:', {
      original: originalAnalysis.quadrant,
      correction: userCorrection,
      context: taskContext,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if AI is enabled
  static async isAIEnabled(): Promise<boolean> {
    try {
      const geminiKey = await this.getAPIKey('gemini');
      const openrouterKey = await this.getAPIKey('openrouter');
      return !!(geminiKey || openrouterKey);
    } catch (error) {
      console.error('Error checking AI availability:', error);
      return false;
    }
  }

  // Utility function to clean invalid API keys from storage
  static async cleanInvalidAPIKeys(): Promise<void> {
    try {
      const { default: apiKeyService } = await import('./apiKeyService');
const configs = await apiKeyService.loadAPIConfigs();
      
      if (configs.length === 0) {
        console.log('🧹 No API configs found to clean');
        return;
      }

      let hasChanges = false;
      
      const cleanedConfigs = configs.map((config: any) => {
        if (config.apiKey) {
          const provider = config.name === 'Gemini' ? 'gemini' : 
                          config.name === 'OpenRouter' ? 'openrouter' : null;
          
          if (provider && !apiKeyService.validateAPIKeyFormat(provider, config.apiKey)) {
            console.log(`🧹 Cleaning invalid ${provider} API key:`, config.apiKey.substring(0, 10) + '...');
            hasChanges = true;
            return { ...config, enabled: false, apiKey: '' };
          }
        }
        return config;
      });

      if (hasChanges) {
          await apiKeyService.saveAPIConfigs(cleanedConfigs);
          console.log('✅ Cleaned invalid API keys from storage');
        } else {
          console.log('✅ No invalid API keys found');
        }
    } catch (error) {
      console.error('❌ Error cleaning API keys:', error);
    }
  }

  // Get productivity insights
  static async getProductivityInsights(tasks: Task[]): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (tasks.length === 0) {
      insights.push('Welcome to ClarityFlow! Start by adding your first task.');
      recommendations.push('Try adding a task with keywords like "urgent", "important", or "meeting" to see AI analysis in action.');
      return { insights, recommendations };
    }

    // Analyze task distribution
    const quadrantCounts = {
      'urgent-important': 0,
      'not-urgent-important': 0,
      'urgent-not-important': 0,
      'not-urgent-not-important': 0,
    };

    tasks.forEach(task => {
      quadrantCounts[task.quadrant]++;
    });

    const totalTasks = tasks.length;
    const urgentImportantRatio = quadrantCounts['urgent-important'] / totalTasks;
    const notUrgentImportantRatio = quadrantCounts['not-urgent-important'] / totalTasks;

    if (urgentImportantRatio > 0.3) {
      insights.push('You have many urgent and important tasks. Consider better planning to reduce last-minute urgency.');
      recommendations.push('Try to schedule more tasks in advance to avoid the urgent-important quadrant.');
    }

    if (notUrgentImportantRatio < 0.2) {
      insights.push('You have few scheduled important tasks. This might lead to future urgency.');
      recommendations.push('Focus on planning and scheduling important tasks that aren\'t urgent yet.');
    }

    // Analyze completion patterns
    const completedTasks = tasks.filter(task => task.completed);
    const completionRate = completedTasks.length / totalTasks;

    if (completionRate < 0.7) {
      insights.push('Your task completion rate is below optimal levels.');
      recommendations.push('Consider breaking down large tasks into smaller, more manageable pieces.');
    }

    // Time analysis
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const totalActualTime = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
    
    if (totalActualTime > 0 && totalEstimatedTime > 0) {
      const timeAccuracy = totalActualTime / totalEstimatedTime;
      if (timeAccuracy > 1.5) {
        insights.push('Your time estimates tend to be optimistic. Tasks take longer than expected.');
        recommendations.push('Add buffer time to your estimates to account for unexpected delays.');
      } else if (timeAccuracy < 0.7) {
        insights.push('Your time estimates are conservative. You\'re completing tasks faster than expected.');
        recommendations.push('Consider adjusting your time estimates to be more realistic.');
      }
    }

    return { insights, recommendations };
  }
}