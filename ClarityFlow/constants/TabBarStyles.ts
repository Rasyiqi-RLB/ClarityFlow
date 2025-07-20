/**
 * Tab Bar Styling Constants
 * Konstanta untuk styling tab bar yang konsisten dan mudah dimaintain
 */

import type { TabBarStyleType } from '@/types/performance';

export const TAB_BAR_CONSTANTS = {
  // Dimensi
  HEIGHT: 70,
  BORDER_RADIUS: 20,
  PADDING_TOP: 10,
  PADDING_BOTTOM: 10,
  
  // Warna
  BACKGROUND_COLOR: '#000000',
  BORDER_COLOR: '#000000',
  
  // Shadow Configuration
  SHADOW: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Border
  BORDER: {
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  // Position
  POSITION: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
  },
} as const;

/**
 * Tab Bar Style Object
 * Style object yang siap digunakan untuk tabBarStyle
 */
export const TAB_BAR_STYLE: TabBarStyleType = {
  backgroundColor: TAB_BAR_CONSTANTS.BACKGROUND_COLOR,
  borderTopWidth: TAB_BAR_CONSTANTS.BORDER.borderTopWidth,
  borderTopColor: TAB_BAR_CONSTANTS.BORDER_COLOR,
  ...TAB_BAR_CONSTANTS.SHADOW,
  height: TAB_BAR_CONSTANTS.HEIGHT,
  paddingTop: TAB_BAR_CONSTANTS.PADDING_TOP,
  paddingBottom: TAB_BAR_CONSTANTS.PADDING_BOTTOM,
  justifyContent: 'center',
  borderTopLeftRadius: TAB_BAR_CONSTANTS.BORDER.borderTopLeftRadius,
  borderTopRightRadius: TAB_BAR_CONSTANTS.BORDER.borderTopRightRadius,
  ...TAB_BAR_CONSTANTS.POSITION,
} as const;

/**
 * Add Task Icon Styling Constants
 */
export const ADD_TASK_ICON_CONSTANTS = {
  // Container
  CONTAINER: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: -35,
  },
  
  // Shadow
  SHADOW: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Z-Index
  Z_INDEX: 999,
  POSITION: 'relative' as const,
  
  // Icon
  ICON: {
    name: 'add' as const,
    size: 30,
    color: '#007AFF',
  },
} as const;

/**
 * Add Task Icon Style Object
 * Style object yang siap digunakan untuk ikon add-task
 */
export const ADD_TASK_ICON_STYLE = {
  ...ADD_TASK_ICON_CONSTANTS.CONTAINER,
  ...ADD_TASK_ICON_CONSTANTS.SHADOW,
  zIndex: ADD_TASK_ICON_CONSTANTS.Z_INDEX,
  position: ADD_TASK_ICON_CONSTANTS.POSITION,
} as const;