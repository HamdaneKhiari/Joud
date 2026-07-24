import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, ReduceMotion } from 'react-native-reanimated';
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
      {isPlayful && (
        <>
          <Animated.View
            entering={FadeIn.duration(800).reduceMotion(ReduceMotion.System)}
            style={styles.decorativeCircle}
          />
          <Animated.View
            entering={FadeIn.duration(800).delay(200).reduceMotion(ReduceMotion.System)}
            style={styles.decorativeCircleSmall}
          />
        </>
      )}

      <View style={styles.headerContent}>
        <View style={styles.welcomeSection}>
          {isPlayful && !!identity.header.emoji && (
            <Animated.View
              entering={FadeInDown.delay(100).springify().reduceMotion(ReduceMotion.System)}
              style={styles.emojiContainer}
            >
              <Text style={styles.emoji}>{identity.header.emoji}</Text>
            </Animated.View>
          )}

          <Animated.Text
            entering={FadeInDown.delay(200).springify().reduceMotion(ReduceMotion.System)}
            style={styles.greeting}
          >
            {identity.header.welcomeText}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(300).springify().reduceMotion(ReduceMotion.System)}
            style={styles.userName}
          >
            {user.name}
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInRight.delay(400).springify().reduceMotion(ReduceMotion.System)}
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
