/**
 * Centralized configuration for the Cardio Particle System
 * 
 * This file contains all default settings for:
 * - Heart particle system
 * - Ambient particles Type 1 (Yellow Circles - Noise-based drift)
 * - Ambient particles Type 2 (Curl Flow - Spring-based flow to heart)
 * 
 * COLOR CONFIGURATION:
 * - Colors can be specified as hex codes (e.g., '#FF0000', '#F00', 'FF0000') 
 *   or RGB arrays (e.g., [1.0, 0.0, 0.0])
 * - Hex codes are automatically converted to RGB arrays [0.0-1.0] in getFlatConfig()
 * - Examples:
 *   - White: '#FFFFFF' or [1.0, 1.0, 1.0]
 *   - Red: '#FF0000' or [1.0, 0.0, 0.0]
 *   - Blue: '#0000FF' or [0.0, 0.0, 1.0]
 *   - Short hex: '#F00' (equivalent to '#FF0000')
 */

import { THEME_COLORS } from '../../../config/landing/theme';

/**
 * Convert hex color code to RGB array [r, g, b] with values 0.0-1.0
 * Supports formats: "#RRGGBB", "#RGB", "RRGGBB", "RGB"
 * @param {string|Array<number>} color - Hex color string or RGB array
 * @returns {Array<number>} RGB array [r, g, b] with values 0.0-1.0
 */
export function hexToRgb(color) {
  // If already an array, return as-is (assume it's already RGB)
  if (Array.isArray(color)) {
    return color;
  }
  
  // If not a string, return default white
  if (typeof color !== 'string') {
    return [1.0, 1.0, 1.0];
  }
  
  // Remove # if present
  let hex = color.replace('#', '');
  
  // Handle 3-digit hex (e.g., "FFF" -> "FFFFFF")
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255.0;
  const g = parseInt(hex.substring(2, 4), 16) / 255.0;
  const b = parseInt(hex.substring(4, 6), 16) / 255.0;
  
  return [r, g, b];
}

export const CONFIG = {
  // ========================================
  // HEART PARTICLE SYSTEM
  // ========================================
  heart: {
    // Mouse interaction
    heartGrow: 2,              // Enlargement factor when mouse hovers
    mouseRadius: 0.5,            // Radius of mouse interaction area
    
    // Animation
    heartRate: 0.2,              // Heartbeat rate (higher = faster)
    beatIntensity: 1.0,          // Intensity of heartbeat effect
    
    // Rendering
    heartPointSize: 5.0,         // Size of heart particles
    heartColor: "#dee2e6",            // Heart particle color tint (hex code or RGB array [r, g, b], null = use procedural colors)
    heartDensity: 0.01, // Particle density
    particleCount: 10000, // Reduced from 13000 for better performance
    // Camera
    fov: Math.PI / 4,            // Field of view (45 degrees)
    autoRotate: false,           // Auto-rotation of camera
    
    // Camera Tilt Effect
    cameraTilt: {
      enabled: true,
      strength: 0.1              // How much the camera tilts with mouse movement
    },
    
    // Particle Connections
    connectionsEnabled: true,    // Enable connections between particles
    maxNeighbors: 10,            // Reduced from 10 for performance
    connectionDistance: 0.05,    // Maximum distance for connections (relative to heart size)
    connectionLineWidth: 2.0,    // Line width in pixels
    connectionOpacity: 0.03,      // Base opacity of connections (0-1)
    connectionColor: '#FFFFFF',  // Color of connections (hex code like '#FF0000' or RGB array [1.0, 0.0, 0.0])
    connectionPulse: true,       // Pulse connections with heartbeat
    geodesicThreshold: 10     // Ratio of straight-line to surface distance (higher = more strict surface following)
  },

  // ========================================
  // BACKGROUND GLOW
  // Radial gradient that follows the heart
  // ========================================
  glow: {
    enabled: true,               // Enable/disable glow effect
    intensity: 0.5,              // Glow brightness (0-1)
    radius: 1.,                 // Glow radius multiplier (scales with heart size)
    falloff: 2.0,                // Falloff power (higher = sharper edge)
    color: '#FFFFFF'             // Glow color (hex code like '#FF0000' or RGB array [1.0, 0.0, 0.0])
  },

  // ========================================
  // PORTAL SETTINGS
  // Controls the portal rendering effects
  // ========================================
  portalSwirlSpeed: 0.05,
  portalSmokeDensity: 1.2,
  portalRingRadius: 0.5,
  portalRingThickness: 0.1,
  portalSmokeColor: [1.0, 1.0, 1.0],
  portalFogStart: 0.45,
  portalFogEnd: 0.5,
  portalFogColor: [1.0, 1.0, 1.0],
  portalAberrationStrength: 0.005,
  portalDistortionStrength: 0.01,
  portalDistortionNoiseScale: 0.5,
  portalFloatSpeed: 0.5,        // Speed of floating animation
  portalFloatAmount: 0.02,      // Amount of floating (as fraction of visible size)

  // ========================================
  // DEPTH OF FIELD (DOF) SYSTEM
  // Professional bokeh and focus simulation
  // ========================================
  dof: {
    // DOF enable/disable
    enabled: true,
    
    // Focus settings (focus on the heart, blur ambient particles around it)
    focalDistance: 2.5,          // Focus at heart position (matches camera distance)
    focalRange: 1.3,             // Keep heart area sharp
    
    // Lens simulation
    aperture: 1.4,               // Wide aperture for strong bokeh on ambient particles
    focalLength: 50.0,           // Lens focal length in mm
    
    // Bokeh shape
    bokehShape: 'circle',       // 'circle', 'hexagon', 'octagon'
    bokehIntensity: 0.05,         // Increased for a stronger glow
    bokehScale: 5,             // Increased for larger bokeh shapes
    
    // Depth effects (ambient particles blur based on distance from heart)
    nearBlurStart: 0.5,          // Start blurring ambient particles near camera
    nearBlurStrength: 10.0,       // MUCH stronger blur for close particles
    farBlurStart: 2.0,           // Start blurring distant ambient particles
    farBlurStrength: 9,        // MUCH stronger blur for far particles
    
    // Atmospheric effects
    depthDarkening: 0.2,         // Gentle darkening
    depthDesaturation: 0.15,     // Gentle desaturation
    atmosphericFade: 0.5,        // Gentle fade
    
    // Chromatic aberration (for supernatural effect)
    chromaticAberration: 0.4,    // Kept for a nice effect
    
    // Advanced bokeh
    bokehRotation: 0.0,          // Rotation of bokeh shape in radians
    bokehRoundness: 0.6,         // Semi-polygonal hexagons
    bokehFalloff: 1.5,           // How quickly bokeh brightness falls off from center (1.0 = linear)
    blurFadeStrength: 1.5        // MUCH stronger fade out with blur (was 0.75)
  },

  // ========================================
  // AMBIENT PARTICLES - TYPE 1 (YELLOW CIRCLES)
  // Noise-based floating particles
  // ========================================
  ambientType1: {
    // Basic properties
    enabled: true,
    count: 500,                 // Reduced from 1000
    size: 4.0,                   // Particle size
    color: '#ced4da',            // Particle color (hex code like '#FFFF00' or RGB array [1.0, 1.0, 0.0])
    
    // Area restriction (spherical boundary)
    areaMultiplier: 8,         // Multiplier for sphere radius relative to heart
    width: null,                 // Custom radius override (null = use multiplier)
    
    // Movement
    particleSpeed: 0.5,          // Overall movement speed multiplier
    
    // Noise behavior
    noiseScale: 0.1,            // Spatial frequency of noise
    noiseSpeed: 0.1,             // How fast noise changes over time
    noiseStrength: 0.5,          // Intensity of noise influence
    
    // Diffusion & clustering prevention
    diffusion: 0.01,             // Random movement to prevent clustering
    repulsionRadius: 5.0,         // Distance at which particles repel each other
        
    // Mouse scattering effect
    mouseRepel: {
      enabled: true,
      strength: 90.0,            // Repulsion force
      radius: 1.0     // Radius of effect
    }
  },

  // ========================================
  // AMBIENT PARTICLES - TYPE 2 (CURL FLOW TO HEART)
  // Spring-based particles flowing toward heart with curl patterns
  // ========================================
  ambientType2: {
    // Basic properties
    enabled: true,
    count: 2000,                 // Reduced from 2000
    size: 4.0,                   // Particle size
    color: '#ced4da',            // Particle color (hex code like '#FFFF00' or RGB array [1.0, 1.0, 0.0])
    
    // Area restriction (spherical boundary)
    areaMultiplier: 5.0,         // Multiplier for sphere radius relative to heart
    width: null,                 // Custom radius override (null = use multiplier)
    spawnRadius: 10.0,            // Spawn boundary multiplier
    
    // Movement & flow physics
    particleSpeed: 1.5,          // Overall movement speed multiplier
    springStrength: 0.15,        // Pull force toward heart center
    dragCoefficient: 0.98,       // Velocity dampening (0.9-0.99)
    
    // Curl noise parameters
    noiseStrength: 14.0,         // Intensity of curl effect
    noiseScale: 0.01,            // Spatial frequency of curl patterns
    noiseOctaves: 3,             // Number of noise octaves (1-5)
    noisePersistence: 0.1,       // Amplitude reduction per octave
    noiseLacunarity: 2.0,        // Scale increase per octave
    
    // Pattern evolution
    noiseTimeScale: 0.05,        // How fast noise evolves over time
    patternShiftSpeed: 0.01,     // Changes curl pattern paths
    
    // Lifespan
    minLifespan: 10.0,           // Minimum particle lifespan (seconds)
    maxLifespan: 20.0,            // Maximum particle lifespan (seconds)
    
    // Mouse scattering effect
    mouseRepel: {
      enabled: true,
      strength: 80.0,            // Repulsion force
      radius: 0.5                // Radius of effect
    }
  }
};

/**
 * Converts the hierarchical config to flat config format for backward compatibility
 * @param {string} themeName - Name of the theme ('light' or 'dark')
 * @returns {Object} Flat configuration object
 */
export function getFlatConfig(themeName = 'dark') {
  const themeColors = THEME_COLORS[themeName] || THEME_COLORS.dark;

  return {
    // Heart
    heartGrow: CONFIG.heart.heartGrow,
    mouseRadius: CONFIG.heart.mouseRadius,
    heartRate: CONFIG.heart.heartRate,
    beatIntensity: CONFIG.heart.beatIntensity,
    heartPointSize: CONFIG.heart.heartPointSize,
    heartColor: hexToRgb(themeColors.heartColor),
    heartDensity: CONFIG.heart.heartDensity,
    particleCount: CONFIG.heart.particleCount,
    fov: CONFIG.heart.fov,
    autoRotate: CONFIG.heart.autoRotate,
    
    // Camera Tilt
    cameraTiltEnabled: CONFIG.heart.cameraTilt.enabled,
    cameraTiltStrength: CONFIG.heart.cameraTilt.strength,
    
    // Heart connections
    connectionsEnabled: CONFIG.heart.connectionsEnabled,
    maxNeighbors: CONFIG.heart.maxNeighbors,
    connectionDistance: CONFIG.heart.connectionDistance,
    connectionLineWidth: CONFIG.heart.connectionLineWidth,
    connectionOpacity: themeColors.connectionOpacity,
    connectionColor: hexToRgb(themeColors.connectionColor),
    connectionPulse: CONFIG.heart.connectionPulse,
    geodesicThreshold: CONFIG.heart.geodesicThreshold,
    
    // Background Glow
    glowEnabled: CONFIG.glow.enabled,
    glowIntensity: themeColors.glowIntensity || CONFIG.glow.intensity,
    glowRadius: CONFIG.glow.radius,
    glowFalloff: CONFIG.glow.falloff,
    glowColor: hexToRgb(themeColors.glowColor),
    
    // Portal Settings
    portalSwirlSpeed: CONFIG.portalSwirlSpeed,
    portalSmokeDensity: CONFIG.portalSmokeDensity,
    portalRingRadius: CONFIG.portalRingRadius,
    portalRingThickness: CONFIG.portalRingThickness,
    portalSmokeColor: hexToRgb(themeColors.ambientType1Color),
    portalFogStart: CONFIG.portalFogStart,
    portalFogEnd: CONFIG.portalFogEnd,
    portalFogColor: hexToRgb(themeColors.ambientType1Color),
    portalAberrationStrength: CONFIG.portalAberrationStrength,
    portalDistortionStrength: CONFIG.portalDistortionStrength,
    portalDistortionNoiseScale: CONFIG.portalDistortionNoiseScale,
    portalFloatSpeed: CONFIG.portalFloatSpeed,
    portalFloatAmount: CONFIG.portalFloatAmount,
    
    // Depth of Field
    dofEnabled: CONFIG.dof.enabled,
    dofFocalDistance: CONFIG.dof.focalDistance,
    dofFocalRange: CONFIG.dof.focalRange,
    dofAperture: CONFIG.dof.aperture,
    dofFocalLength: CONFIG.dof.focalLength,
    dofBokehShape: CONFIG.dof.bokehShape,
    dofBokehIntensity: CONFIG.dof.bokehIntensity,
    dofBokehScale: CONFIG.dof.bokehScale,
    dofNearBlurStart: CONFIG.dof.nearBlurStart,
    dofNearBlurStrength: CONFIG.dof.nearBlurStrength,
    dofFarBlurStart: CONFIG.dof.farBlurStart,
    dofFarBlurStrength: CONFIG.dof.farBlurStrength,
    dofDepthDarkening: CONFIG.dof.depthDarkening,
    dofDepthDesaturation: CONFIG.dof.depthDesaturation,
    dofAtmosphericFade: CONFIG.dof.atmosphericFade,
    dofChromaticAberration: CONFIG.dof.chromaticAberration,
    dofBokehRotation: CONFIG.dof.bokehRotation,
    dofBokehRoundness: CONFIG.dof.bokehRoundness,
    dofEdgeBias: CONFIG.dof.bokehFalloff,
    dofBlurFadeStrength: CONFIG.dof.blurFadeStrength,
    
    // Ambient Type 1
    ambientType1Enabled: CONFIG.ambientType1.enabled,
    ambientType1Count: CONFIG.ambientType1.count,
    ambientType1Size: CONFIG.ambientType1.size,
    ambientType1Color: hexToRgb(themeColors.ambientType1Color),
    ambientType1AreaMultiplier: CONFIG.ambientType1.areaMultiplier,
    ambientType1Width: CONFIG.ambientType1.width, // Radius override for spherical boundary
    ambientType1ParticleSpeed: CONFIG.ambientType1.particleSpeed,
    ambientType1NoiseScale: CONFIG.ambientType1.noiseScale,
    ambientType1NoiseSpeed: CONFIG.ambientType1.noiseSpeed,
    ambientType1NoiseStrength: CONFIG.ambientType1.noiseStrength,
    ambientType1Diffusion: CONFIG.ambientType1.diffusion,
    ambientType1RepulsionRadius: CONFIG.ambientType1.repulsionRadius,
    
    // Ambient Type 1 - Mouse Repel
    ambientType1MouseRepelEnabled: CONFIG.ambientType1.mouseRepel.enabled,
    ambientType1MouseRepelStrength: CONFIG.ambientType1.mouseRepel.strength,
    ambientType1MouseRepelRadius: CONFIG.ambientType1.mouseRepel.radius,
    
    // Ambient Type 2
    ambientType2Enabled: CONFIG.ambientType2.enabled,
    ambientType2Count: CONFIG.ambientType2.count,
    ambientType2Size: CONFIG.ambientType2.size,
    ambientType2Color: hexToRgb(themeColors.ambientType2Color),
    ambientType2AreaMultiplier: CONFIG.ambientType2.areaMultiplier,
    ambientType2Width: CONFIG.ambientType2.width, // Radius override for spherical boundary
    ambientType2ParticleSpeed: CONFIG.ambientType2.particleSpeed,
    ambientType2SpawnRadius: CONFIG.ambientType2.spawnRadius,
    ambientType2SpringStrength: CONFIG.ambientType2.springStrength,
    ambientType2DragCoefficient: CONFIG.ambientType2.dragCoefficient,
    ambientType2NoiseStrength: CONFIG.ambientType2.noiseStrength,
    ambientType2NoiseScale: CONFIG.ambientType2.noiseScale,
    ambientType2NoiseOctaves: CONFIG.ambientType2.noiseOctaves,
    ambientType2NoisePersistence: CONFIG.ambientType2.noisePersistence,
    ambientType2NoiseLacunarity: CONFIG.ambientType2.noiseLacunarity,
    ambientType2NoiseTimeScale: CONFIG.ambientType2.noiseTimeScale,
    ambientType2PatternShiftSpeed: CONFIG.ambientType2.patternShiftSpeed,
    ambientType2MinLifespan: CONFIG.ambientType2.minLifespan,
    ambientType2MaxLifespan: CONFIG.ambientType2.maxLifespan,
        
    // Ambient Type 2 - Mouse Repel
    ambientType2MouseRepelEnabled: CONFIG.ambientType2.mouseRepel.enabled,
    ambientType2MouseRepelStrength: CONFIG.ambientType2.mouseRepel.strength,
    ambientType2MouseRepelRadius: CONFIG.ambientType2.mouseRepel.radius
  };
}

/**
 * Configuration presets for different visual styles
 */
export const PRESETS = {
  // Calm and subtle
  calm: {
    heart: {
      heartRate: 0.8,
      beatIntensity: 0.5
    },
    ambientType1: {
      count: 3000,
      particleSpeed: 0.5,
      noiseStrength: 0.3
    },
    ambientType2: {
      count: 2000,
      particleSpeed: 0.7,
      springStrength: 0.1
    }
  },
  
  // Energetic and dynamic
  energetic: {
    heart: {
      heartRate: 1.8,
      beatIntensity: 1.5
    },
    ambientType1: {
      count: 8000,
      particleSpeed: 2.0,
      noiseStrength: 1.0
    },
    ambientType2: {
      count: 5000,
      particleSpeed: 2.5,
      springStrength: 0.25,
      noiseStrength: 20.0
    }
  },
  
  // Minimal particles
  minimal: {
    heart: {
      heartRate: 1.0,
      beatIntensity: 0.8
    },
    ambientType1: {
      enabled: false
    },
    ambientType2: {
      count: 1000,
      particleSpeed: 0.8
    }
  },
  
  // Maximum particles (performance test)
  maximum: {
    heart: {
      heartDensity: 0.5
    },
    ambientType1: {
      count: 15000
    },
    ambientType2: {
      count: 8000
    }
  }
};

/**
 * Apply a preset configuration
 * @param {string} presetName - Name of the preset to apply
 * @param {Object} currentConfig - Current configuration object
 * @returns {Object} Updated configuration
 */
export function applyPreset(presetName, currentConfig) {
  const preset = PRESETS[presetName];
  if (!preset) {
    console.warn(`Preset "${presetName}" not found`);
    return currentConfig;
  }
  
  // Deep merge preset into current config
  return deepMerge(currentConfig, preset);
}

/**
 * Deep merge utility
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Validate configuration values
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validateConfig(config) {
  const errors = [];
  
  // Heart validation
  if (config.heartRate < 0.1 || config.heartRate > 5.0) {
    errors.push('heartRate must be between 0.1 and 5.0');
  }
  
  // Ambient Type 1 validation
  if (config.ambientType1Count < 0 || config.ambientType1Count > 50000) {
    errors.push('ambientType1Count must be between 0 and 50000');
  }
  
  // Ambient Type 2 validation
  if (config.ambientType2Count < 0 || config.ambientType2Count > 50000) {
    errors.push('ambientType2Count must be between 0 and 50000');
  }
  
  if (config.ambientType2NoiseOctaves < 1 || config.ambientType2NoiseOctaves > 5) {
    errors.push('ambientType2NoiseOctaves must be between 1 and 5');
  }
  
  if (config.ambientType2DragCoefficient < 0.5 || config.ambientType2DragCoefficient > 1.0) {
    errors.push('ambientType2DragCoefficient must be between 0.5 and 1.0');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Export configuration to JSON (for saving/loading)
 * @param {Object} config - Configuration to export
 * @returns {string} JSON string
 */
export function exportConfig(config) {
  return JSON.stringify(config, null, 2);
}

/**
 * Import configuration from JSON
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Parsed configuration or null if invalid
 */
export function importConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    const validation = validateConfig(config);
    
    if (!validation.valid) {
      console.error('Invalid configuration:', validation.errors);
      return null;
    }
    
    return config;
  } catch (error) {
    console.error('Failed to parse configuration:', error);
    return null;
  }
}

