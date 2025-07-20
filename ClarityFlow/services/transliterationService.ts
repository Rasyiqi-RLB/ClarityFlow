import sindreTransliterate from '@sindresorhus/transliterate';
// @ts-ignore - No type definitions available
import { transliterate as arabicTransliterate } from 'arabic-transliterate';
// @ts-ignore - No type definitions available
import { pinyinify } from 'chinese-to-pinyin';
import { slugify, transliterate } from 'transliteration';

// Supported languages for transliteration
export type SupportedLanguage = 'id' | 'en' | 'ar' | 'zh' | 'auto';

// Transliteration direction
export type TransliterationDirection = 'to-latin' | 'from-latin' | 'auto';

// Transliteration options
export interface TransliterationOptions {
  sourceLanguage: SupportedLanguage;
  targetLanguage?: SupportedLanguage;
  direction: TransliterationDirection;
  preserveCase?: boolean;
  removeAccents?: boolean;
  customRules?: Record<string, string>;
}

// Transliteration result
export interface TransliterationResult {
  original: string;
  transliterated: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  direction: TransliterationDirection;
  confidence: number;
  alternatives?: string[];
}

// Language detection patterns
const LANGUAGE_PATTERNS = {
  // Indonesian patterns
  id: {
    patterns: [
      /\b(dan|atau|dengan|untuk|dari|ke|di|pada|dalam|yang|ini|itu)\b/gi,
      /\b(saya|aku|kamu|dia|mereka|kita|kami)\b/gi,
      /\b(buat|bikin|lakukan|kerjakan|selesaikan|tugas|pekerjaan)\b/gi,
      /\b(hari|minggu|bulan|tahun|jam|menit)\b/gi,
      /\b(penting|urgent|mendesak|segera|cepat)\b/gi,
    ],
    weight: 1,
  },
  // Arabic patterns
  ar: {
    patterns: [
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
    ],
    weight: 2,
  },
  // Chinese patterns
  zh: {
    patterns: [
      /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/g,
    ],
    weight: 2,
  },
  // English patterns
  en: {
    patterns: [
      /\b(the|and|or|with|for|from|to|in|on|at|that|this)\b/gi,
      /\b(i|you|he|she|they|we|us)\b/gi,
      /\b(make|create|do|work|complete|task|job)\b/gi,
      /\b(day|week|month|year|hour|minute)\b/gi,
      /\b(important|urgent|quick|fast)\b/gi,
    ],
    weight: 1,
  },
};

class TransliterationService {
  private static instance: TransliterationService;

  private constructor() {}

  public static getInstance(): TransliterationService {
    if (!TransliterationService.instance) {
      TransliterationService.instance = new TransliterationService();
    }
    return TransliterationService.instance;
  }

  /**
   * Detect the language of input text
   */
  public detectLanguage(text: string): SupportedLanguage {
    const scores: Record<string, number> = {
      id: 0,
      ar: 0,
      zh: 0,
      en: 0,
    };

    // Calculate scores for each language
    Object.entries(LANGUAGE_PATTERNS).forEach(([lang, config]) => {
      config.patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          scores[lang] += matches.length * config.weight;
        }
      });
    });

    // Find the language with highest score
    const detectedLang = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0] as SupportedLanguage;

    // Return 'en' as default if no clear detection
    return scores[detectedLang] > 0 ? detectedLang : 'en';
  }

  /**
   * Main transliteration method
   */
  public async transliterate(
    text: string, 
    options: Partial<TransliterationOptions> = {}
  ): Promise<TransliterationResult> {
    const defaultOptions: TransliterationOptions = {
      sourceLanguage: 'auto',
      direction: 'auto',
      preserveCase: true,
      removeAccents: false,
      ...options,
    };

    // Auto-detect source language if needed
    const sourceLanguage = defaultOptions.sourceLanguage === 'auto' 
      ? this.detectLanguage(text) 
      : defaultOptions.sourceLanguage;

    // Determine target language and direction
    const { targetLanguage, direction } = this.determineTransliterationTarget(
      sourceLanguage, 
      defaultOptions.direction
    );

    let result: string;
    let confidence = 0.8;
    let alternatives: string[] = [];

    try {
      switch (sourceLanguage) {
        case 'ar':
          result = await this.transliterateArabic(text, direction);
          break;
        case 'zh':
          result = await this.transliterateChinese(text, direction);
          break;
        case 'id':
          result = await this.transliterateIndonesian(text, direction);
          break;
        case 'en':
        default:
          result = await this.transliterateGeneric(text, targetLanguage);
          break;
      }

      // Apply post-processing options
      if (defaultOptions.removeAccents) {
        result = this.removeAccents(result);
      }

      if (!defaultOptions.preserveCase) {
        result = result.toLowerCase();
      }

      // Apply custom rules if provided
      if (defaultOptions.customRules) {
        result = this.applyCustomRules(result, defaultOptions.customRules);
      }

    } catch (error) {
      console.error('Transliteration error:', error);
      result = text; // Fallback to original text
      confidence = 0.1;
    }

    return {
      original: text,
      transliterated: result,
      sourceLanguage,
      targetLanguage,
      direction,
      confidence,
      alternatives,
    };
  }

  /**
   * Determine transliteration target and direction
   */
  private determineTransliterationTarget(
    sourceLanguage: SupportedLanguage,
    direction: TransliterationDirection
  ): { targetLanguage: SupportedLanguage; direction: TransliterationDirection } {
    if (direction !== 'auto') {
      const targetLanguage = direction === 'to-latin' ? 'en' : sourceLanguage;
      return { targetLanguage, direction };
    }

    // Auto-determine direction based on source language
    if (sourceLanguage === 'en') {
      return { targetLanguage: 'id', direction: 'from-latin' };
    } else {
      return { targetLanguage: 'en', direction: 'to-latin' };
    }
  }

  /**
   * Transliterate Arabic text
   */
  private async transliterateArabic(
    text: string, 
    direction: TransliterationDirection
  ): Promise<string> {
    try {
      if (direction === 'to-latin') {
        // Arabic to Latin
        return arabicTransliterate(text);
      } else {
        // Latin to Arabic (basic implementation)
        return this.latinToArabic(text);
      }
    } catch (error) {
      console.error('Arabic transliteration error:', error);
      return sindreTransliterate(text);
    }
  }

  /**
   * Transliterate Chinese text
   */
  private async transliterateChinese(
    text: string,
    direction: TransliterationDirection
  ): Promise<string> {
    try {
      if (direction === 'to-latin') {
        // Chinese to Pinyin
        const pinyinResult = pinyinify(text);
        return pinyinResult;
      } else {
        // Latin to Chinese (not implemented, return as-is)
        return text;
      }
    } catch (error) {
      console.error('Chinese transliteration error:', error);
      return sindreTransliterate(text);
    }
  }

  /**
   * Transliterate Indonesian text
   */
  private async transliterateIndonesian(
    text: string, 
    direction: TransliterationDirection
  ): Promise<string> {
    try {
      if (direction === 'to-latin') {
        // Indonesian is already in Latin script, apply basic normalization
        return transliterate(text);
      } else {
        // Latin to Indonesian (basic implementation)
        return this.normalizeIndonesian(text);
      }
    } catch (error) {
      console.error('Indonesian transliteration error:', error);
      return text;
    }
  }

  /**
   * Generic transliteration using sindre's transliterate
   */
  private async transliterateGeneric(
    text: string,
    _targetLanguage?: SupportedLanguage
  ): Promise<string> {
    try {
      return sindreTransliterate(text);
    } catch (error) {
      console.error('Generic transliteration error:', error);
      return transliterate(text);
    }
  }

  /**
   * Basic Latin to Arabic transliteration
   */
  private latinToArabic(text: string): string {
    const arabicMap: Record<string, string> = {
      'a': 'ا', 'b': 'ب', 't': 'ت', 'th': 'ث', 'j': 'ج', 'H': 'ح',
      'kh': 'خ', 'd': 'د', 'dh': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س',
      'sh': 'ش', 'S': 'ص', 'D': 'ض', 'T': 'ط', 'Z': 'ظ', '\'': 'ع',
      'gh': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل', 'm': 'م',
      'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي'
    };

    let result = text.toLowerCase();

    // Replace longer patterns first
    Object.entries(arabicMap)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([latin, arabic]) => {
        result = result.replace(new RegExp(latin, 'g'), arabic);
      });

    return result;
  }

  /**
   * Normalize Indonesian text
   */
  private normalizeIndonesian(text: string): string {
    // Indonesian normalization rules
    const indonesianMap: Record<string, string> = {
      'oe': 'u',
      'dj': 'j',
      'tj': 'c',
      'nj': 'ny',
      'sj': 'sy',
      'ch': 'kh',
    };

    let result = text.toLowerCase();

    Object.entries(indonesianMap).forEach(([old, newChar]) => {
      result = result.replace(new RegExp(old, 'g'), newChar);
    });

    return result;
  }

  /**
   * Remove accents from text
   */
  private removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Apply custom transliteration rules
   */
  private applyCustomRules(text: string, rules: Record<string, string>): string {
    let result = text;

    Object.entries(rules)
      .sort((a, b) => b[0].length - a[0].length) // Apply longer patterns first
      .forEach(([pattern, replacement]) => {
        result = result.replace(new RegExp(pattern, 'g'), replacement);
      });

    return result;
  }

  /**
   * Batch transliteration for multiple texts
   */
  public async transliterateBatch(
    texts: string[],
    options: Partial<TransliterationOptions> = {}
  ): Promise<TransliterationResult[]> {
    const results: TransliterationResult[] = [];

    for (const text of texts) {
      try {
        const result = await this.transliterate(text, options);
        results.push(result);
      } catch (error) {
        console.error(`Batch transliteration error for text: ${text}`, error);
        results.push({
          original: text,
          transliterated: text,
          sourceLanguage: 'en',
          targetLanguage: 'en',
          direction: 'auto',
          confidence: 0.1,
        });
      }
    }

    return results;
  }

  /**
   * Create a slug from transliterated text
   */
  public async createSlug(
    text: string,
    options: Partial<TransliterationOptions> = {}
  ): Promise<string> {
    const result = await this.transliterate(text, {
      ...options,
      removeAccents: true,
      preserveCase: false,
    });

    return slugify(result.transliterated, {
      lowercase: true,
      separator: '-',
      trim: true,
    });
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): SupportedLanguage[] {
    return ['id', 'en', 'ar', 'zh'];
  }

  /**
   * Check if a language is supported
   */
  public isLanguageSupported(language: string): boolean {
    return this.getSupportedLanguages().includes(language as SupportedLanguage);
  }

  /**
   * Get language name in different languages
   */
  public getLanguageName(
    language: SupportedLanguage,
    displayLanguage: SupportedLanguage = 'en'
  ): string {
    const languageNames: Record<SupportedLanguage, Record<SupportedLanguage, string>> = {
      id: {
        id: 'Bahasa Indonesia',
        en: 'Indonesian',
        ar: 'الإندونيسية',
        zh: '印尼语',
        auto: 'Otomatis',
      },
      en: {
        id: 'Bahasa Inggris',
        en: 'English',
        ar: 'الإنجليزية',
        zh: '英语',
        auto: 'Auto',
      },
      ar: {
        id: 'Bahasa Arab',
        en: 'Arabic',
        ar: 'العربية',
        zh: '阿拉伯语',
        auto: 'تلقائي',
      },
      zh: {
        id: 'Bahasa China',
        en: 'Chinese',
        ar: 'الصينية',
        zh: '中文',
        auto: '自动',
      },
      auto: {
        id: 'Otomatis',
        en: 'Auto',
        ar: 'تلقائي',
        zh: '自动',
        auto: 'Auto',
      },
    };

    return languageNames[language]?.[displayLanguage] || language;
  }
}

export default TransliterationService;
