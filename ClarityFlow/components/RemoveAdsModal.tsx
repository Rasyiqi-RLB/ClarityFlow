import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import PurchaseService, { PurchaseProduct } from '../services/purchaseService';
// Alternative: import purchaseServiceNative, { PurchaseProduct } from '../services/purchaseServiceNative';

interface RemoveAdsModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

const RemoveAdsModal: React.FC<RemoveAdsModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
}) => {
  const { colors, getFontSize } = useTheme();
  const { t } = useLanguage();
  const [products, setProducts] = useState<PurchaseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const availableProducts = await PurchaseService.getProducts();
      setProducts(availableProducts.filter(p => p.type === 'remove_ads' || p.type === 'lifetime'));
    } catch (error) {
      console.error('Failed to load products:', error);
      Alert.alert('Error', 'Failed to load purchase options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    setPurchasing(productId);
    try {
      const result = await PurchaseService.purchaseProduct(productId);
      
      if (result.success) {
        Alert.alert(
          '🎉 Purchase Successful!',
          'Ads have been removed from your app. Thank you for your support!',
          [
            {
              text: 'OK',
              onPress: () => {
                onPurchaseSuccess?.();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Purchase Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const result = await PurchaseService.restorePurchases();
      
      if (result.success && result.restored > 0) {
        Alert.alert(
          '✅ Purchases Restored',
          `${result.restored} purchase(s) have been restored.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onPurchaseSuccess?.();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Restore Failed', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = {
    modalBackground: {
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: colors.background.primary,
    },
    title: {
      color: colors.text.primary,
      fontSize: getFontSize(24),
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: getFontSize(16),
    },
    productCard: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.primary,
    },
    productTitle: {
      color: colors.text.primary,
      fontSize: getFontSize(18),
    },
    productDescription: {
      color: colors.text.secondary,
      fontSize: getFontSize(14),
    },
    productPrice: {
      color: colors.primary,
      fontSize: getFontSize(20),
    },
    purchaseButton: {
      backgroundColor: colors.primary,
    },
    purchaseButtonText: {
      color: colors.text.inverse,
      fontSize: getFontSize(16),
    },
    restoreButton: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.primary,
    },
    restoreButtonText: {
      color: colors.text.primary,
      fontSize: getFontSize(16),
    },
    closeButton: {
      backgroundColor: colors.background.secondary,
    },
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalBackground, dynamicStyles.modalBackground]}>
        <View style={[styles.modalContent, dynamicStyles.modalContent]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>
              🚫 Remove Ads
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, dynamicStyles.closeButton]}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Benefits */}
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Enjoy ClarityFlow without interruptions:
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.benefitText, { color: colors.text.primary, fontSize: getFontSize(14) }]}>
                  No banner ads
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.benefitText, { color: colors.text.primary, fontSize: getFontSize(14) }]}>
                  No interstitial ads
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.benefitText, { color: colors.text.primary, fontSize: getFontSize(14) }]}>
                  Cleaner interface
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.benefitText, { color: colors.text.primary, fontSize: getFontSize(14) }]}>
                  Support development
                </Text>
              </View>
            </View>

            {/* Products */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text.secondary, fontSize: getFontSize(14) }]}>
                  Loading purchase options...
                </Text>
              </View>
            ) : (
              <View style={styles.productsContainer}>
                {products.map((product) => (
                  <View key={product.id} style={[styles.productCard, dynamicStyles.productCard]}>
                    <View style={styles.productInfo}>
                      <Text style={[styles.productTitle, dynamicStyles.productTitle]}>
                        {product.title}
                      </Text>
                      <Text style={[styles.productDescription, dynamicStyles.productDescription]}>
                        {product.description}
                      </Text>
                    </View>
                    
                    <View style={styles.productAction}>
                      <Text style={[styles.productPrice, dynamicStyles.productPrice]}>
                        {product.price}
                      </Text>
                      <TouchableOpacity
                        style={[styles.purchaseButton, dynamicStyles.purchaseButton]}
                        onPress={() => handlePurchase(product.id)}
                        disabled={purchasing === product.id}
                      >
                        {purchasing === product.id ? (
                          <ActivityIndicator size="small" color={colors.text.inverse} />
                        ) : (
                          <Text style={[styles.purchaseButtonText, dynamicStyles.purchaseButtonText]}>
                            Purchase
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Restore Button */}
            <TouchableOpacity
              style={[styles.restoreButton, dynamicStyles.restoreButton]}
              onPress={handleRestore}
              disabled={loading}
            >
              <Text style={[styles.restoreButtonText, dynamicStyles.restoreButtonText]}>
                Restore Purchases
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
    lineHeight: 22,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
  },
  productsContainer: {
    marginBottom: 20,
  },
  productCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  productInfo: {
    marginBottom: 12,
  },
  productTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    lineHeight: 20,
  },
  productAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontWeight: 'bold',
  },
  purchaseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontWeight: 'bold',
  },
  restoreButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  restoreButtonText: {
    fontWeight: '600',
  },
});

export default RemoveAdsModal;
