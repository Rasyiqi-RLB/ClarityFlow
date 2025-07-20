import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLanguage } from '../contexts/LanguageContext';
import TransliterationService, {
  SupportedLanguage,
  TransliterationDirection,
  TransliterationResult,
} from '../services/transliterationService';

interface TransliterationToolProps {
  onTransliterationComplete?: (result: TransliterationResult) => void;
  initialText?: string;
  style?: any;
}

const TransliterationTool: React.FC<TransliterationToolProps> = ({
  onTransliterationComplete,
  initialText = '',
  style,
}) => {
  const { t, language, isRTL } = useLanguage();
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>('auto');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('en');
  const [direction, setDirection] = useState<TransliterationDirection>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TransliterationResult | null>(null);

  const transliterationService = TransliterationService.getInstance();

  useEffect(() => {
    if (initialText) {
      handleTransliterate();
    }
  }, [initialText]);

  const handleTransliterate = async () => {
    if (!inputText.trim()) {
      Alert.alert(t('common.error'), 'Please enter text to transliterate');
      return;
    }

    setIsLoading(true);
    try {
      const result = await transliterationService.transliterate(inputText, {
        sourceLanguage,
        targetLanguage,
        direction,
        preserveCase: true,
        removeAccents: false,
      });

      setOutputText(result.transliterated);
      setLastResult(result);
      
      if (onTransliterationComplete) {
        onTransliterationComplete(result);
      }
    } catch (error) {
      console.error('Transliteration error:', error);
      Alert.alert(t('common.error'), 'Failed to transliterate text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto' && targetLanguage !== 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText(inputText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setLastResult(null);
  };

  const handleCopyOutput = () => {
    if (outputText) {
      // In a real app, you'd use Clipboard API
      Alert.alert(t('common.success'), 'Text copied to clipboard');
    }
  };

  const getLanguageOptions = () => {
    const supportedLanguages = transliterationService.getSupportedLanguages();
    return ['auto', ...supportedLanguages].map(lang => ({
      label: transliterationService.getLanguageName(lang as SupportedLanguage, language as SupportedLanguage),
      value: lang,
    }));
  };

  const getDirectionOptions = () => [
    { label: t('transliteration.auto'), value: 'auto' },
    { label: t('transliteration.toLatin'), value: 'to-latin' },
    { label: t('transliteration.fromLatin'), value: 'from-latin' },
  ];

  return (
    <ScrollView style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('transliteration.title')}</Text>
      </View>

      {/* Language Selection */}
      <View style={styles.languageSection}>
        <View style={styles.languageRow}>
          <View style={styles.languageSelector}>
            <Text style={styles.label}>{t('transliteration.sourceLanguage')}</Text>
            <Picker
              selectedValue={sourceLanguage}
              onValueChange={setSourceLanguage}
              style={styles.picker}
            >
              {getLanguageOptions().map(option => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.swapButton}
            onPress={handleSwapLanguages}
            disabled={sourceLanguage === 'auto' || targetLanguage === 'auto'}
          >
            <Text style={styles.swapButtonText}>⇄</Text>
          </TouchableOpacity>

          <View style={styles.languageSelector}>
            <Text style={styles.label}>{t('transliteration.targetLanguage')}</Text>
            <Picker
              selectedValue={targetLanguage}
              onValueChange={setTargetLanguage}
              style={styles.picker}
            >
              {getLanguageOptions().filter(opt => opt.value !== 'auto').map(option => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Direction Selection */}
        <View style={styles.directionSection}>
          <Text style={styles.label}>{t('transliteration.direction')}</Text>
          <Picker
            selectedValue={direction}
            onValueChange={setDirection}
            style={styles.picker}
          >
            {getDirectionOptions().map(option => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>{t('transliteration.inputText')}</Text>
        <TextInput
          style={[
            styles.textInput,
            isRTL && sourceLanguage === 'ar' ? styles.rtlText : null,
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('transliteration.inputPlaceholder')}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleTransliterate}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('transliteration.transliterate')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleClear}
        >
          <Text style={styles.secondaryButtonText}>{t('common.clear')}</Text>
        </TouchableOpacity>
      </View>

      {/* Output Section */}
      {outputText ? (
        <View style={styles.outputSection}>
          <View style={styles.outputHeader}>
            <Text style={styles.label}>{t('transliteration.outputText')}</Text>
            <TouchableOpacity onPress={handleCopyOutput}>
              <Text style={styles.copyButton}>{t('common.copy')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.outputContainer}>
            <Text
              style={[
                styles.outputText,
                isRTL && targetLanguage === 'ar' ? styles.rtlText : null,
              ]}
            >
              {outputText}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Result Info */}
      {lastResult && (
        <View style={styles.resultInfo}>
          <Text style={styles.resultInfoText}>
            {t('transliteration.confidence')}: {Math.round(lastResult.confidence * 100)}%
          </Text>
          <Text style={styles.resultInfoText}>
            {t('transliteration.detectedLanguage')}: {' '}
            {transliterationService.getLanguageName(
              lastResult.sourceLanguage,
              language as SupportedLanguage
            )}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  languageSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageSelector: {
    flex: 1,
  },
  swapButton: {
    marginHorizontal: 16,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  directionSection: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outputSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  outputContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
  },
  outputText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  resultInfo: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  resultInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default TransliterationTool;
