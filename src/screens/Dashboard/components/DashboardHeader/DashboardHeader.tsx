/**
 * ============================================
 * DashboardHeader - Version Dynamique
 * 100% White Label + Mood-Aware + Animations
 * ============================================
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '@/themes/ThemeContext';
import ThemeContainer from '@/themes/ThemeContainer';
import { createStyles } from './headerStyles';

interface DashboardHeaderProps {
  user: {
    name: string;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { identity } = useTheme();
  const styles = createStyles(identity);

  if (!identity) return null;

  const isPlayful = identity.ui.mood === 'playful';

  return (
    <ThemeContainer identity={identity} style={styles.header} rounded>
      {/* Décorations (Playful uniquement) */}
      {isPlayful && (
        <>
          <Animated.View
            entering={FadeIn.duration(800)}
            style={styles.decorativeCircle}
          />
          <Animated.View
            entering={FadeIn.duration(800).delay(200)}
            style={styles.decorativeCircleSmall}
          />
        </>
      )}

      <View style={styles.headerContent}>
        {/* Gauche: Bonjour [Nom] */}
        <View style={styles.welcomeSection}>
          {/* Emoji dynamique (Playful uniquement) */}
          {isPlayful && !!identity.header.emoji && (
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.emojiContainer}
            >
              <Text style={styles.emoji}>{identity.header.emoji}</Text>
            </Animated.View>
          )}

          <Animated.Text
            entering={FadeInDown.delay(200).springify()}
            style={styles.greeting}
          >
            {identity.header.welcomeText}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={styles.userName}
          >
            {user.name}
          </Animated.Text>
        </View>

        {/* Droite: Nom de l'organisation */}
        <Animated.View
          entering={FadeInRight.delay(400).springify()}
          style={styles.organizationSection}
        >
          <Text style={styles.organizationName}>
            {identity.organizationName}
          </Text>
        </Animated.View>
      </View>
    </ThemeContainer>
  );
};

export default DashboardHeader;
