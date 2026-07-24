/**
 * Mock @expo/vector-icons
 * Retourne des composants React factices pour tous les jeux d'icônes
 */
import React from 'react';

const makeIconSet = (name: string) => {
  const Icon = ({ testID, ...props }: { testID?: string; name?: string; size?: number; color?: string }) =>
    React.createElement('Icon', { testID: testID || `icon-${name}`, ...props });
  Icon.displayName = name;
  return Icon;
};

module.exports = {
  MaterialCommunityIcons: makeIconSet('MaterialCommunityIcons'),
  Ionicons: makeIconSet('Ionicons'),
  FontAwesome: makeIconSet('FontAwesome'),
  FontAwesome5: makeIconSet('FontAwesome5'),
  AntDesign: makeIconSet('AntDesign'),
  Entypo: makeIconSet('Entypo'),
  EvilIcons: makeIconSet('EvilIcons'),
  Feather: makeIconSet('Feather'),
  Foundation: makeIconSet('Foundation'),
  MaterialIcons: makeIconSet('MaterialIcons'),
  Octicons: makeIconSet('Octicons'),
  SimpleLineIcons: makeIconSet('SimpleLineIcons'),
  Zocial: makeIconSet('Zocial'),
};
