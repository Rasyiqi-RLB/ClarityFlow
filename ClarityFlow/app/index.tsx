import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🔵 Index: useEffect triggered - loading:', loading, 'user:', user ? `${user.email} (${user.role})` : 'null');
    if (!loading) {
      checkAuthAndRedirect();
    }
  }, [loading, user]);

  const checkAuthAndRedirect = () => {
    try {
      console.log('🔵 Index: checkAuthAndRedirect called, user:', user);
      
      if (user) {
        // Authenticated users
        if (user.role === 'admin') {
          console.log('🔵 Index: Redirecting admin to dashboard');
          router.replace('/account');
        } else {
          console.log('🔵 Index: Redirecting user to main app');
          router.replace('/(tabs)');
        }
      } else {
        // Allow access to tabs (matrix) without login
        // Individual tabs will handle their own auth requirements
        console.log('🔵 Index: No user found, redirecting to tabs');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('🔵 Index: Auth check error:', error);
      // On error, redirect to login for safety
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>ClarityFlow</Text>
        <Text style={styles.subText}>Memuat aplikasi...</Text>
      </View>
    );
  }

  // This should not be reached as we redirect in useEffect
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Terjadi kesalahan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});