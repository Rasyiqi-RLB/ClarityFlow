import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

const { width, height } = Dimensions.get('window');
const isDesktop = width > 1024 && Platform.OS === 'web';

interface TooltipItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: 'navigation' | 'actions' | 'gestures' | 'features';
}

interface TooltipProps {
  visible: boolean;
  onClose: () => void;
}

const TOOLTIP_DATA: TooltipItem[] = [
  // Navigation
  {
    id: 'matrix',
    title: 'Matrix',
    description: 'Eisenhower Matrix untuk mengorganisir task berdasarkan urgency dan importance',
    icon: 'square.grid.2x2',
    category: 'navigation'
  },
  {
    id: 'insight',
    title: 'Insight',
    description: 'AI-powered insights dan analisis untuk produktivitas yang lebih baik',
    icon: 'lightbulb',
    category: 'navigation'
  },
  {
    id: 'add-task',
    title: 'Add Task',
    description: 'Buat task baru dengan AI assistance untuk kategorisasi otomatis',
    icon: 'plus.circle',
    category: 'navigation'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Lihat statistik dan progress task management Anda',
    icon: 'chart.bar',
    category: 'navigation'
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Pengaturan profil, preferences, dan manajemen akun',
    icon: 'person',
    category: 'navigation'
  },
  
  // Actions
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Notifikasi untuk deadline, reminder, dan update penting',
    icon: 'bell',
    category: 'actions'
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    description: 'Toggle antara light dan dark theme untuk kenyamanan mata',
    icon: 'moon',
    category: 'actions'
  },
  
  // Gestures
  {
    id: 'swipe-complete',
    title: 'Swipe Right',
    description: 'Swipe task card ke kanan untuk mark as complete',
    category: 'gestures'
  },
  {
    id: 'swipe-delete',
    title: 'Swipe Left',
    description: 'Swipe task card ke kiri untuk delete task',
    category: 'gestures'
  },
  {
    id: 'long-press-drag',
    title: 'Long Press + Drag',
    description: 'Long press task card (0.5s) kemudian drag untuk pindah antar quadrant',
    category: 'gestures'
  },
  {
    id: 'tap-edit',
    title: 'Tap to Edit',
    description: 'Tap task card untuk membuka detail dan edit task',
    category: 'gestures'
  },
  
  // Features
  {
    id: 'ai-categorization',
    title: 'AI Categorization',
    description: 'AI otomatis mengkategorikan task ke quadrant yang tepat',
    category: 'features'
  },
  {
    id: 'smart-scheduling',
    title: 'Smart Scheduling',
    description: 'AI memberikan saran waktu optimal untuk menyelesaikan task',
    category: 'features'
  },
  {
    id: 'priority-suggestions',
    title: 'Priority Suggestions',
    description: 'AI menganalisis dan memberikan saran prioritas berdasarkan deadline',
    category: 'features'
  }
];

const CATEGORIES = {
  navigation: { title: 'Navigation', icon: 'square.grid.2x2', color: '#3B82F6' },
  actions: { title: 'Actions', icon: 'bell', color: '#10B981' },
  gestures: { title: 'Gestures', icon: 'hand.raised', color: '#F59E0B' },
  features: { title: 'AI Features', icon: 'lightbulb', color: '#8B5CF6' }
};

export const Tooltip: React.FC<TooltipProps> = ({ visible, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('navigation');

  const filteredTooltips = TOOLTIP_DATA.filter(item => item.category === selectedCategory);

  const renderCategoryButton = (categoryKey: string) => {
    const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES];
    const isSelected = selectedCategory === categoryKey;
    
    return (
      <TouchableOpacity
        key={categoryKey}
        style={[
          styles.categoryButton,
          isSelected && { backgroundColor: category.color + '20', borderColor: category.color }
        ]}
        onPress={() => setSelectedCategory(categoryKey)}
      >
        <IconSymbol 
          name={category.icon as any} 
          size={16} 
          color={isSelected ? category.color : '#6B7280'} 
        />
        <Text style={[
          styles.categoryButtonText,
          isSelected && { color: category.color, fontWeight: '600' }
        ]}>
          {category.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTooltipItem = (item: TooltipItem) => {
    const category = CATEGORIES[item.category];
    
    return (
      <View key={item.id} style={styles.tooltipItem}>
        <View style={styles.tooltipHeader}>
          {item.icon && (
            <View style={[styles.tooltipIcon, { backgroundColor: category.color + '20' }]}>
              <IconSymbol name={item.icon as any} size={20} color={category.color} />
            </View>
          )}
          <Text style={styles.tooltipTitle}>{item.title}</Text>
        </View>
        <Text style={styles.tooltipDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, isDesktop && styles.desktopContainer]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <IconSymbol name="questionmark.circle" size={24} color="#3B82F6" />
              <Text style={styles.headerTitle}>Help & Tips</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol name="xmark" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {Object.keys(CATEGORIES).map(renderCategoryButton)}
            </ScrollView>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.tooltipList}>
              {filteredTooltips.map(renderTooltipItem)}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 Tip: Hover atau tap pada elemen UI untuk melihat tooltip contextual
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  desktopContainer: {
    maxWidth: 600,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  categoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tooltipList: {
    padding: 20,
  },
  tooltipItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tooltipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default Tooltip;
