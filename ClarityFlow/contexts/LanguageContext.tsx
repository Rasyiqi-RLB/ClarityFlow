import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Language = 'id' | 'en' | 'ms' | 'ar' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isRTL: boolean;
  transliterationEnabled: boolean;
  setTransliterationEnabled: (enabled: boolean) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.tasks': 'Tugas',
    'nav.statistics': 'Statistik',
    'nav.settings': 'Pengaturan',
    'nav.back': 'Kembali',
    
    // Home
    'home.title': 'ClarityFlow',
    'home.subtitle': 'Kelola tugas dengan metode Eisenhower Matrix',
    'home.quickActions': 'Aksi Cepat',
    'home.addTask': 'Tambah Tugas',
    'home.viewMatrix': 'Lihat Matrix',
    'home.todayTasks': 'Tugas Hari Ini',
    'home.noTasks': 'Tidak ada tugas hari ini',
    
    // Tasks
    'tasks.title': 'Manajemen Tugas',
    'tasks.addNew': 'Tambah Tugas Baru',
    'tasks.search': 'Cari tugas...',
    'tasks.filter': 'Filter',
    'tasks.all': 'Semua',
    'tasks.urgent': 'Mendesak',
    'tasks.important': 'Penting',
    'tasks.completed': 'Selesai',
    'tasks.pending': 'Tertunda',
    
    // Statistics
    'stats.title': 'Statistik',
    'stats.overview': 'Ringkasan',
    'stats.productivity': 'Produktivitas',
    'stats.trends': 'Tren',
    'stats.totalTasks': 'Total Tugas',
    'stats.completed': 'Selesai',
    'stats.pending': 'Tertunda',
    'stats.overdue': 'Terlambat',
    
    // Settings
    'settings.title': 'Pengaturan',
    'settings.notifications': 'Notifikasi',
    'settings.theme': 'Tema & Tampilan',
    'settings.privacy': 'Privasi & Keamanan',
    'settings.general': 'Umum',
    'settings.language': 'Bahasa',
    'settings.backup': 'Auto Backup',
    'settings.offline': 'Mode Offline',
    'settings.fontSize': 'Ukuran Font',
    'settings.colorScheme': 'Skema Warna',

    // Settings Subtitles
    'settings.notificationsSubtitle': 'Terima notifikasi dari aplikasi',
    'settings.taskRemindersSubtitle': 'Notifikasi untuk deadline task',
    'settings.dailyGoalsSubtitle': 'Notifikasi progress harian',
    'settings.achievementsSubtitle': 'Notifikasi achievement baru',
    'settings.soundSubtitle': 'Mainkan suara saat notifikasi',
    'settings.darkModeSubtitle': 'Gunakan tema gelap',
    'settings.fontSizeSubtitle': 'Sesuaikan ukuran teks',
    'settings.colorSchemeSubtitle': 'Pilih warna tema aplikasi',
    'settings.analyticsSubtitle': 'Bantu tingkatkan aplikasi',
    'settings.crashReportsSubtitle': 'Kirim laporan error otomatis',
    'settings.dataSyncSubtitle': 'Sync data antar perangkat',
    'settings.biometricSubtitle': 'Gunakan fingerprint/face ID',
    'settings.languageSubtitle': 'Pilih bahasa aplikasi',
    'settings.autoBackupSubtitle': 'Backup otomatis setiap hari',
    'settings.offlineModeSubtitle': 'Gunakan aplikasi tanpa internet',
    
    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.taskReminders': 'Pengingat Task',
    'common.dailyGoals': 'Target Harian',
    'common.achievements': 'Pencapaian',
    'common.sound': 'Suara Notifikasi',
    'common.darkMode': 'Mode Gelap',
    'common.analytics': 'Analytics',
    'common.crashReports': 'Laporan Crash',
    'common.dataSync': 'Sinkronisasi Data',
    'common.biometric': 'Autentikasi Biometrik',
    'common.edit': 'Edit',
    'common.done': 'Selesai',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    'common.clear': 'Bersihkan',
    'common.copy': 'Salin',

    // Quadrants
    'quadrant.urgent-important.title': 'Lakukan Dulu',
    'quadrant.urgent-important.subtitle': 'Mendesak & Penting',
    'quadrant.urgent-important.description': 'Tugas yang memerlukan perhatian segera',
    'quadrant.not-urgent-important.title': 'Jadwalkan',
    'quadrant.not-urgent-important.subtitle': 'Tidak Mendesak & Penting',
    'quadrant.not-urgent-important.description': 'Tugas untuk direncanakan dan dijadwalkan',
    'quadrant.urgent-not-important.title': 'Delegasikan',
    'quadrant.urgent-not-important.subtitle': 'Mendesak & Tidak Penting',
    'quadrant.urgent-not-important.description': 'Tugas untuk didelegasikan atau dikerjakan cepat',
    'quadrant.not-urgent-not-important.title': 'Hapus',
    'quadrant.not-urgent-not-important.subtitle': 'Tidak Mendesak & Tidak Penting',
    'quadrant.not-urgent-not-important.description': 'Tugas untuk dieliminasi atau diminimalkan',
    'quadrant.noTasks': 'Belum ada tugas di sini',

    // Add Task Page
    'addTask.title': 'Tambah Task Baru',
    'addTask.subtitle': 'AI akan menganalisis dan menentukan kategori matrix Eisenhower',
    'addTask.placeholder': 'Contoh: \'Meeting urgent dengan client besok pagi\' atau \'Belajar React Native untuk project\'',
    'addTask.analyzeButton': '🤖 Analisis AI',
    'addTask.manualButton': 'Input Manual',
    'addTask.offlineWarning': 'Anda sedang offline. Silakan periksa koneksi internet Anda.',
    'addTask.analysisResult': '🤖 Hasil Analisis AI',
    'addTask.noReasoning': 'Tidak ada penjelasan',
    'addTask.estimatedTime': 'Estimasi',
    'addTask.confidence': 'Confidence',
    'addTask.minutes': 'menit',
    'addTask.tipsTitle': '💡 Tips untuk analisis AI yang lebih akurat:',
    'addTask.tip1': '• Sertakan deadline: "Meeting besok", "Project minggu depan"',
    'addTask.tip2': '• Jelaskan urgensi: "urgent", "penting", "bisa ditunda"',
    'addTask.tip3': '• Tambahkan konteks: "untuk client", "personal", "belajar"',
    'addTask.manualInputTitle': 'Input Manual Task',
    'addTask.taskTitle': 'Judul Task',
    'addTask.taskDescription': 'Deskripsi (opsional)',
    'addTask.selectQuadrant': 'Pilih Kategori',
    'addTask.estimatedTimeLabel': 'Estimasi Waktu (menit)',
    'addTask.cancel': 'Batal',
    'addTask.save': 'Simpan',
    'addTask.analyzing': 'Menganalisis dengan AI...',
    'addTask.savingTask': '✅ Analisis selesai! Menyimpan task...',

    // Analytics/Explore Page
    'analytics.loading': 'Memuat...',
    'analytics.locked': 'Analytics Terkunci',
    'analytics.lockedSubtitle': 'Login untuk melihat analisis produktivitas dan insights AI Anda',
    'analytics.loginButton': 'Login untuk Melihat Analytics',
    'analytics.infoText': 'Dapatkan insights AI dan analisis mendalam tentang produktivitas Anda',
    'analytics.overview': 'Ringkasan',
    'analytics.totalTasks': 'Total Tugas',
    'analytics.completed': 'Selesai',
    'analytics.successRate': 'Tingkat Keberhasilan',
    'analytics.overdue': 'Terlambat',
    'analytics.quadrantPerformance': 'Performa Kuadran',
    'analytics.total': 'Total',
    'analytics.done': 'Selesai',
    'analytics.rate': 'Tingkat',
    'analytics.overdueWarning': 'terlambat',
    'analytics.timeAnalysis': 'Analisis Waktu',
    'analytics.estimatedTime': 'Estimasi Waktu',
    'analytics.actualTime': 'Waktu Aktual',
    'analytics.avgCompletion': 'Rata-rata Penyelesaian',
    'analytics.productivityTips': '📚 Tips Produktivitas',

    // Account Page
    'account.loading': 'Memuat...',
    'account.welcome': 'Selamat Datang!',
    'account.welcomeSubtitle': 'Login atau daftar untuk mengakses fitur lengkap ClarityFlow',
    'account.loginButton': 'Login dengan Google',
    'account.joinInfo': 'Bergabung dengan ClarityFlow untuk mengakses semua fitur',
    'account.accountInfo': 'Informasi Akun',
    'account.joinedSince': 'Bergabung sejak',
    'account.status': 'Status',
    'account.statusActive': 'Aktif',
    'account.userId': 'ID Pengguna',
    'account.quickActions': 'Aksi Cepat',
    'account.statistics': 'Statistik',
    'account.statisticsSubtitle': 'Lihat progress Anda',
    'account.settings': 'Pengaturan',
    'account.settingsSubtitle': 'Kustomisasi aplikasi',
    'account.exportData': 'Export Data',
    'account.exportDataSubtitle': 'Backup ke file',
    'account.resetData': 'Reset Data',
    'account.resetDataSubtitle': 'Hapus semua data',
    'account.resetting': 'Mereset...',
    'account.settingsSection': 'Pengaturan',
    'account.notifications': '🔔 Notifikasi',
    'account.darkMode': '🌙 Mode Gelap',
    'account.privacyMode': '🔒 Mode Privasi',
    'account.adminPanel': '👑 Panel Admin',
    'account.systemManagement': 'Sistem Management',
    'account.userManagement': 'User Management',
    'account.userManagementSubtitle': 'Kelola pengguna',
    'account.systemSettings': 'System Settings',
    'account.systemSettingsSubtitle': 'Pengaturan sistem',
    'account.database': 'Database',
    'account.databaseSubtitle': 'Kelola database',
    'account.securityLogs': 'Security Logs',
    'account.securityLogsSubtitle': 'Log keamanan',
    'account.apiManagement': 'API Management',
    'account.apiManagementSubtitle': 'Kelola API',
    'account.systemHealth': 'System Health',
    'account.systemHealthSubtitle': 'Kesehatan sistem',
    'account.logout': 'Logout',
    'account.logoutConfirm': 'Apakah Anda yakin ingin logout?',
    'account.cancel': 'Batal',
    'account.dataManagement': 'Manajemen Data',
    'account.resetWarning': 'PERINGATAN: Reset Data',
    'account.resetWarningMessage': 'Tindakan ini akan menghapus SEMUA data termasuk:\n\n• Semua tugas dan proyek\n• Pengaturan aplikasi\n• Riwayat aktivitas\n\nData yang dihapus TIDAK DAPAT dikembalikan!',
    'account.resetAllData': 'Reset Semua Data',
    'account.resetSuccess': 'Reset Berhasil',
    'account.resetSuccessMessage': 'Semua data telah dihapus. Aplikasi akan dimuat ulang.',
    'account.resetError': 'Gagal mereset data',
    'account.logoutError': 'Gagal logout',
    'account.unknownDate': 'Tidak diketahui',
    'account.administrator': '👑 Administrator',
    'account.member': '👤 Member',

    // Feature List
    'features.analytics': 'Analytics & Insights AI',
    'features.cloudSync': 'Sinkronisasi Cloud',
    'features.goalTracking': 'Goal Tracking',
    'features.smartNotifications': 'Smart Notifications',

    // Statistics Page
    'statistics.title': 'Statistik & Analytics',
    'statistics.week': 'Minggu',
    'statistics.month': 'Bulan',
    'statistics.year': 'Tahun',
    'statistics.mainSummary': '📈 Ringkasan Utama',
    'statistics.totalTasks': 'Total Tasks',
    'statistics.completed': 'Selesai',
    'statistics.successRate': 'Success Rate',
    'statistics.dailyStreak': 'Streak Harian',
    'statistics.days': 'hari',
    'statistics.fromLastWeek': 'dari minggu lalu',
    'statistics.fromLastMonth': 'dari bulan lalu',
    'statistics.bestRecord': 'Rekor terbaik!',
    'statistics.progressTracking': '📊 Progress Tracking',
    'statistics.tasksCompleted': 'Tasks Completed',
    'statistics.monthlyGoals': 'Monthly Goals',
    'statistics.weeklyProductivity': 'Weekly Productivity',
    'statistics.timeAnalysis': '⏱️ Analisis Waktu',
    'statistics.avgFocusTime': 'Rata-rata Focus Time',
    'statistics.totalWorkHours': 'Total Jam Kerja',
    'statistics.avgPerTask': 'Rata-rata per Task',
    'statistics.insightsRecommendations': '💡 Insights & Rekomendasi',
    'statistics.productivityIncreased': 'Produktivitas Meningkat',
    'statistics.productivityIncreasedDesc': 'Performa Anda meningkat 15% minggu ini! Pertahankan momentum dengan konsistensi.',
    'statistics.targetAchieved': 'Target Tercapai',
    'statistics.targetAchievedDesc': 'Anda berhasil mencapai 89% target bulanan. Fokus pada 3 task prioritas untuk mencapai 100%.',
    'statistics.optimalTime': 'Waktu Optimal',
    'statistics.optimalTimeDesc': 'Jam 9-11 pagi adalah waktu paling produktif Anda. Jadwalkan task penting di jam tersebut.',

    // Transliteration
    'transliteration.title': 'Alat Transliterasi',
    'transliteration.sourceLanguage': 'Bahasa Sumber',
    'transliteration.targetLanguage': 'Bahasa Target',
    'transliteration.direction': 'Arah Transliterasi',
    'transliteration.auto': 'Otomatis',
    'transliteration.toLatin': 'Ke Latin',
    'transliteration.fromLatin': 'Dari Latin',
    'transliteration.inputText': 'Teks Input',
    'transliteration.outputText': 'Teks Output',
    'transliteration.inputPlaceholder': 'Masukkan teks untuk ditransliterasi...',
    'transliteration.transliterate': 'Transliterasi',
    'transliteration.confidence': 'Tingkat Kepercayaan',
    'transliteration.detectedLanguage': 'Bahasa Terdeteksi',
    'transliteration.settings': 'Pengaturan Transliterasi',
    'transliteration.enableTransliteration': 'Aktifkan Transliterasi',
    'transliteration.enableDescription': 'Mengaktifkan fitur transliterasi untuk mengkonversi teks antar sistem penulisan',
    'transliteration.currentLanguage': 'Bahasa Saat Ini',
    'transliteration.openTool': 'Buka Alat Transliterasi',
    'transliteration.supportedLanguages': 'Bahasa yang Didukung',
    'transliteration.features': 'Fitur',
    'transliteration.feature1': 'Deteksi bahasa otomatis',
    'transliteration.feature2': 'Dukungan multi-bahasa',
    'transliteration.feature3': 'Transliterasi dua arah',
    'transliteration.feature4': 'Aturan kustom',
    'transliteration.enabledMessage': 'Transliterasi telah diaktifkan',
    'transliteration.disabledMessage': 'Transliterasi telah dinonaktifkan',
    'transliteration.toggleError': 'Gagal mengubah pengaturan transliterasi',
    'transliteration.tool': 'Alat',
    'transliteration.notEnabled': 'Transliterasi Tidak Diaktifkan',
    'transliteration.enableInSettings': 'Aktifkan transliterasi di pengaturan untuk menggunakan fitur ini',
    'transliteration.goToSettings': 'Buka Pengaturan',
    'transliteration.taskTransliteratedSuccess': 'Tugas berhasil ditransliterasi',
    'transliteration.taskTransliterationError': 'Gagal mentransliterasi tugas',
    'transliteration.advancedTool': 'Alat Transliterasi Lanjutan',
    'transliteration.copyPasteInstructions': 'Gunakan alat di atas untuk mentransliterasi teks, lalu salin dan tempel hasilnya ke tugas Anda',
    'transliteration.settingsDescription': 'Kelola pengaturan dan gunakan alat transliterasi',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.tasks': 'Tasks',
    'nav.statistics': 'Statistics',
    'nav.settings': 'Settings',
    'nav.back': 'Back',
    
    // Home
    'home.title': 'ClarityFlow',
    'home.subtitle': 'Manage tasks with Eisenhower Matrix method',
    'home.quickActions': 'Quick Actions',
    'home.addTask': 'Add Task',
    'home.viewMatrix': 'View Matrix',
    'home.todayTasks': 'Today\'s Tasks',
    'home.noTasks': 'No tasks for today',
    
    // Tasks
    'tasks.title': 'Task Management',
    'tasks.addNew': 'Add New Task',
    'tasks.search': 'Search tasks...',
    'tasks.filter': 'Filter',
    'tasks.all': 'All',
    'tasks.urgent': 'Urgent',
    'tasks.important': 'Important',
    'tasks.completed': 'Completed',
    'tasks.pending': 'Pending',
    
    // Statistics
    'stats.title': 'Statistics',
    'stats.overview': 'Overview',
    'stats.productivity': 'Productivity',
    'stats.trends': 'Trends',
    'stats.totalTasks': 'Total Tasks',
    'stats.completed': 'Completed',
    'stats.pending': 'Pending',
    'stats.overdue': 'Overdue',
    
    // Settings
    'settings.title': 'Settings',
    'settings.notifications': 'Notifications',
    'settings.theme': 'Theme & Display',
    'settings.privacy': 'Privacy & Security',
    'settings.general': 'General',
    'settings.language': 'Language',
    'settings.backup': 'Auto Backup',
    'settings.offline': 'Offline Mode',
    'settings.fontSize': 'Font Size',
    'settings.colorScheme': 'Color Scheme',

    // Settings Subtitles
    'settings.notificationsSubtitle': 'Receive notifications from app',
    'settings.taskRemindersSubtitle': 'Notifications for task deadlines',
    'settings.dailyGoalsSubtitle': 'Daily progress notifications',
    'settings.achievementsSubtitle': 'New achievement notifications',
    'settings.soundSubtitle': 'Play sound on notifications',
    'settings.darkModeSubtitle': 'Use dark theme',
    'settings.fontSizeSubtitle': 'Adjust text size',
    'settings.colorSchemeSubtitle': 'Choose app theme color',
    'settings.analyticsSubtitle': 'Help improve the app',
    'settings.crashReportsSubtitle': 'Send automatic error reports',
    'settings.dataSyncSubtitle': 'Sync data across devices',
    'settings.biometricSubtitle': 'Use fingerprint/face ID',
    'settings.languageSubtitle': 'Choose app language',
    'settings.autoBackupSubtitle': 'Automatic daily backup',
    'settings.offlineModeSubtitle': 'Use app without internet',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.taskReminders': 'Task Reminders',
    'common.dailyGoals': 'Daily Goals',
    'common.achievements': 'Achievements',
    'common.sound': 'Notification Sound',
    'common.darkMode': 'Dark Mode',
    'common.analytics': 'Analytics',
    'common.crashReports': 'Crash Reports',
    'common.dataSync': 'Data Sync',
    'common.biometric': 'Biometric Authentication',
    'common.edit': 'Edit',
    'common.done': 'Done',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.clear': 'Clear',
    'common.copy': 'Copy',

    // Quadrants
    'quadrant.urgent-important.title': 'Do First',
    'quadrant.urgent-important.subtitle': 'Urgent & Important',
    'quadrant.urgent-important.description': 'Tasks that need immediate attention',
    'quadrant.not-urgent-important.title': 'Schedule',
    'quadrant.not-urgent-important.subtitle': 'Not Urgent & Important',
    'quadrant.not-urgent-important.description': 'Tasks to plan and schedule',
    'quadrant.urgent-not-important.title': 'Delegate',
    'quadrant.urgent-not-important.subtitle': 'Urgent & Not Important',
    'quadrant.urgent-not-important.description': 'Tasks to delegate or do quickly',
    'quadrant.not-urgent-not-important.title': 'Delete',
    'quadrant.not-urgent-not-important.subtitle': 'Not Urgent & Not Important',
    'quadrant.not-urgent-not-important.description': 'Tasks to eliminate or minimize',
    'quadrant.noTasks': 'No tasks here yet',

    // Add Task Page
    'addTask.title': 'Add New Task',
    'addTask.subtitle': 'AI will analyze and determine the Eisenhower matrix category',
    'addTask.placeholder': 'Example: \'Urgent meeting with client tomorrow morning\' or \'Learn React Native for project\'',
    'addTask.analyzeButton': '🤖 AI Analysis',
    'addTask.manualButton': 'Manual Input',
    'addTask.offlineWarning': 'You are offline. Please check your internet connection.',
    'addTask.analysisResult': '🤖 AI Analysis Result',
    'addTask.noReasoning': 'No explanation',
    'addTask.estimatedTime': 'Estimated',
    'addTask.confidence': 'Confidence',
    'addTask.minutes': 'minutes',
    'addTask.tipsTitle': '💡 Tips for more accurate AI analysis:',
    'addTask.tip1': '• Include deadline: "Meeting tomorrow", "Project next week"',
    'addTask.tip2': '• Explain urgency: "urgent", "important", "can be postponed"',
    'addTask.tip3': '• Add context: "for client", "personal", "learning"',
    'addTask.manualInputTitle': 'Manual Task Input',
    'addTask.taskTitle': 'Task Title',
    'addTask.taskDescription': 'Description (optional)',
    'addTask.selectQuadrant': 'Select Category',
    'addTask.estimatedTimeLabel': 'Estimated Time (minutes)',
    'addTask.cancel': 'Cancel',
    'addTask.save': 'Save',
    'addTask.analyzing': 'Analyzing with AI...',
    'addTask.savingTask': '✅ Analysis complete! Saving task...',

    // Analytics/Explore Page
    'analytics.loading': 'Loading...',
    'analytics.locked': 'Analytics Locked',
    'analytics.lockedSubtitle': 'Login to view your productivity analysis and AI insights',
    'analytics.loginButton': 'Login to View Analytics',
    'analytics.infoText': 'Get AI insights and deep analysis about your productivity',
    'analytics.overview': 'Overview',
    'analytics.totalTasks': 'Total Tasks',
    'analytics.completed': 'Completed',
    'analytics.successRate': 'Success Rate',
    'analytics.overdue': 'Overdue',
    'analytics.quadrantPerformance': 'Quadrant Performance',
    'analytics.total': 'Total',
    'analytics.done': 'Done',
    'analytics.rate': 'Rate',
    'analytics.overdueWarning': 'overdue',
    'analytics.timeAnalysis': 'Time Analysis',
    'analytics.estimatedTime': 'Estimated Time',
    'analytics.actualTime': 'Actual Time',
    'analytics.avgCompletion': 'Avg. Completion',
    'analytics.productivityTips': '📚 Productivity Tips',

    // Account Page
    'account.loading': 'Loading...',
    'account.welcome': 'Welcome!',
    'account.welcomeSubtitle': 'Login or register to access full ClarityFlow features',
    'account.loginButton': 'Login with Google',
    'account.joinInfo': 'Join ClarityFlow to access all features',
    'account.accountInfo': 'Account Information',
    'account.joinedSince': 'Joined since',
    'account.status': 'Status',
    'account.statusActive': 'Active',
    'account.userId': 'User ID',
    'account.quickActions': 'Quick Actions',
    'account.statistics': 'Statistics',
    'account.statisticsSubtitle': 'View your progress',
    'account.settings': 'Settings',
    'account.settingsSubtitle': 'Customize app',
    'account.exportData': 'Export Data',
    'account.exportDataSubtitle': 'Backup to file',
    'account.resetData': 'Reset Data',
    'account.resetDataSubtitle': 'Delete all data',
    'account.resetting': 'Resetting...',
    'account.settingsSection': 'Settings',
    'account.notifications': '🔔 Notifications',
    'account.darkMode': '🌙 Dark Mode',
    'account.privacyMode': '🔒 Privacy Mode',
    'account.adminPanel': '👑 Admin Panel',
    'account.systemManagement': 'System Management',
    'account.userManagement': 'User Management',
    'account.userManagementSubtitle': 'Manage users',
    'account.systemSettings': 'System Settings',
    'account.systemSettingsSubtitle': 'System configuration',
    'account.database': 'Database',
    'account.databaseSubtitle': 'Manage database',
    'account.securityLogs': 'Security Logs',
    'account.securityLogsSubtitle': 'Security logs',
    'account.apiManagement': 'API Management',
    'account.apiManagementSubtitle': 'Manage API',
    'account.systemHealth': 'System Health',
    'account.systemHealthSubtitle': 'System health',
    'account.logout': 'Logout',
    'account.logoutConfirm': 'Are you sure you want to logout?',
    'account.cancel': 'Cancel',
    'account.dataManagement': 'Data Management',
    'account.resetWarning': 'WARNING: Reset Data',
    'account.resetWarningMessage': 'This action will delete ALL data including:\n\n• All tasks and projects\n• App settings\n• Activity history\n\nDeleted data CANNOT be recovered!',
    'account.resetAllData': 'Reset All Data',
    'account.resetSuccess': 'Reset Successful',
    'account.resetSuccessMessage': 'All data has been deleted. App will reload.',
    'account.resetError': 'Failed to reset data',
    'account.logoutError': 'Failed to logout',
    'account.unknownDate': 'Unknown',
    'account.administrator': '👑 Administrator',
    'account.member': '👤 Member',

    // Feature List
    'features.analytics': 'Analytics & AI Insights',
    'features.cloudSync': 'Cloud Sync',
    'features.goalTracking': 'Goal Tracking',
    'features.smartNotifications': 'Smart Notifications',

    // Statistics Page
    'statistics.title': 'Statistics & Analytics',
    'statistics.week': 'Week',
    'statistics.month': 'Month',
    'statistics.year': 'Year',
    'statistics.mainSummary': '📈 Main Summary',
    'statistics.totalTasks': 'Total Tasks',
    'statistics.completed': 'Completed',
    'statistics.successRate': 'Success Rate',
    'statistics.dailyStreak': 'Daily Streak',
    'statistics.days': 'days',
    'statistics.fromLastWeek': 'from last week',
    'statistics.fromLastMonth': 'from last month',
    'statistics.bestRecord': 'Best record!',
    'statistics.progressTracking': '📊 Progress Tracking',
    'statistics.tasksCompleted': 'Tasks Completed',
    'statistics.monthlyGoals': 'Monthly Goals',
    'statistics.weeklyProductivity': 'Weekly Productivity',
    'statistics.timeAnalysis': '⏱️ Time Analysis',
    'statistics.avgFocusTime': 'Average Focus Time',
    'statistics.totalWorkHours': 'Total Work Hours',
    'statistics.avgPerTask': 'Average per Task',
    'statistics.insightsRecommendations': '💡 Insights & Recommendations',
    'statistics.productivityIncreased': 'Productivity Increased',
    'statistics.productivityIncreasedDesc': 'Your performance increased 15% this week! Maintain momentum with consistency.',
    'statistics.targetAchieved': 'Target Achieved',
    'statistics.targetAchievedDesc': 'You successfully achieved 89% of monthly targets. Focus on 3 priority tasks to reach 100%.',
    'statistics.optimalTime': 'Optimal Time',
    'statistics.optimalTimeDesc': '9-11 AM is your most productive time. Schedule important tasks during these hours.',

    // Transliteration
    'transliteration.title': 'Transliteration Tool',
    'transliteration.sourceLanguage': 'Source Language',
    'transliteration.targetLanguage': 'Target Language',
    'transliteration.direction': 'Transliteration Direction',
    'transliteration.auto': 'Auto',
    'transliteration.toLatin': 'To Latin',
    'transliteration.fromLatin': 'From Latin',
    'transliteration.inputText': 'Input Text',
    'transliteration.outputText': 'Output Text',
    'transliteration.inputPlaceholder': 'Enter text to transliterate...',
    'transliteration.transliterate': 'Transliterate',
    'transliteration.confidence': 'Confidence',
    'transliteration.detectedLanguage': 'Detected Language',
    'transliteration.settings': 'Transliteration Settings',
    'transliteration.enableTransliteration': 'Enable Transliteration',
    'transliteration.enableDescription': 'Enable transliteration features to convert text between writing systems',
    'transliteration.currentLanguage': 'Current Language',
    'transliteration.openTool': 'Open Transliteration Tool',
    'transliteration.supportedLanguages': 'Supported Languages',
    'transliteration.features': 'Features',
    'transliteration.feature1': 'Automatic language detection',
    'transliteration.feature2': 'Multi-language support',
    'transliteration.feature3': 'Bidirectional transliteration',
    'transliteration.feature4': 'Custom rules',
    'transliteration.enabledMessage': 'Transliteration has been enabled',
    'transliteration.disabledMessage': 'Transliteration has been disabled',
    'transliteration.toggleError': 'Failed to change transliteration settings',
    'transliteration.tool': 'Tool',
    'transliteration.notEnabled': 'Transliteration Not Enabled',
    'transliteration.enableInSettings': 'Enable transliteration in settings to use this feature',
    'transliteration.goToSettings': 'Go to Settings',
    'transliteration.taskTransliteratedSuccess': 'Task successfully transliterated',
    'transliteration.taskTransliterationError': 'Failed to transliterate task',
    'transliteration.advancedTool': 'Advanced Transliteration Tool',
    'transliteration.copyPasteInstructions': 'Use the tool above to transliterate text, then copy and paste the result to your task',
    'transliteration.settingsDescription': 'Manage settings and use transliteration tools',
  },
  ms: {
    // Navigation
    'nav.home': 'Utama',
    'nav.tasks': 'Tugasan',
    'nav.statistics': 'Statistik',
    'nav.settings': 'Tetapan',
    'nav.back': 'Kembali',
    
    // Home
    'home.title': 'ClarityFlow',
    'home.subtitle': 'Urus tugasan dengan kaedah Eisenhower Matrix',
    'home.quickActions': 'Tindakan Pantas',
    'home.addTask': 'Tambah Tugasan',
    'home.viewMatrix': 'Lihat Matrix',
    'home.todayTasks': 'Tugasan Hari Ini',
    'home.noTasks': 'Tiada tugasan hari ini',
    
    // Tasks
    'tasks.title': 'Pengurusan Tugasan',
    'tasks.addNew': 'Tambah Tugasan Baru',
    'tasks.search': 'Cari tugasan...',
    'tasks.filter': 'Tapis',
    'tasks.all': 'Semua',
    'tasks.urgent': 'Mendesak',
    'tasks.important': 'Penting',
    'tasks.completed': 'Selesai',
    'tasks.pending': 'Tertangguh',
    
    // Statistics
    'stats.title': 'Statistik',
    'stats.overview': 'Ringkasan',
    'stats.productivity': 'Produktiviti',
    'stats.trends': 'Trend',
    'stats.totalTasks': 'Jumlah Tugasan',
    'stats.completed': 'Selesai',
    'stats.pending': 'Tertangguh',
    'stats.overdue': 'Lewat',
    
    // Settings
    'settings.title': 'Tetapan',
    'settings.notifications': 'Pemberitahuan',
    'settings.theme': 'Tema & Paparan',
    'settings.privacy': 'Privasi & Keselamatan',
    'settings.general': 'Am',
    'settings.language': 'Bahasa',
    'settings.backup': 'Auto Backup',
    'settings.offline': 'Mod Luar Talian',
    'settings.fontSize': 'Saiz Font',
    'settings.colorScheme': 'Skema Warna',

    // Settings Subtitles
    'settings.notificationsSubtitle': 'Terima pemberitahuan dari aplikasi',
    'settings.taskRemindersSubtitle': 'Pemberitahuan untuk deadline tugasan',
    'settings.dailyGoalsSubtitle': 'Pemberitahuan kemajuan harian',
    'settings.achievementsSubtitle': 'Pemberitahuan pencapaian baru',
    'settings.soundSubtitle': 'Mainkan bunyi semasa pemberitahuan',
    'settings.darkModeSubtitle': 'Gunakan tema gelap',
    'settings.fontSizeSubtitle': 'Laraskan saiz teks',
    'settings.colorSchemeSubtitle': 'Pilih warna tema aplikasi',
    'settings.analyticsSubtitle': 'Bantu tingkatkan aplikasi',
    'settings.crashReportsSubtitle': 'Hantar laporan ralat automatik',
    'settings.dataSyncSubtitle': 'Segerak data antara peranti',
    'settings.biometricSubtitle': 'Gunakan cap jari/face ID',
    'settings.languageSubtitle': 'Pilih bahasa aplikasi',
    'settings.autoBackupSubtitle': 'Backup automatik setiap hari',
    'settings.offlineModeSubtitle': 'Gunakan aplikasi tanpa internet',
    
    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Padam',
    'common.taskReminders': 'Peringatan Tugasan',
    'common.dailyGoals': 'Matlamat Harian',
    'common.achievements': 'Pencapaian',
    'common.sound': 'Bunyi Pemberitahuan',
    'common.darkMode': 'Mod Gelap',
    'common.analytics': 'Analitik',
    'common.crashReports': 'Laporan Kerosakan',
    'common.dataSync': 'Segerak Data',
    'common.biometric': 'Pengesahan Biometrik',
    'common.edit': 'Edit',
    'common.done': 'Selesai',
    'common.loading': 'Memuatkan...',
    'common.error': 'Ralat berlaku',
    'common.success': 'Berjaya',
    'common.clear': 'Kosongkan',
    'common.copy': 'Salin',

    // Quadrants
    'quadrant.urgent-important.title': 'Buat Dahulu',
    'quadrant.urgent-important.subtitle': 'Mendesak & Penting',
    'quadrant.urgent-important.description': 'Tugasan yang memerlukan perhatian segera',
    'quadrant.not-urgent-important.title': 'Jadualkan',
    'quadrant.not-urgent-important.subtitle': 'Tidak Mendesak & Penting',
    'quadrant.not-urgent-important.description': 'Tugasan untuk dirancang dan dijadualkan',
    'quadrant.urgent-not-important.title': 'Wakilkan',
    'quadrant.urgent-not-important.subtitle': 'Mendesak & Tidak Penting',
    'quadrant.urgent-not-important.description': 'Tugasan untuk diwakilkan atau dibuat cepat',
    'quadrant.not-urgent-not-important.title': 'Padam',
    'quadrant.not-urgent-not-important.subtitle': 'Tidak Mendesak & Tidak Penting',
    'quadrant.not-urgent-not-important.description': 'Tugasan untuk dihapuskan atau diminimumkan',
    'quadrant.noTasks': 'Belum ada tugasan di sini',

    // Transliteration
    'transliteration.title': 'Alat Transliterasi',
    'transliteration.sourceLanguage': 'Bahasa Sumber',
    'transliteration.targetLanguage': 'Bahasa Sasaran',
    'transliteration.direction': 'Arah Transliterasi',
    'transliteration.auto': 'Auto',
    'transliteration.toLatin': 'Ke Latin',
    'transliteration.fromLatin': 'Dari Latin',
    'transliteration.inputText': 'Teks Input',
    'transliteration.outputText': 'Teks Output',
    'transliteration.inputPlaceholder': 'Masukkan teks untuk transliterasi...',
    'transliteration.transliterate': 'Transliterasi',
    'transliteration.confidence': 'Tahap Keyakinan',
    'transliteration.detectedLanguage': 'Bahasa Dikesan',

    // Add Task Page
    'addTask.title': 'Tambah Tugasan',
    'addTask.taskName': 'Nama Tugasan',
    'addTask.taskNamePlaceholder': 'Masukkan nama tugasan...',
    'addTask.description': 'Penerangan',
    'addTask.descriptionPlaceholder': 'Masukkan penerangan tugasan...',
    'addTask.priority': 'Keutamaan',
    'addTask.dueDate': 'Tarikh Akhir',
    'addTask.estimatedTime': 'Anggaran Masa (minit)',
    'addTask.tags': 'Tag',
    'addTask.tagsPlaceholder': 'Tambah tag...',
    'addTask.aiAnalysis': 'Analisis AI',
    'addTask.enableAI': 'Aktifkan analisis AI untuk cadangan automatik',
    'addTask.createTask': 'Cipta Tugasan',
    'addTask.analyzing': 'Menganalisis dengan AI...',
    'addTask.savingTask': '✅ Analisis selesai! Menyimpan tugasan...',

    // Analytics/Explore Page
    'analytics.loading': 'Memuatkan...',
    'analytics.locked': 'Analitik Dikunci',
    'analytics.lockedSubtitle': 'Log masuk untuk melihat analisis produktiviti dan wawasan AI anda',
    'analytics.loginButton': 'Log Masuk untuk Melihat Analitik',
    'analytics.infoText': 'Dapatkan wawasan AI dan analisis mendalam tentang produktiviti anda',
    'analytics.overview': 'Ringkasan',
    'analytics.totalTasks': 'Jumlah Tugasan',
    'analytics.completed': 'Selesai',
    'analytics.successRate': 'Kadar Kejayaan',
    'analytics.overdue': 'Lewat',
    'analytics.quadrantPerformance': 'Prestasi Kuadran',
    'analytics.total': 'Jumlah',
    'analytics.done': 'Selesai',
    'analytics.rate': 'Kadar',
    'analytics.overdueWarning': 'lewat',
    'analytics.timeAnalysis': 'Analisis Masa',
    'analytics.estimatedTime': 'Anggaran Masa',
    'analytics.actualTime': 'Masa Sebenar',
    'analytics.avgCompletion': 'Purata Siap',
    'analytics.productivityTips': '📚 Petua Produktiviti',

    // Account Page
    'account.loading': 'Memuatkan...',
    'account.welcome': 'Selamat Datang!',
    'account.welcomeSubtitle': 'Log masuk atau daftar untuk mengakses ciri penuh ClarityFlow',
    'account.loginButton': 'Log Masuk dengan Google',
    'account.joinInfo': 'Sertai ClarityFlow untuk mengakses semua ciri',
    'account.accountInfo': 'Maklumat Akaun',
    'account.joinedSince': 'Menyertai sejak',
    'account.status': 'Status',
    'account.statusActive': 'Aktif',
    'account.userId': 'ID Pengguna',
    'account.quickActions': 'Tindakan Pantas',
    'account.statistics': 'Statistik',
    'account.statisticsSubtitle': 'Lihat kemajuan anda',
    'account.settings': 'Tetapan',
    'account.settingsSubtitle': 'Kustomisasi aplikasi',
    'account.exportData': 'Eksport Data',
    'account.exportDataSubtitle': 'Backup ke fail',
    'account.resetData': 'Reset Data',
    'account.resetDataSubtitle': 'Padam semua data',
    'account.resetting': 'Mereset...',
    'account.settingsSection': 'Tetapan',
    'account.notifications': '🔔 Pemberitahuan',
    'account.darkMode': '🌙 Mod Gelap',
    'account.privacyMode': '🔒 Mod Privasi',
    'account.adminPanel': '👑 Panel Admin',
    'account.systemManagement': 'Pengurusan Sistem',
    'account.userManagement': 'Pengurusan Pengguna',
    'account.userManagementSubtitle': 'Urus pengguna',
    'account.systemSettings': 'Tetapan Sistem',
    'account.systemSettingsSubtitle': 'Konfigurasi sistem',
    'account.database': 'Pangkalan Data',
    'account.databaseSubtitle': 'Urus pangkalan data',
    'account.securityLogs': 'Log Keselamatan',
    'account.securityLogsSubtitle': 'Log keselamatan',
    'account.apiManagement': 'Pengurusan API',
    'account.apiManagementSubtitle': 'Urus API',
    'account.systemHealth': 'Kesihatan Sistem',
    'account.systemHealthSubtitle': 'Kesihatan sistem',
    'account.logout': 'Log Keluar',
    'account.logoutConfirm': 'Adakah anda pasti mahu log keluar?',
    'account.cancel': 'Batal',
    'account.dataManagement': 'Pengurusan Data',
    'account.resetWarning': 'AMARAN: Reset Data',
    'account.resetWarningMessage': 'Tindakan ini akan memadam SEMUA data termasuk:\n\n• Semua tugasan dan projek\n• Tetapan aplikasi\n• Sejarah aktiviti\n\nData yang dipadam TIDAK BOLEH dipulihkan!',
    'account.resetAllData': 'Reset Semua Data',
    'account.resetSuccess': 'Reset Berjaya',
    'account.resetSuccessMessage': 'Semua data telah dipadam. Aplikasi akan dimuat semula.',
    'account.resetError': 'Gagal mereset data',
    'account.logoutError': 'Gagal log keluar',
    'account.unknownDate': 'Tidak diketahui',
    'account.administrator': '👑 Pentadbir',
    'account.member': '👤 Ahli',

    // Feature List
    'features.analytics': 'Analitik & Wawasan AI',
    'features.cloudSync': 'Sinkronisasi Awan',
    'features.goalTracking': 'Penjejakan Matlamat',
    'features.smartNotifications': 'Pemberitahuan Pintar',

    // Statistics Page
    'statistics.title': 'Statistik & Analitik',
    'statistics.week': 'Minggu',
    'statistics.month': 'Bulan',
    'statistics.year': 'Tahun',
    'statistics.mainSummary': '📈 Ringkasan Utama',
    'statistics.totalTasks': 'Jumlah Tugasan',
    'statistics.completed': 'Selesai',
    'statistics.successRate': 'Kadar Kejayaan',
    'statistics.dailyStreak': 'Streak Harian',
    'statistics.days': 'hari',
    'statistics.fromLastWeek': 'dari minggu lepas',
    'statistics.fromLastMonth': 'dari bulan lepas',
    'statistics.bestRecord': 'Rekod terbaik!',
    'statistics.progressTracking': '📊 Penjejakan Kemajuan',
    'statistics.tasksCompleted': 'Tugasan Selesai',
    'statistics.monthlyGoals': 'Matlamat Bulanan',
    'statistics.weeklyProductivity': 'Produktiviti Mingguan',
    'statistics.timeAnalysis': '⏱️ Analisis Masa',
    'statistics.avgFocusTime': 'Purata Masa Fokus',
    'statistics.totalWorkHours': 'Jumlah Jam Kerja',
    'statistics.avgPerTask': 'Purata per Tugasan',
    'statistics.insightsRecommendations': '💡 Wawasan & Cadangan',
    'statistics.productivityIncreased': 'Produktiviti Meningkat',
    'statistics.productivityIncreasedDesc': 'Prestasi anda meningkat 15% minggu ini! Kekalkan momentum dengan konsistensi.',
    'statistics.targetAchieved': 'Sasaran Tercapai',
    'statistics.targetAchievedDesc': 'Anda berjaya mencapai 89% sasaran bulanan. Fokus pada 3 tugasan keutamaan untuk mencapai 100%.',
    'statistics.optimalTime': 'Masa Optimum',
    'statistics.optimalTimeDesc': 'Jam 9-11 pagi adalah masa paling produktif anda. Jadualkan tugasan penting pada jam tersebut.',

    // Transliteration
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.tasks': 'المهام',
    'nav.statistics': 'الإحصائيات',
    'nav.settings': 'الإعدادات',
    'nav.back': 'رجوع',

    // Home
    'home.title': 'ClarityFlow',
    'home.subtitle': 'إدارة المهام باستخدام مصفوفة أيزنهاور',
    'home.quickActions': 'إجراءات سريعة',
    'home.addTask': 'إضافة مهمة',
    'home.viewMatrix': 'عرض المصفوفة',
    'home.todayTasks': 'مهام اليوم',
    'home.noTasks': 'لا توجد مهام اليوم',

    // Tasks
    'tasks.title': 'إدارة المهام',
    'tasks.addNew': 'إضافة مهمة جديدة',
    'tasks.search': 'البحث في المهام...',
    'tasks.filter': 'تصفية',
    'tasks.all': 'الكل',
    'tasks.urgent': 'عاجل',
    'tasks.important': 'مهم',
    'tasks.completed': 'مكتمل',
    'tasks.pending': 'معلق',

    // Statistics
    'stats.title': 'الإحصائيات',
    'stats.overview': 'نظرة عامة',
    'stats.productivity': 'الإنتاجية',
    'stats.trends': 'الاتجاهات',
    'stats.totalTasks': 'إجمالي المهام',
    'stats.completed': 'مكتمل',
    'stats.pending': 'معلق',
    'stats.overdue': 'متأخر',

    // Settings
    'settings.title': 'الإعدادات',
    'settings.notifications': 'الإشعارات',
    'settings.theme': 'المظهر والعرض',
    'settings.privacy': 'الخصوصية والأمان',
    'settings.general': 'عام',
    'settings.language': 'اللغة',
    'settings.backup': 'النسخ الاحتياطي التلقائي',
    'settings.offline': 'وضع عدم الاتصال',
    'settings.fontSize': 'حجم الخط',
    'settings.colorScheme': 'نظام الألوان',

    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تحرير',
    'common.done': 'تم',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'نجح',
    'common.clear': 'مسح',
    'common.copy': 'نسخ',

    // Quadrants
    'quadrant.urgent-important.title': 'افعل أولاً',
    'quadrant.urgent-important.subtitle': 'عاجل ومهم',
    'quadrant.urgent-important.description': 'المهام التي تحتاج إلى اهتمام فوري',
    'quadrant.not-urgent-important.title': 'جدول',
    'quadrant.not-urgent-important.subtitle': 'غير عاجل ومهم',
    'quadrant.not-urgent-important.description': 'المهام للتخطيط والجدولة',
    'quadrant.urgent-not-important.title': 'فوض',
    'quadrant.urgent-not-important.subtitle': 'عاجل وغير مهم',
    'quadrant.urgent-not-important.description': 'المهام للتفويض أو الإنجاز السريع',
    'quadrant.not-urgent-not-important.title': 'احذف',
    'quadrant.not-urgent-not-important.subtitle': 'غير عاجل وغير مهم',
    'quadrant.not-urgent-not-important.description': 'المهام للإلغاء أو التقليل',
    'quadrant.noTasks': 'لا توجد مهام هنا بعد',

    // Transliteration
    'transliteration.title': 'أداة النقل الحرفي',
    'transliteration.sourceLanguage': 'اللغة المصدر',
    'transliteration.targetLanguage': 'اللغة الهدف',
    'transliteration.direction': 'اتجاه النقل الحرفي',
    'transliteration.auto': 'تلقائي',
    'transliteration.toLatin': 'إلى اللاتينية',
    'transliteration.fromLatin': 'من اللاتينية',
    'transliteration.inputText': 'النص المدخل',
    'transliteration.outputText': 'النص المخرج',
    'transliteration.inputPlaceholder': 'أدخل النص للنقل الحرفي...',
    'transliteration.transliterate': 'نقل حرفي',
    'transliteration.confidence': 'مستوى الثقة',
    'transliteration.detectedLanguage': 'اللغة المكتشفة',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.tasks': '任务',
    'nav.statistics': '统计',
    'nav.settings': '设置',
    'nav.back': '返回',

    // Home
    'home.title': 'ClarityFlow',
    'home.subtitle': '使用艾森豪威尔矩阵管理任务',
    'home.quickActions': '快速操作',
    'home.addTask': '添加任务',
    'home.viewMatrix': '查看矩阵',
    'home.todayTasks': '今日任务',
    'home.noTasks': '今天没有任务',

    // Tasks
    'tasks.title': '任务管理',
    'tasks.addNew': '添加新任务',
    'tasks.search': '搜索任务...',
    'tasks.filter': '筛选',
    'tasks.all': '全部',
    'tasks.urgent': '紧急',
    'tasks.important': '重要',
    'tasks.completed': '已完成',
    'tasks.pending': '待处理',

    // Statistics
    'stats.title': '统计',
    'stats.overview': '概览',
    'stats.productivity': '生产力',
    'stats.trends': '趋势',
    'stats.totalTasks': '总任务数',
    'stats.completed': '已完成',
    'stats.pending': '待处理',
    'stats.overdue': '逾期',

    // Settings
    'settings.title': '设置',
    'settings.notifications': '通知',
    'settings.theme': '主题和显示',
    'settings.privacy': '隐私和安全',
    'settings.general': '常规',
    'settings.language': '语言',
    'settings.backup': '自动备份',
    'settings.offline': '离线模式',
    'settings.fontSize': '字体大小',
    'settings.colorScheme': '配色方案',

    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.done': '完成',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.success': '成功',
    'common.clear': '清除',
    'common.copy': '复制',

    // Quadrants
    'quadrant.urgent-important.title': '立即执行',
    'quadrant.urgent-important.subtitle': '紧急且重要',
    'quadrant.urgent-important.description': '需要立即关注的任务',
    'quadrant.not-urgent-important.title': '安排计划',
    'quadrant.not-urgent-important.subtitle': '不紧急但重要',
    'quadrant.not-urgent-important.description': '需要规划和安排的任务',
    'quadrant.urgent-not-important.title': '委托他人',
    'quadrant.urgent-not-important.subtitle': '紧急但不重要',
    'quadrant.urgent-not-important.description': '可以委托或快速完成的任务',
    'quadrant.not-urgent-not-important.title': '删除',
    'quadrant.not-urgent-not-important.subtitle': '不紧急且不重要',
    'quadrant.not-urgent-not-important.description': '应该消除或最小化的任务',
    'quadrant.noTasks': '这里还没有任务',

    // Transliteration
    'transliteration.title': '音译工具',
    'transliteration.sourceLanguage': '源语言',
    'transliteration.targetLanguage': '目标语言',
    'transliteration.direction': '音译方向',
    'transliteration.auto': '自动',
    'transliteration.toLatin': '转为拉丁文',
    'transliteration.fromLatin': '从拉丁文转换',
    'transliteration.inputText': '输入文本',
    'transliteration.outputText': '输出文本',
    'transliteration.inputPlaceholder': '输入要音译的文本...',
    'transliteration.transliterate': '音译',
    'transliteration.confidence': '置信度',
    'transliteration.detectedLanguage': '检测到的语言',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('id');
  const [transliterationEnabled, setTransliterationEnabledState] = useState<boolean>(false);

  useEffect(() => {
    loadLanguage();
    loadTransliterationSetting();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      console.log('🔍 Loading saved language:', savedLanguage);
      if (savedLanguage && ['id', 'en', 'ms', 'ar', 'zh'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
        console.log('✅ Language loaded and set to:', savedLanguage);
      } else {
        console.log('📝 No saved language found, using default: id');
      }
    } catch (error) {
      console.log('❌ Error loading language:', error);
    }
  };

  const loadTransliterationSetting = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem('transliteration_enabled');
      if (savedSetting !== null) {
        setTransliterationEnabledState(JSON.parse(savedSetting));
      }
    } catch (error) {
      console.log('Error loading transliteration setting:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      console.log('🌐 Setting language to:', lang);
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
      console.log('✅ Language saved and state updated to:', lang);
    } catch (error) {
      console.log('❌ Error saving language:', error);
    }
  };

  const setTransliterationEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('transliteration_enabled', JSON.stringify(enabled));
      setTransliterationEnabledState(enabled);
    } catch (error) {
      console.log('Error saving transliteration setting:', error);
    }
  };

  const t = (key: string): string => {
    const translation = (translations[language] as Record<string, string>)[key];
    if (!translation) {
      console.log(`⚠️ Missing translation for key "${key}" in language "${language}"`);
      return key;
    }
    return translation;
  };

  // Check if current language is RTL
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        transliterationEnabled,
        setTransliterationEnabled
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };

