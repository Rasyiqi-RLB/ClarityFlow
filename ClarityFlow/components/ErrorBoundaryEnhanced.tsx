import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryEnhanced extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error untuk debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler jika ada
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Handle specific errors
    if (error.message.includes('RNGoogleSignin')) {
      Alert.alert(
        'Authentication Error',
        'Google Sign-In tidak tersedia di Expo Go. Silakan gunakan development build atau web version.',
        [
          { text: 'OK', onPress: () => this.handleRetry() }
        ]
      );
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI jika disediakan
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>Oops! Something went wrong</ThemedText>
          
          {this.state.error?.message.includes('RNGoogleSignin') ? (
            <View>
              <ThemedText style={styles.message}>
                Google Sign-In tidak tersedia di Expo Go.
              </ThemedText>
              <ThemedText style={styles.suggestion}>
                Gunakan development build atau akses melalui web browser.
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </ThemedText>
          )}

          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>

          {__DEV__ && this.state.errorInfo && (
            <View style={styles.debugInfo}>
              <ThemedText style={styles.debugTitle}>Debug Info:</ThemedText>
              <ThemedText style={styles.debugText}>
                {this.state.errorInfo.componentStack}
              </ThemedText>
            </View>
          )}
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  suggestion: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundaryEnhanced;