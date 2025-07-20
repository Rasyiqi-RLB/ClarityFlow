import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { User, userManagementService, UserStats } from '../services/userManagementService';

interface UserManagementProps {
  visible: boolean;
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ visible, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'banned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Debug logging
  console.log('👥 UserManagement component rendered, visible:', visible);
  console.log('👥 userManagementService available:', !!userManagementService);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        loadUsers(),
        userManagementService.getUserStats()
      ]);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      let usersData: User[];
      console.log('📊 Loading users for tab:', selectedTab);
      switch (selectedTab) {
        case 'active':
          usersData = await userManagementService.getActiveUsers();
          break;
        case 'banned':
          usersData = await userManagementService.getBannedUsers();
          break;
        default:
          usersData = await userManagementService.getAllUsers();
      }
      console.log('📊 Loaded users:', usersData.length, 'users');
      console.log('📊 Users data:', usersData.map(u => ({ name: u.displayName, role: u.role, banned: u.isBanned })));
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('📊 Error loading users:', error);
      throw error;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleFixActiveStatus = async () => {
    try {
      setLoading(true);
      await userManagementService.fixUserActiveStatus();
      Alert.alert('Berhasil', 'Status aktif user telah diperbaiki');
      await loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Gagal memperbaiki status aktif user');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab: 'all' | 'active' | 'banned') => {
    setSelectedTab(tab);
    setLoading(true);
    try {
      await loadUsers();
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = (user: User) => {
    console.log('🔨 Ban button clicked for user:', user.displayName, user.id);

    if (Platform.OS === 'web') {
      // Use browser confirm for web
      const confirmed = window.confirm(`Apakah Anda yakin ingin memban ${user.displayName}?`);
      if (confirmed) {
        banUser(user.id);
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Ban User',
        `Apakah Anda yakin ingin memban ${user.displayName}?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Ban',
            style: 'destructive',
            onPress: () => banUser(user.id)
          }
        ]
      );
    }
  };

  const banUser = async (userId: string) => {
    try {
      console.log('🔨 Starting ban process for user:', userId);
      await userManagementService.banUser(userId, 'Banned by admin');
      console.log('🔨 Ban successful for user:', userId);

      if (Platform.OS === 'web') {
        alert('User berhasil dibanned');
      } else {
        Alert.alert('Berhasil', 'User berhasil dibanned');
      }
      loadUsers();
    } catch (error) {
      console.error('🔨 Failed to ban user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';

      if (Platform.OS === 'web') {
        alert(`Gagal memban user: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Gagal memban user: ${errorMessage}`);
      }
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      console.log('🔓 Starting unban process for user:', userId);
      await userManagementService.unbanUser(userId);
      console.log('🔓 Unban successful for user:', userId);

      if (Platform.OS === 'web') {
        alert('User berhasil di-unban');
      } else {
        Alert.alert('Berhasil', 'User berhasil di-unban');
      }
      loadUsers();
    } catch (error) {
      console.error('🔓 Failed to unban user:', error);

      if (Platform.OS === 'web') {
        alert('Gagal meng-unban user');
      } else {
        Alert.alert('Error', 'Gagal meng-unban user');
      }
    }
  };

  const handleChangeRole = (user: User) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    console.log('👑 Role button clicked for user:', user.displayName, 'current role:', user.role, 'new role:', newRole);

    if (Platform.OS === 'web') {
      // Use browser confirm for web
      const confirmed = window.confirm(`Ubah role ${user.displayName} menjadi ${newRole}?`);
      if (confirmed) {
        changeUserRole(user.id, newRole);
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Ubah Role',
        `Ubah role ${user.displayName} menjadi ${newRole}?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Ubah',
            onPress: () => changeUserRole(user.id, newRole)
          }
        ]
      );
    }
  };

  const changeUserRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      console.log('👑 Starting role change for user:', userId, 'to role:', newRole);
      await userManagementService.updateUserRole(userId, newRole);
      console.log('👑 Role change successful for user:', userId);

      if (Platform.OS === 'web') {
        alert('Role user berhasil diubah');
      } else {
        Alert.alert('Berhasil', 'Role user berhasil diubah');
      }
      loadUsers();
    } catch (error) {
      console.error('👑 Failed to change user role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';

      if (Platform.OS === 'web') {
        alert(`Gagal mengubah role user: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Gagal mengubah role user: ${errorMessage}`);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        setSelectedUser(item);
        setShowUserDetail(true);
      }}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <Text style={[styles.userRole, item.role === 'admin' && styles.adminRole]}>
            {(item.role || 'user').toUpperCase()}
          </Text>
          <Text style={[styles.userStatus, item.isActive && styles.activeStatus]}>
            {item.isActive ? 'AKTIF' : 'OFFLINE'}
          </Text>
          {item.isBanned && <Text style={styles.bannedStatus}>BANNED</Text>}
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('👑 Role button pressed for:', item.displayName);
            handleChangeRole(item);
          }}
        >
          <Text style={styles.actionButtonText}>Role</Text>
        </TouchableOpacity>
        {!item.isBanned ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.banButton]}
            onPress={() => {
              console.log('🔨 Ban button pressed for:', item.displayName);
              handleBanUser(item);
            }}
          >
            <Text style={styles.actionButtonText}>Ban</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.unbanButton]}
            onPress={() => {
              console.log('🔓 Unban button pressed for:', item.displayName);
              handleUnbanUser(item.id);
            }}
          >
            <Text style={styles.actionButtonText}>Unban</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Statistik Pengguna</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.activeToday}</Text>
            <Text style={styles.statLabel}>Aktif Hari Ini</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.bannedUsers}</Text>
            <Text style={styles.statLabel}>Banned</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>👥 Manajemen Pengguna</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {renderStats()}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.fixButton}
            onPress={handleFixActiveStatus}
            disabled={loading}
          >
            <Text style={styles.fixButtonText}>🔧 Fix Status</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
              Semua ({stats?.totalUsers || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
            onPress={() => handleTabChange('active')}
          >
            <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
              Aktif ({stats?.activeToday || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'banned' && styles.activeTab]}
            onPress={() => handleTabChange('banned')}
          >
            <Text style={[styles.tabText, selectedTab === 'banned' && styles.activeTabText]}>
              Banned ({stats?.bannedUsers || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Memuat data...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.userList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* User Detail Modal */}
        <Modal visible={showUserDetail} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.userDetailModal}>
              {selectedUser && (
                <>
                  <Text style={styles.userDetailTitle}>Detail Pengguna</Text>
                  <Text style={styles.userDetailName}>{selectedUser.displayName}</Text>
                  <Text style={styles.userDetailEmail}>{selectedUser.email}</Text>
                  <View style={styles.userDetailInfo}>
                    <Text>Role: {selectedUser.role}</Text>
                    <Text>Status: {selectedUser.isActive ? 'Aktif' : 'Offline'}</Text>
                    <Text>Login terakhir: {selectedUser.lastLoginAt ? selectedUser.lastLoginAt.toLocaleDateString() : 'Never'}</Text>
                    <Text>Bergabung: {selectedUser.createdAt ? selectedUser.createdAt.toLocaleDateString() : 'Unknown'}</Text>
                    <Text>Total login: {selectedUser.loginCount}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeDetailButton}
                    onPress={() => setShowUserDetail(false)}
                  >
                    <Text style={styles.closeDetailButtonText}>Tutup</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
  },
  fixButton: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#64748b',
  },
  userList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  userMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  userRole: {
    fontSize: 9,
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 6,
  },
  adminRole: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  userStatus: {
    fontSize: 9,
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 6,
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  bannedStatus: {
    fontSize: 9,
    backgroundColor: '#fecaca',
    color: '#dc2626',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    marginLeft: 6,
  },
  banButton: {
    backgroundColor: '#dc2626',
  },
  unbanButton: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetailModal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    minWidth: 280,
  },
  userDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  userDetailName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userDetailEmail: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  userDetailInfo: {
    marginBottom: 16,
  },
  closeDetailButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeDetailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UserManagement;