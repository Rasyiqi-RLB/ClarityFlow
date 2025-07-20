import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { signInWithGoogle, user, isAuthenticated } = useAuth();

  // Handle redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔵 Login: User authenticated, checking role for redirect');
      if (user.role === 'admin') {
        console.log('🔵 Login: Admin user detected, redirecting to admin dashboard');
        router.replace('/account');
      } else {
        console.log('🔵 Login: Regular user detected, redirecting to main app');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      console.log('🔵 Login: Starting Google Sign-In');
      await signInWithGoogle();
      console.log('🔵 Login: Google Sign-In successful, user will be redirected by useEffect');
      // Redirect will be handled by useEffect when user state updates
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      if (typeof window !== 'undefined') {
        alert('Login Gagal: ' + (error.message || 'Google Sign-In gagal'));
      } else {
        Alert.alert('Login Gagal', error.message || 'Google Sign-In gagal');
      }
    } finally {
      setGoogleLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ClarityFlow</Text>
            <Text style={styles.subtitle}>Masuk ke akun Anda</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Google Sign-In Button */}
            <TouchableOpacity 
              style={[styles.googleButton, googleLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Masuk dengan Google...' : '🔍 Masuk dengan Google'}
              </Text>
            </TouchableOpacity>
          </View>




        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});