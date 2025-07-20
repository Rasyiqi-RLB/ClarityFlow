import React from 'react';
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

const { width } = Dimensions.get('window');
const isDesktop = width > 1024 && Platform.OS === 'web';

interface GestureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface GestureTooltipProps {
  visible: boolean;
  onClose: () => void;
  onHidePermanently?: () => void;
}

const GESTURE_DATA: GestureItem[] = [
  {
    id: 'swipe-right',
    title: '👉 Complete',
    description: 'Swipe right',
    icon: 'checkmark.circle',
    color: '#10B981'
  },
  {
    id: 'swipe-left',
    title: '👈 Delete',
    description: 'Swipe left',
    icon: 'trash',
    color: '#EF4444'
  },
  {
    id: 'long-press-drag',
    title: '✋ Move',
    description: 'Long press + drag',
    icon: 'hand.raised',
    color: '#F59E0B'
  },
  {
    id: 'tap-edit',
    title: '👆 Edit',
    description: 'Tap to edit',
    icon: 'pencil',
    color: '#8B5CF6'
  }
];

export const GestureTooltip: React.FC<GestureTooltipProps> = ({ visible, onClose, onHidePermanently }) => {
  const renderGestureItem = (item: GestureItem) => {
    return (
      <View key={item.id} style={styles.gestureItem}>
        <View style={styles.gestureHeader}>
          <View style={[styles.gestureIcon, { backgroundColor: item.color + '20' }]}>
            <IconSymbol name={item.icon as any} size={16} color={item.color} />
          </View>
          <View style={styles.gestureText}>
            <Text style={styles.gestureTitle}>{item.title}</Text>
            <Text style={styles.gestureDescription}>{item.description}</Text>
          </View>
        </View>
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
              <IconSymbol name="hand.raised" size={24} color="#F59E0B" />
              <Text style={styles.headerTitle}>Gesture Guide</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol name="xmark" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.introSection}>
              <Text style={styles.introTitle}>Task Gestures</Text>
            </View>

            <View style={styles.gestureList}>
              {GESTURE_DATA.map(renderGestureItem)}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 Matrix gestures only
            </Text>
            {onHidePermanently && (
              <TouchableOpacity
                style={styles.hideButton}
                onPress={onHidePermanently}
              >
                <Text style={styles.hideButtonText}>Don't show this again</Text>
              </TouchableOpacity>
            )}
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
    padding: 12,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  desktopContainer: {
    maxWidth: 450,
    maxHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
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
  content: {
    flex: 1,
  },
  introSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  gestureList: {
    padding: 16,
  },
  gestureItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  gestureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gestureIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gestureText: {
    flex: 1,
  },
  gestureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  gestureDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  hideButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'center',
  },
  hideButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GestureTooltip;
