import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook untuk auto-refresh auth state ketika screen difokuskan
 * Memastikan status autentikasi selalu up-to-date
 */
export function useAuthRefresh() {
  const { refreshUser, loading } = useAuth();

  useFocusEffect(
    useCallback(() => {
      // Hanya refresh jika tidak sedang loading
      if (!loading) {
        console.log('🔄 useAuthRefresh: Screen focused, refreshing auth state...');
        refreshUser();
      }
    }, [refreshUser, loading])
  );
}