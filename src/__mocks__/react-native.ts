/**
 * Minimal react-native mock for Node.js unit test environment.
 * Provides only the APIs used by the files being tested.
 * For component tests, use jest-expo preset instead (full RN env).
 */

export const StyleSheet = {
  hairlineWidth: 1,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Jest mock: StyleSheet.create returns the same object at runtime
  create: (styles: Record<string, any>) => styles,
  flatten: (style: unknown) => style,
  compose: (style1: unknown, style2: unknown) => [style1, style2],
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
};

export const Platform = {
  OS: 'ios' as const,
  Version: 16,
  select: (specifics: Partial<Record<'ios' | 'android' | 'native' | 'default', unknown>>) => specifics.ios ?? specifics.native ?? specifics.default,
};

export const Dimensions = {
  get: (_dim: string) => ({ width: 390, height: 844, scale: 2, fontScale: 2 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const Animated = {
  Value: jest.fn().mockImplementation((val: number) => ({ _value: val })),
  timing: jest.fn().mockReturnValue({ start: jest.fn() }),
  spring: jest.fn().mockReturnValue({ start: jest.fn() }),
  View: 'Animated.View',
};

export const View = 'View';
export const Text = 'Text';
export const TouchableOpacity = 'TouchableOpacity';
export const Pressable = 'Pressable';
export const Image = 'Image';
export const ScrollView = 'ScrollView';
export const FlatList = 'FlatList';
export const TextInput = 'TextInput';
export const Modal = 'Modal';
export const ActivityIndicator = 'ActivityIndicator';

export const Alert = { alert: jest.fn() };
export const Vibration = { vibrate: jest.fn() };
export const Keyboard = { dismiss: jest.fn(), addListener: jest.fn() };

export const AccessibilityInfo = { isReduceMotionEnabled: jest.fn().mockResolvedValue(false) };

export default {
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Vibration,
  Keyboard,
  AccessibilityInfo,
};
