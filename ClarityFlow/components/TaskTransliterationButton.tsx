import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Modal,
  View,
  SafeAreaView,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import TransliterationTool from './TransliterationTool';
import TransliterationService, { TransliterationResult } from '../services/transliterationService';

interface TaskTransliterationButtonProps {
  taskTitle: string;
  taskDescription?: string;
  onTransliterationComplete: (transliteratedTitle: string, transliteratedDescription?: string) => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
}

const TaskTransliterationButton: React.FC<TaskTransliterationButtonProps> = ({
  taskTitle,
  taskDescription,
  onTransliterationComplete,
  style,
  size = 'medium',
}) => {
  const { t, transliterationEnabled } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [isTransliterating, setIsTransliterating] = useState(false);

  const transliterationService = TransliterationService.getInstance();

  const handleQuickTransliterate = async () => {
    if (!transliterationEnabled) {
      Alert.alert(
        t('transliteration.notEnabled'),
        t('transliteration.enableInSettings')
      );
      return;
    }

    setIsTransliterating(true);
    try {
      // Transliterate title
      const titleResult = await transliterationService.transliterate(taskTitle, {
        sourceLanguage: 'auto',
        direction: 'auto',
      });

      let descriptionResult: TransliterationResult | undefined;
      
      // Transliterate description if provided
      if (taskDescription && taskDescription.trim()) {
        descriptionResult = await transliterationService.transliterate(taskDescription, {
          sourceLanguage: 'auto',
          direction: 'auto',
        });
      }

      // Call the completion handler
      onTransliterationComplete(
        titleResult.transliterated,
        descriptionResult?.transliterated
      );

      Alert.alert(
        t('common.success'),
        t('transliteration.taskTransliteratedSuccess')
      );

    } catch (error) {
      console.error('Quick transliteration error:', error);
      Alert.alert(
        t('common.error'),
        t('transliteration.taskTransliterationError')
      );
    } finally {
      setIsTransliterating(false);
    }
  };

  const handleAdvancedTransliterate = () => {
    if (!transliterationEnabled) {
      Alert.alert(
        t('transliteration.notEnabled'),
        t('transliteration.enableInSettings')
      );
      return;
    }
    setShowModal(true);
  };

  const handleModalTransliterationComplete = (result: TransliterationResult) => {
    // For advanced mode, we'll just handle the current text being transliterated
    // The user can copy and paste as needed
    console.log('Advanced transliteration result:', result);
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { padding: 6, fontSize: 12 };
      case 'large':
        return { padding: 12, fontSize: 16 };
      default:
        return { padding: 8, fontSize: 14 };
    }
  };

  const buttonSize = getButtonSize();

  if (!transliterationEnabled) {
    return null; // Don't show button if transliteration is disabled
  }

  return (
    <>
      <View style={[styles.container, style]}>
        {/* Quick Transliterate Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.quickButton,
            { padding: buttonSize.padding },
            isTransliterating && styles.disabledButton,
          ]}
          onPress={handleQuickTransliterate}
          disabled={isTransliterating}
        >
          <Text style={[styles.buttonText, { fontSize: buttonSize.fontSize }]}>
            {isTransliterating ? '⏳' : '🔤'}
          </Text>
        </TouchableOpacity>

        {/* Advanced Transliterate Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.advancedButton,
            { padding: buttonSize.padding },
          ]}
          onPress={handleAdvancedTransliterate}
        >
          <Text style={[styles.buttonText, { fontSize: buttonSize.fontSize }]}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Transliteration Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {t('common.done')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {t('transliteration.advancedTool')}
            </Text>
          </View>
          
          <TransliterationTool
            initialText={taskTitle}
            onTransliterationComplete={handleModalTransliterationComplete}
            style={styles.toolContainer}
          />
          
          <View style={styles.modalFooter}>
            <Text style={styles.footerText}>
              {t('transliteration.copyPasteInstructions')}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 4,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  quickButton: {
    backgroundColor: '#007AFF',
  },
  advancedButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  toolContainer: {
    flex: 1,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TaskTransliterationButton;
