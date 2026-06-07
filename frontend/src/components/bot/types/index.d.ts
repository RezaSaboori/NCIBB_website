// Type definitions for bot components and hooks

// Theme types
export interface ThemeConfig {
  background: number;
  fogColor: number;
  envBackground: number;
  bloomStrength: number;
  orbitColor: number;
  orbitEmissive: number;
  particleColor: number;
  buttonColor: string;
  buttonHoverColor: string;
  buttonTextColor: string;
}

export interface Theme {
  isDarkMode: boolean;
  themeKey: string;
  currentTheme: ThemeConfig;
  toggleTheme: () => void;
}

// Scene configuration
export interface SceneConfig {
  orbitCount: number;
  baseRadius: number;
  radiusSpacing: number;
  particleDensity: number;
  baseParticleSize: number;
  orbitThickness: number;
  speed: number;
  waveSpeed: number;
  waveFrequency: number;
  waveHeight: number;
  waveDecay: number;
  orbitShapeAmplitude: number;
  orbitShapeFrequency: number;
  coreRadius: number;
  coreColor: number;
  orbitVerticalOffset: number;
  glassBrightnessBoost: number;
  coreTransitionDuration: number;
  coreLightSun: number;
  coreLightGlass: number;
  sunEmissiveTarget: number;
  eyeWidth: number;
  eyeHeight: number;
  eyeSeparation: number;
  eyeBaseY: number;
  spacingBuffer: number;
  targetIgnition: number;
  currentIgnition: number;
  lightColor: number;
  bloomRadius: number;
  bloomThreshold: number;
}

// Hook return types
export interface IntroAnimationResult {
  active: boolean;
  isFinished: boolean;
  progressRef: React.MutableRefObject<number>;
  getPhaseProgress: (phase: number) => number;
}

export interface CoreHideAnimationResult {
  eyeCloseFactor: number;
  eyeOpacity: number;
  coreScale: number;
  coreOpacity: number;
  coreBlur: string;
  isFullyHidden: boolean;
  isActive: boolean;
}

export interface BlinkFSMResult {
  eyeScaleY: number;
}

export interface AttentionTrackingResult {
  lookAtRef: React.MutableRefObject<{ x: number; y: number }>;
}

export interface BotStateResult {
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
  ignitionValue: number;
  setIgnitionValue: (value: number) => void;
  coreMode: 'sun' | 'glass';
  toggleCoreMode: () => void;
}

// Component props
export interface HarmonicDensityProps {
  children?: React.ReactNode;
}

export interface CoreSphereProps {
  theme: Theme;
  intro: IntroAnimationResult;
  hideAnimation: CoreHideAnimationResult | null;
  isGlass: boolean;
}

export interface EyesProps {
  theme: Theme;
  intro: IntroAnimationResult;
  hideAnimation: CoreHideAnimationResult;
}

export interface OrbitLinesProps {
  theme: Theme;
  intro: IntroAnimationResult;
  orbitIndex: number;
  totalOrbits: number;
  rippleOffset: number;
}

export interface OrbitSystemProps {
  theme: Theme;
  intro: IntroAnimationResult;
  hideAnimation: CoreHideAnimationResult | null;
}

export interface ParticleInstancesProps {
  theme: Theme;
  intro: IntroAnimationResult;
  orbitIndex: number;
  rippleOffset: number;
}

export interface UIControlsProps {
  intro: IntroAnimationResult;
  theme: Theme;
  ignitionValue: number;
  onIgnitionChange: (value: number) => void;
  isGlass: boolean;
  toggleCoreMode: () => void;
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
  toggleTheme: () => void;
}

export interface PostProcessingProps {
  theme: Theme;
  intro: IntroAnimationResult;
}

// Configuration module declarations
declare module '../config/themeConfig' {
  export const THEMES: Record<'dark' | 'light', ThemeConfig>;
}

declare module '../config/sceneConfig' {
  export const CONFIG: SceneConfig;
}
