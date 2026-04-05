/**
 * Mock react-native-reanimated — stub complet sans dépendances natives
 *
 * Le mock officiel (react-native-reanimated/mock) échoue en env node
 * car il require react-native-worklets qui appelle des modules natifs.
 * Ce stub couvre tout ce qui est utilisé dans le projet.
 */

const React = require('react');
const { View, Text, ScrollView, Image, FlatList } = require('react-native');

// ─── Stub helpers ────────────────────────────────────────────────────────────
const NOOP = () => {};
const ID = <T,>(x: T) => x;
const makeEntryAnimation = () => ({
  duration: () => makeEntryAnimation(),
  delay: () => makeEntryAnimation(),
  springify: () => makeEntryAnimation(),
  damping: () => makeEntryAnimation(),
  stiffness: () => makeEntryAnimation(),
  mass: () => makeEntryAnimation(),
  reduceMotion: () => makeEntryAnimation(),
  withInitialValues: () => makeEntryAnimation(),
  easing: () => makeEntryAnimation(),
});

// ─── Entry / Exit animations ──────────────────────────────────────────────────
export const FadeIn = makeEntryAnimation();
export const FadeInDown = makeEntryAnimation();
export const FadeInUp = makeEntryAnimation();
export const FadeInLeft = makeEntryAnimation();
export const FadeInRight = makeEntryAnimation();
export const FadeOut = makeEntryAnimation();
export const FadeOutDown = makeEntryAnimation();
export const FadeOutUp = makeEntryAnimation();
export const SlideInDown = makeEntryAnimation();
export const SlideInUp = makeEntryAnimation();
export const SlideOutDown = makeEntryAnimation();
export const ZoomIn = makeEntryAnimation();
export const ZoomOut = makeEntryAnimation();
export const BounceIn = makeEntryAnimation();
export const Layout = makeEntryAnimation();
export const LinearTransition = makeEntryAnimation();

// ─── Shared values & animated styles ─────────────────────────────────────────
export const useSharedValue = <T,>(init: T) => {
  const ref = React.useRef({ value: init });
  return ref.current;
};

export const useAnimatedStyle = (fn: () => object) => {
  try { return fn(); } catch { return {}; }
};

export const useAnimatedProps = (fn: () => object) => {
  try { return fn(); } catch { return {}; }
};

export const useDerivedValue = <T,>(fn: () => T) => {
  const ref = React.useRef({ value: fn() });
  return ref.current;
};

export const useAnimatedScrollHandler = () => NOOP;
export const useAnimatedGestureHandler = () => ({});
export const useAnimatedRef = () => React.useRef(null);
export const useScrollViewOffset = () => ({ value: 0 });
export const useAnimatedReaction = NOOP;
export const useEvent = () => NOOP;

// ─── Animation functions ──────────────────────────────────────────────────────
export const withTiming = ID;
export const withSpring = ID;
export const withDecay = ID;
export const withDelay = (_delay: number, anim: unknown) => anim;
export const withSequence = (..._args: unknown[]) => 0;
export const withRepeat = ID;
export const cancelAnimation = NOOP;
export const interpolate = (_val: number, _in: number[], _out: number[]) => 0;
export const interpolateColor = (_val: number, _in: number[], _out: string[]) => _out[0];
export const runOnJS = <T extends (...args: unknown[]) => unknown>(fn: T) => fn;
export const runOnUI = <T extends (...args: unknown[]) => unknown>(fn: T) => fn;
export const makeMutable = <T,>(init: T) => ({ value: init });

// ─── Easing ───────────────────────────────────────────────────────────────────
export const Easing = {
  linear: ID,
  ease: ID,
  out: ID,
  in: ID,
  inOut: ID,
  elastic: () => ID,
  bounce: ID,
  bezier: () => ID,
};

// ─── Animated components ──────────────────────────────────────────────────────
export const createAnimatedComponent = <T,>(Component: T): T => Component;

const AnimatedView = View;
const AnimatedText = Text;
const AnimatedScrollView = ScrollView;
const AnimatedImage = Image;
const AnimatedFlatList = FlatList;

const Animated = {
  View: AnimatedView,
  Text: AnimatedText,
  ScrollView: AnimatedScrollView,
  Image: AnimatedImage,
  FlatList: AnimatedFlatList,
  createAnimatedComponent,
};

// ─── Enums & constants ────────────────────────────────────────────────────────
export const Extrapolation = { CLAMP: 'clamp', IDENTITY: 'identity', EXTEND: 'extend' };
export const ReduceMotion = { System: 'system', Always: 'always', Never: 'never' };
export const SensorType = { ACCELEROMETER: 0, GYROSCOPE: 1, GRAVITY: 2, MAGNETIC_FIELD: 3, ROTATION: 4 };

// ─── Test utilities (no-op) ───────────────────────────────────────────────────
export const setUpTests = NOOP;
export const advanceAnimationByTime = NOOP;
export const advanceAnimationByFrame = NOOP;
export const withReanimatedTimer = (fn: () => void) => fn();
export const getAnimatedStyle = (_ref: unknown) => ({});

export { Animated };
export default Animated;
