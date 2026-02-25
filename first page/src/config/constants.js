// Theme-related colors are now in src/config/theme.js
export const COLORS = {};

export const SCROLL_CONFIG = {
  FIRST_PAGE_START: 0.1,
  FIRST_PAGE_END: 0.5,
  SECOND_PAGE_START: 0.5,
  SECOND_PAGE_END: 0.85,
  SECONDARY_BOX_OFFSET: 35, // vh
  FIRST_PAGE_TRANSLATE_MULTIPLIER: 6,
  FIRST_PAGE_MAX_TRANSLATE: 10, // vh
  BLUR_MULTIPLIER: 10,
  SECONDARY_BLUR_MULTIPLIER: 6,
};

export const ANIMATION_CONFIG = {
  AURORA_DELAY: 600, // ms
  SCROLL_ANIMATION_SPEED: 0.7,
  SCROLL_CHECK_INTERVAL: 16, // ms
  SCROLL_THRESHOLD: 0.001,
};

export const CARDIO_BACKGROUND_CONFIG = {
  QUALITY: 'auto',
  AUTO_ROTATE: false,
  INTERACTIVE: true,
  ENABLE_DRAG_ROTATION: false,
  ENABLE_WHEEL_ZOOM: false,
  CONTENT_OFFSET: { x: 0.25, y: 0 },
};

export const INTERSECTION_OBSERVER_CONFIG = {
  THRESHOLD: 0.1,
};

