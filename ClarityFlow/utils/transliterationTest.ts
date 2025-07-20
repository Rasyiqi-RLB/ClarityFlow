import TransliterationService from '../services/transliterationService';

/**
 * Simple test function to verify transliteration service works
 */
export async function testTransliterationService() {
  const service = TransliterationService.getInstance();
  
  console.log('🧪 Testing Transliteration Service...');
  
  try {
    // Test language detection
    console.log('\n📍 Testing Language Detection:');
    const indonesianText = 'Saya ingin membuat tugas baru untuk hari ini';
    const arabicText = 'مرحبا بك في التطبيق';
    const chineseText = '欢迎使用应用程序';
    const englishText = 'Hello world, this is a test';
    
    console.log(`Indonesian: "${indonesianText}" -> ${service.detectLanguage(indonesianText)}`);
    console.log(`Arabic: "${arabicText}" -> ${service.detectLanguage(arabicText)}`);
    console.log(`Chinese: "${chineseText}" -> ${service.detectLanguage(chineseText)}`);
    console.log(`English: "${englishText}" -> ${service.detectLanguage(englishText)}`);
    
    // Test basic transliteration
    console.log('\n🔤 Testing Basic Transliteration:');
    
    // Indonesian normalization
    const indonesianResult = await service.transliterate('Soekarno dan Soeharto', {
      sourceLanguage: 'id',
      direction: 'to-latin'
    });
    console.log(`Indonesian normalization: "${indonesianResult.original}" -> "${indonesianResult.transliterated}"`);
    
    // Arabic to Latin
    const arabicResult = await service.transliterate('مرحبا', {
      sourceLanguage: 'ar',
      direction: 'to-latin'
    });
    console.log(`Arabic to Latin: "${arabicResult.original}" -> "${arabicResult.transliterated}"`);
    
    // Chinese to Pinyin
    const chineseResult = await service.transliterate('你好', {
      sourceLanguage: 'zh',
      direction: 'to-latin'
    });
    console.log(`Chinese to Pinyin: "${chineseResult.original}" -> "${chineseResult.transliterated}"`);
    
    // Test auto-detection
    console.log('\n🤖 Testing Auto-Detection:');
    const autoResult = await service.transliterate('مرحبا بالعالم', {
      sourceLanguage: 'auto',
      direction: 'auto'
    });
    console.log(`Auto-detected: "${autoResult.original}" -> "${autoResult.transliterated}" (${autoResult.sourceLanguage})`);
    
    // Test slug generation
    console.log('\n🔗 Testing Slug Generation:');
    const slug1 = await service.createSlug('مرحبا بالعالم');
    const slug2 = await service.createSlug('你好世界');
    const slug3 = await service.createSlug('Soekarno dan Soeharto');
    
    console.log(`Arabic slug: "مرحبا بالعالم" -> "${slug1}"`);
    console.log(`Chinese slug: "你好世界" -> "${slug2}"`);
    console.log(`Indonesian slug: "Soekarno dan Soeharto" -> "${slug3}"`);
    
    // Test batch processing
    console.log('\n📦 Testing Batch Processing:');
    const batchResults = await service.transliterateBatch([
      'مرحبا',
      '你好',
      'Hello',
      'Soekarno'
    ]);
    
    batchResults.forEach((result, index) => {
      console.log(`Batch ${index + 1}: "${result.original}" -> "${result.transliterated}" (${result.sourceLanguage})`);
    });
    
    // Test supported languages
    console.log('\n🌍 Supported Languages:');
    const supportedLanguages = service.getSupportedLanguages();
    supportedLanguages.forEach(lang => {
      const name = service.getLanguageName(lang, 'en');
      console.log(`${lang}: ${name}`);
    });
    
    console.log('\n✅ All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Test specific transliteration scenarios
 */
export async function testSpecificScenarios() {
  const service = TransliterationService.getInstance();
  
  console.log('\n🎯 Testing Specific Scenarios...');
  
  try {
    // Test task-like inputs
    const taskScenarios = [
      'Rapat dengan klien penting besok pagi',
      'مراجعة التقرير الشهري',
      '完成项目文档',
      'Meeting with important client tomorrow morning',
      'Soekarno memimpin Indonesia'
    ];
    
    for (const scenario of taskScenarios) {
      const result = await service.transliterate(scenario, {
        sourceLanguage: 'auto',
        direction: 'auto'
      });
      
      console.log(`Task: "${scenario}"`);
      console.log(`  -> "${result.transliterated}" (${result.sourceLanguage}, confidence: ${result.confidence})`);
      console.log('');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Scenario test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTransliterationTests() {
  console.log('🚀 Starting Transliteration Tests...\n');
  
  const basicTestResult = await testTransliterationService();
  const scenarioTestResult = await testSpecificScenarios();
  
  if (basicTestResult && scenarioTestResult) {
    console.log('🎉 All transliteration tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
  
  return basicTestResult && scenarioTestResult;
}
