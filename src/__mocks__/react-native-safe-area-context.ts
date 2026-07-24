/**
 * Mock react-native-safe-area-context for Jest tests
 */
import React from 'react';

export const SafeAreaView = ({ children, ...props }: { children?: React.ReactNode; [k: string]: unknown }) =>
  React.createElement('SafeAreaView', props, children);

export const SafeAreaProvider = ({ children }: { children?: React.ReactNode }) => children;

export const useSafeAreaInsets = jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
export const useSafeAreaFrame  = jest.fn().mockReturnValue({ x: 0, y: 0, width: 390, height: 844 });
export const SafeAreaInsetsContext = { Consumer: ({ children }: { children: (v: unknown) => unknown }) => children({ top: 0, bottom: 0, left: 0, right: 0 }) };

export const initialWindowMetrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, bottom: 0, left: 0, right: 0 } };

export default {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
  initialWindowMetrics,
};
