// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Basic icons
  'house': 'home',
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  // Tab navigation icons
  'square.grid.2x2': 'grid-view',
  'square.grid.2x2.fill': 'grid-view',
  'lightbulb': 'lightbulb-outline',
  'lightbulb.fill': 'lightbulb',
  'plus.circle': 'add-circle-outline',
  'plus.circle.fill': 'add-circle',
  'chart.bar': 'bar-chart',
  'chart.bar.fill': 'bar-chart',
  'person': 'person-outline',
  'person.fill': 'person',
  // Header icons
  'bell': 'notifications-none',
  'bell.fill': 'notifications',
  'moon': 'brightness-2',
  'moon.fill': 'brightness-2',
  'sun.max': 'wb-sunny',
  'sun.max.fill': 'wb-sunny',
  'questionmark.circle': 'help-outline',
  'questionmark.circle.fill': 'help',
  'xmark': 'close',
  'hand.raised': 'pan-tool',
  'checkmark.circle': 'check-circle',
  'checkmark.circle.fill': 'check-circle',
  'trash': 'delete',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'pencil.fill': 'edit',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];
  if (!iconName) {
    console.warn(`Icon mapping not found for: ${name}`);
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
