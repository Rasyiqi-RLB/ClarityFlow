import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface InteractionGuardProps {
  children: ReactNode;
  onInteraction?: () => void;
  showAlert?: boolean;
  alertTitle?: string;
  alertMessage?: string;
}

/**
 * InteractionGuard - Komponen yang memungkinkan konten dilihat tanpa login,
 * tapi akan redirect ke login ketika user berinteraksi
 */
export function InteractionGuard({ 
  children, 
  onInteraction,
  showAlert = true,
  alertTitle = "Login Diperlukan",
  alertMessage = "Silakan login terlebih dahulu untuk berinteraksi dengan fitur ini"
}: InteractionGuardProps) {
  const { isAuthenticated } = useAuth();

  const handleInteraction = () => {
    if (!isAuthenticated) {
      if (onInteraction) {
        onInteraction();
        return;
      }

      if (showAlert) {
        if (Platform.OS === 'web') {
          const confirmed = window.confirm(`${alertTitle}\n\n${alertMessage}\n\nApakah Anda ingin login sekarang?`);
          if (confirmed) {
            router.push('/(tabs)/account');
          }
        } else {
          Alert.alert(
            alertTitle,
            alertMessage,
            [
              { text: 'Batal', style: 'cancel' },
              { 
                text: 'Login', 
                onPress: () => router.push('/(tabs)/account')
              }
            ]
          );
        }
      } else {
        router.push('/(tabs)/account');
      }
      return;
    }
  };

  // Jika sudah login, return children tanpa modifikasi
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Jika belum login, wrap children dengan handler interaction
  return (
    <>
      {children}
    </>
  );
}

export default InteractionGuard;