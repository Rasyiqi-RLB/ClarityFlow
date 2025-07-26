import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { ThemedText } from './ThemedText';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  overlay?: boolean;
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'large', 
  text = 'Memuat...', 
  overlay = false,
  color 
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const spinnerColor = color || (isDark ? '#ffffff' : '#007AFF');
  
  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <View style={[styles.content, overlay && styles.overlayContent]}>
        <ActivityIndicator 
          size={size} 
          color={spinnerColor}
          style={styles.spinner}
        />
        {text && (
          <ThemedText style={styles.text}>
            {text}
          </ThemedText>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        {content}
      </View>
    );
  }

  return content;
}



const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
});