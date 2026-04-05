/**
 * Mock expo-linear-gradient
 */
const React = require('react');

export const LinearGradient = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
  React.createElement('LinearGradient', props, children);

export default { LinearGradient };
