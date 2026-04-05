/**
 * Mock expo-haptics
 */
export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
  Rigid: 'rigid',
  Soft: 'soft',
};

export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
};

export const impactAsync = jest.fn().mockResolvedValue(undefined);
export const notificationAsync = jest.fn().mockResolvedValue(undefined);
export const selectionAsync = jest.fn().mockResolvedValue(undefined);

export default { impactAsync, notificationAsync, selectionAsync, ImpactFeedbackStyle, NotificationFeedbackType };
