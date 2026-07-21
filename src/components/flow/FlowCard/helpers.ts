export const isEmoji = (str: string): boolean => {
  const iconNamePattern = /^[a-z0-9-]+$/;
  return !iconNamePattern.test(str);
};
