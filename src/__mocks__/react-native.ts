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

const makeAnimatedValue = (val: number) => ({
  _value: val,
  setValue: jest.fn(),
  interpolate: jest.fn().mockReturnValue('interpolated'),
  addListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
});

const makeAnimation = () => ({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });

export const Animated = {
  Value: jest.fn().mockImplementation(makeAnimatedValue),
  timing: jest.fn().mockReturnValue(makeAnimation()),
  spring: jest.fn().mockReturnValue(makeAnimation()),
  sequence: jest.fn().mockReturnValue(makeAnimation()),
  parallel: jest.fn().mockReturnValue(makeAnimation()),
  loop: jest.fn().mockReturnValue(makeAnimation()),
  delay: jest.fn().mockReturnValue(makeAnimation()),
  View: 'Animated.View',
  Text: 'Animated.Text',
  Image: 'Animated.Image',
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
export const StatusBar = 'StatusBar';
export const SafeAreaView = 'SafeAreaView';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';

export const Alert = { alert: jest.fn() };
export const Vibration = { vibrate: jest.fn() };
export const Keyboard = { dismiss: jest.fn(), addListener: jest.fn() };

export const AccessibilityInfo = { isReduceMotionEnabled: jest.fn().mockResolvedValue(false) };

export const useColorScheme = jest.fn().mockReturnValue('light');

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
  useColorScheme,
};
