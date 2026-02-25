# Configuration System Documentation

## Overview

The Cardio Particle System uses a centralized configuration file (`js/config.js`) that makes it production-ready and easy to customize.

## File Structure

```
js/
├── config.js           # Centralized configuration (YOU EDIT THIS)
├── main.js            # Application entry point (uses config)
└── ui/controls.js     # UI controls (syncs with config)
```

## Quick Start

### 1. Basic Configuration

To change default settings, edit `js/config.js`:

```javascript
export const CONFIG = {
  heart: {
    heartRate: 1.2,        // Change this to adjust heart rate
    heartPointSize: 5.0,   // Change particle size
    // ... more settings
  },
  ambientType1: {
    count: 5000,           // Number of yellow particles
    enabled: true,         // Enable/disable
    // ... more settings
  },
  ambientType2: {
    count: 3000,           // Number of blue curl particles
    enabled: true,         // Enable/disable
    // ... more settings
  }
};
```

### 2. Using Presets

Four built-in presets are available:

- **calm**: Subtle, slow-paced animation
- **energetic**: Fast, dynamic movement
- **minimal**: Fewer particles, cleaner look
- **maximum**: Performance test with maximum particles

To apply a preset programmatically:

```javascript
import { applyPreset, getFlatConfig } from './config.js';

const config = getFlatConfig();
const calmConfig = applyPreset('calm', config);
```

### 3. Production Deployment

For production, you can:

1. **Disable UI controls** by removing the controls panel from HTML
2. **Lock settings** by making config read-only
3. **Create custom presets** for different use cases

## Configuration Categories

### Heart Particles

```javascript
heart: {
  heartGrow: 1.5,           // Mouse hover enlargement (0-3)
  mouseRadius: 3.0,         // Mouse interaction area (1-8)
  heartRate: 1.2,           // Heartbeat speed (0.5-2.0)
  beatIntensity: 1.0,       // Beat strength (0-1.5)
  heartPointSize: 5.0,      // Particle size (1-10)
  heartDensity: 0.3,        // Particle density (0.1-0.8, requires reload)
  fov: Math.PI / 4,         // Camera FOV (30-90 degrees)
  autoRotate: false         // Auto-rotation
}
```

### Ambient Type 1 (Yellow Circles)

Noise-based floating particles that drift harmonically.

```javascript
ambientType1: {
  enabled: true,
  count: 5000,              // Particle count (1000-20000)
  size: 2.0,                // Particle size (0.5-5.0)
  areaMultiplier: 1.5,      // Area size (0.5-10.0)
  particleSpeed: 1.0,       // Movement speed (0.1-5.0)
  noiseScale: 0.01,         // Spatial frequency (0.001-0.05)
  noiseSpeed: 0.1,          // Time evolution (0.01-0.5)
  noiseStrength: 0.5,       // Noise intensity (0.1-2.0)
  diffusion: 0.02,          // Anti-clustering (0.001-0.1)
  repulsionRadius: 0.1      // Repulsion distance (0.05-0.5)
}
```

### Ambient Type 2 (Curl Flow)

Spring-based particles flowing toward heart with curl patterns.

```javascript
ambientType2: {
  enabled: true,
  count: 3000,              // Particle count (500-10000)
  size: 1.5,                // Particle size (0.5-5.0)
  areaMultiplier: 2.0,      // Area size (0.5-10.0)
  spawnRadius: 1.8,         // Respawn boundary (1.0-3.0)
  particleSpeed: 1.0,       // Movement speed (0.1-5.0)
  springStrength: 0.15,     // Pull to center (0.01-0.5)
  dragCoefficient: 0.98,    // Velocity dampening (0.9-0.99)
  noiseStrength: 12.0,      // Curl intensity (1.0-30.0)
  noiseScale: 0.02,         // Spatial frequency (0.001-0.1)
  noiseOctaves: 3,          // Noise layers (1-5)
  noisePersistence: 0.5,    // Amplitude decay (0.1-1.0)
  noiseLacunarity: 2.0,     // Scale increase (1.0-4.0)
  noiseTimeScale: 0.05,     // Evolution speed (0.01-0.2)
  patternShiftSpeed: 0.01,  // Pattern changes (0.001-0.05)
  minLifespan: 10.0,        // Min life (1.0-30.0 seconds)
  maxLifespan: 20.0         // Max life (1.0-30.0 seconds)
}
```

## Advanced Usage

### Creating Custom Presets

Add your own preset to `PRESETS` object in `config.js`:

```javascript
export const PRESETS = {
  myCustom: {
    heart: {
      heartRate: 1.0,
      beatIntensity: 0.7
    },
    ambientType1: {
      count: 4000,
      particleSpeed: 0.8
    },
    ambientType2: {
      enabled: false  // Disable type 2
    }
  }
};
```

### Validation

The config system includes built-in validation:

```javascript
import { validateConfig } from './config.js';

const validation = validateConfig(myConfig);
if (!validation.valid) {
  console.error('Invalid config:', validation.errors);
}
```

### Export/Import Configuration

Save and load configurations:

```javascript
import { exportConfig, importConfig } from './config.js';

// Export to JSON
const jsonString = exportConfig(config);
localStorage.setItem('myConfig', jsonString);

// Import from JSON
const jsonString = localStorage.getItem('myConfig');
const loadedConfig = importConfig(jsonString);
```

## Performance Tuning

### Low-End Devices

```javascript
{
  heart: { heartDensity: 0.2 },
  ambientType1: { count: 2000 },
  ambientType2: { count: 1000 }
}
```

### High-End Devices

```javascript
{
  heart: { heartDensity: 0.5 },
  ambientType1: { count: 10000 },
  ambientType2: { count: 5000 }
}
```

## Troubleshooting

### Particles Not Visible

- Check `enabled: true` in config
- Increase `count` value
- Increase `size` value
- Check `areaMultiplier` - might be too small

### Performance Issues

- Reduce `count` values
- Reduce `noiseOctaves` for Type 2
- Lower `heartDensity`
- Disable one particle type

### Particles Clustering

**Type 1:**
- Increase `diffusion`
- Increase `repulsionRadius`

**Type 2:**
- Increase `dragCoefficient`
- Adjust `springStrength`
- Increase `noiseStrength`

## Best Practices

1. **Start with presets** - Use existing presets as a base
2. **Test incremental changes** - Change one value at a time
3. **Use validation** - Always validate custom configs
4. **Document changes** - Comment your custom values
5. **Performance test** - Test on target devices

## Production Checklist

- [ ] Finalize all configuration values
- [ ] Test on target devices (mobile, desktop)
- [ ] Remove or hide UI controls if not needed
- [ ] Add loading states for heavy particle counts
- [ ] Consider user preferences (localStorage)
- [ ] Document any custom changes
- [ ] Validate configuration on startup

## API Reference

### Functions

- `getFlatConfig()` - Returns flat configuration object
- `applyPreset(name, config)` - Applies preset to config
- `validateConfig(config)` - Validates configuration
- `exportConfig(config)` - Exports to JSON string
- `importConfig(json)` - Imports from JSON string

### Constants

- `CONFIG` - Main configuration object
- `PRESETS` - Available presets

## Examples

### Example 1: Simple Customization

```javascript
// In config.js
export const CONFIG = {
  heart: {
    heartRate: 1.5,  // Faster heartbeat
    heartPointSize: 6.0  // Bigger particles
  },
  ambientType1: {
    enabled: false  // Disable yellow particles
  },
  ambientType2: {
    count: 5000,  // More blue particles
    springStrength: 0.2  // Stronger pull
  }
};
```

### Example 2: Dynamic Config Loading

```javascript
// In your app
import { getFlatConfig, importConfig } from './config.js';

// Load from server
const response = await fetch('/api/particle-config');
const configJson = await response.text();
const config = importConfig(configJson) || getFlatConfig();
```

### Example 3: User Preferences

```javascript
// Save user preferences
function saveUserPreferences(config) {
  const json = exportConfig(config);
  localStorage.setItem('userParticleConfig', json);
}

// Load user preferences
function loadUserPreferences() {
  const json = localStorage.getItem('userParticleConfig');
  return json ? importConfig(json) : getFlatConfig();
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review `config.js` comments
3. Check console for validation errors
4. Verify browser WebGL2 support

