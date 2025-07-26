import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useNotifications } from '../contexts/NotificationContext';

// Interface untuk notifikasi yang sebenarnya
interface RealNotification {
  id: string;
  title: string;
  body: string;
  type: 'task_reminder' | 'deadline_alert' | 'achievement' | 'weekly_update';
  timestamp: string;
  read: boolean;
  data?: any;
}

// Interface untuk notifikasi yang ditampilkan (kompatibel dengan UI yang ada)
interface DisplayNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  color: string;
  bgColor: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications: contextNotifications,
    loading,
    markAsRead,
    markAllAsRead: contextMarkAllAsRead,
    clearAllNotifications,
    removeNotification
  } = useNotifications();

  // Fungsi untuk mengkonversi notifikasi real ke format display
  const convertToDisplayNotification = (realNotification: RealNotification, index: number): DisplayNotification => {
    // Mapping warna berdasarkan tipe
    const typeConfig = {
      task_reminder: { color: '#3B82F6', bgColor: '#EFF6FF' },
      deadline_alert: { color: '#F59E0B', bgColor: '#FFFBEB' },
      achievement: { color: '#10B981', bgColor: '#ECFDF5' },
      weekly_update: { color: '#8B5CF6', bgColor: '#F5F3FF' }
    };

    const config = typeConfig[realNotification.type] || typeConfig.task_reminder;

    // Format waktu relatif
    const formatRelativeTime = (timestamp: string): string => {
      const now = new Date();
      const notificationTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Baru saja';
      if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} hari yang lalu`;

      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} minggu yang lalu`;
    };

    // Mapping title berdasarkan tipe
    const getDisplayTitle = (type: string): string => {
      switch (type) {
        case 'task_reminder': return 'Task Reminder';
        case 'deadline_alert': return 'Deadline Alert';
        case 'achievement': return 'Achievement';
        case 'weekly_update': return 'Weekly Update';
        default: return 'Notification';
      }
    };

    return {
      id: parseInt(realNotification.id) || index + 1,
      type: realNotification.type,
      title: getDisplayTitle(realNotification.type),
      message: realNotification.body,
      time: formatRelativeTime(realNotification.timestamp),
      isRead: realNotification.read,
      color: config.color,
      bgColor: config.bgColor
    };
  };

  // Konversi notifikasi dari context ke format display
  const displayNotifications = contextNotifications.map((notification, index) =>
    convertToDisplayNotification(notification, index)
  );



  const handleBackPress = () => {
    // Cek apakah bisa kembali, jika tidak maka navigasi ke home
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Gunakan fungsi dari context
  const handleMarkAllAsRead = () => {
    contextMarkAllAsRead();
  };

  const handleDeleteAll = () => {
    // Konfirmasi sebelum menghapus semua notifikasi
    if (displayNotifications.length === 0) {
      return; // Tidak ada notifikasi untuk dihapus
    }

    // Untuk web, gunakan confirm dialog
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Apakah Anda yakin ingin menghapus semua notifikasi?');
      if (confirmed) {
        clearAllNotifications();
      }
    } else {
      // Fallback untuk mobile atau jika confirm tidak tersedia
      clearAllNotifications();
    }
  };

  const handleDeleteNotification = (notificationId: number) => {
    // Cari notifikasi berdasarkan ID dan hapus menggunakan context
    const notification = contextNotifications.find(n => parseInt(n.id) === notificationId);
    if (notification) {
      removeNotification(notification.id);
    }
  };

  const handleNotificationPress = (notification: DisplayNotification) => {
    // Tandai notifikasi sebagai sudah dibaca ketika diklik menggunakan context
    if (!notification.isRead) {
      const realNotification = contextNotifications.find(n => parseInt(n.id) === notification.id);
      if (realNotification) {
        markAsRead(realNotification.id);
      }
    }

    // TODO: Navigasi ke detail task atau aksi lainnya
    console.log('Notification pressed:', notification.id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <IconSymbol name="chevron.left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          {displayNotifications.filter(n => !n.isRead).length > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{displayNotifications.filter(n => !n.isRead).length} baru</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <IconSymbol name="checkmark.circle" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMarkAllAsRead}
        >
          <IconSymbol name="checkmark.circle.fill" size={16} color="#2563EB" />
          <Text style={styles.actionButtonText}>Tandai Semua Dibaca</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteAll}
        >
          <IconSymbol name="trash" size={16} color="#DC2626" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Hapus Semua</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <IconSymbol name="bell" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Memuat notifikasi...</Text>
            <Text style={styles.emptyMessage}>
              Sedang mengambil notifikasi terbaru Anda.
            </Text>
          </View>
        ) : displayNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="bell" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
            <Text style={styles.emptyMessage}>
              Notifikasi Anda akan muncul di sini ketika ada update terbaru.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {displayNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  { backgroundColor: notification.bgColor },
                  !notification.isRead && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View 
                  style={[
                    styles.notificationIndicator,
                    { backgroundColor: notification.color }
                  ]} 
                />
                
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>BARU</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>

                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    style={styles.deleteNotificationButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <IconSymbol name="trash" size={16} color="#DC2626" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.notificationAction}>
                    <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerAction: {
    padding: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    padding: 16,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadNotification: {
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationAction: {
    padding: 4,
    justifyContent: 'center',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteNotificationButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
