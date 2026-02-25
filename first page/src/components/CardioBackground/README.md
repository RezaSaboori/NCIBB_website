# Cardio Background Component

A high-performance, interactive WebGL particle system for React. Renders a 3D heart mesh with ambient particles, connections, and glow effects.

## Features

- **WebGL 2.0 Powered**: Efficient rendering of thousands of particles.
- **Interactive**: Rotates with mouse movement, zoomable, and reacts to hover.
- **Configurable**: Extensive props to control visuals and performance.
- **Responsive**: Adapts to screen size and device capabilities.
- **Optimized**: Includes quality presets and automatic mobile scaling.

## Installation

1. Copy the `CardioBackground` folder into your components directory.
2. Ensure the `webgl_asset` folder is placed in your public directory (e.g., `public/webgl_asset`).

## Usage

```jsx
import CardioBackground from './components/CardioBackground';

function App() {
  return (
    <div className="App">
      {/* Basic usage */}
      <CardioBackground />
      
      {/* Customized usage */}
      <CardioBackground 
        quality="high" 
        autoRotate={true}
        interactive={true}
        configOverrides={{
            heart: {
                heartColor: '#ff0000'
            }
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
        <h1>My App Content</h1>
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `quality` | `'auto' \| 'low' \| 'medium' \| 'high' \| 'ultra'` | `'auto'` | Sets the visual quality and particle count. 'auto' detects device capability. |
| `interactive` | `boolean` | `true` | Enables mouse interaction (rotation, tilt, hover effects). |
| `autoRotate` | `boolean` | `false` | Automatically rotates the camera around the heart. |
| `className` | `string` | `''` | CSS class for the canvas element. |
| `style` | `object` | `{}` | Inline styles for the canvas element. |
| `configOverrides` | `object` | `{}` | Deep override of internal configuration. See `config.js` for structure. |

## Assets

The component requires `mesh_data.json` to be available at `/webgl_asset/mesh_data.json` (relative to domain root).

## Customization

You can create custom presets in `config.js` or pass specific values via `configOverrides`.

Example overriding specific values:
```jsx
<CardioBackground 
  configOverrides={{
    heartGrow: 2.0, // Make heart pulse bigger on hover
    glowColor: '#00ff00', // Green glow
  }} 
/>
```

