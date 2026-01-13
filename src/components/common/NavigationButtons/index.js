// ============================================
// FICHIER: src/components/exercise-common/NavigationButtons/index.js
// VERSION ULTRA CLEAN - Style Drops minimaliste
// ============================================

import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './style';
import { useButtonPressAnimation } from '../../../hooks/useButtonPressAnimation';

/**
 * NavigationButtons - Barre de navigation minimaliste et moderne
 * Version ultra clean : juste les boutons précédent/suivant
 */
const NavigationButtons = ({
  isFirst,
  isLast,
  onPrevious,
  onNext,
  onFinish,
  disablePrevious = false,
  disableNext = false,
}) => {
  // Animations pour chaque bouton
  const { scaleAnim: scaleAnimPrev, animate: animatePrev } = useButtonPressAnimation();
  const { scaleAnim: scaleAnimNext, animate: animateNext } = useButtonPressAnimation();

  const handlePrevious = () => {
    const shouldDisable = isFirst || disablePrevious;
    if (!shouldDisable && onPrevious) {
      animatePrev(onPrevious);
    }
  };

  const handleNext = () => {
    if (disableNext) return;

    if (isLast && onFinish) {
      animateNext(onFinish);
    } else if (onNext) {
      animateNext(onNext);
    }
  };

  const isDisabledPrev = isFirst || disablePrevious;
  const isDisabledNext = disableNext;

  return (
    <View style={styles.navigationContainer}>
      {/* Bouton Précédent */}
      <Animated.View style={{ transform: [{ scale: scaleAnimPrev }] }}>
        <TouchableOpacity
          testID="nav-button-previous"
          style={[
            styles.navButton,
            styles.navButtonPrev,
            isDisabledPrev && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={isDisabledPrev}
          activeOpacity={1}
        >
          <Ionicons name="chevron-back" size={28} color={isDisabledPrev ? '#94A3B8' : '#FFFFFF'} />
        </TouchableOpacity>
      </Animated.View>

      {/* Espaceur central */}
      <View style={styles.spacer} />

      {/* Bouton Suivant/Terminer */}
      <Animated.View style={{ transform: [{ scale: scaleAnimNext }] }}>
        <TouchableOpacity
          testID={isLast ? "nav-button-finish" : "nav-button-next"}
          style={[
            styles.navButton,
            isLast ? styles.navButtonFinish : styles.navButtonNext,
            isDisabledNext && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isDisabledNext}
          activeOpacity={1}
        >
          <Ionicons
            name={isLast ? 'checkmark' : 'chevron-forward'}
            size={28}
            color={isDisabledNext ? '#94A3B8' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

NavigationButtons.propTypes = {
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  disablePrevious: PropTypes.bool,
  disableNext: PropTypes.bool,
};

export default NavigationButtons;
