import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { THEME_COLORS } from '../utils/constants';
import { StorageService } from '../services/storage';
import { DEMO_TASKS } from '../utils/demoData';

interface DemoDataButtonProps {
  onDataLoaded: () => void;
}

const DemoDataButton: React.FC<DemoDataButtonProps> = ({ onDataLoaded }) => {
  const loadDemoData = async () => {
    Alert.alert(
      'Load Demo Data',
      'This will add sample tasks to demonstrate the app features. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Demo Data',
          onPress: async () => {
            try {
              // Save demo tasks to storage
              await StorageService.saveTasks(DEMO_TASKS);
              onDataLoaded();
              Alert.alert('Success', 'Demo data loaded successfully!');
            } catch (error) {
              console.error('Error loading demo data:', error);
              Alert.alert('Error', 'Failed to load demo data');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={loadDemoData}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>📋 Load Demo Data</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME_COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: THEME_COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: THEME_COLORS.light,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DemoDataButton; 