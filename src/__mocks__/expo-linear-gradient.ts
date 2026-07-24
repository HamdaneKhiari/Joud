/**
 * Mock expo-linear-gradient
 */
import React from 'react';

export const LinearGradient = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
  React.createElement('LinearGradient', props, children);

export default { LinearGradient };
