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


## Optimized Heart Visualization — Asset Management

### Overview

The NCIBB landing page renders an interactive 3D heart using WebGL2.

The visualization is based on a large source mesh (`mesh_data.json`), but the browser does **not** load this file.

Instead, particles are generated offline and stored in a compact binary file (`cardio-particles.bin`).

This significantly reduces network transfer and initial loading time while preserving the WebGL rendering system, shaders, animations, and visual configuration.

### Directory Structure

All paths are relative to the `NCIBB_website` repository root.

**Original source mesh:**

`NCIBB_source_assets/mesh_data.json`

- Contains the original high-resolution geometry.
- Used only for offline particle generation.
- Must never be placed in `frontend/public/` for production.
- Must be backed up safely.
- Is excluded from Git using the existing `**/mesh_data.json` rule.

**Particle generator:**

`frontend/scripts/prepare-cardio-particles.mjs`

- Reads the original mesh.
- Extracts positions, normals, and mesh indices.
- Calculates the bounding box and center.
- Invokes the existing particle-sampling algorithm.
- Generates the optimized binary file.

**Generated binary asset:**

`frontend/public/landing/webgl_asset/cardio-particles.bin`

- Contains the pre-generated heart particles.
- Loaded directly by the React application.
- Must be included in production deployments.
- Can be regenerated whenever the original mesh or particle-generation settings change.

**React component:**

`frontend/src/components/landing/CardioBackground/CardioBackground.jsx`

- Loads the binary through `webgl/particle-loader.js`.
- Initializes the existing WebGL renderer.
- Handles animations, mouse interactions, scroll effects, and theme updates.

### Regenerating the Heart Particles

The regeneration workflow is automated with an npm command.

**Step 1 — Check the original source mesh**

From the repository root:

```bash
ls -lh NCIBB_source_assets/mesh_data.json
```

The original source file must exist at that location.

**Step 2 — Generate the optimized binary**

```bash
cd frontend
npm run cardio:generate
```

The script automatically reads:

`../NCIBB_source_assets/mesh_data.json`

And writes:

`public/landing/webgl_asset/cardio-particles.bin`

No manual file copying, moving, or deletion is required.

**Expected output with the current configuration:**

```text
Using uniform density sampling strategy...
Generated: .../cardio-particles.bin
Particles: 10000
Output size: 520032 bytes
```

The sampler uses randomized particle selection, so regenerated particles may not have exactly the same positions as the previous binary. The overall rendering algorithm remains unchanged.

### When Should the Binary Be Regenerated?

Only regenerate when:

1. The original heart mesh has changed.
2. The particle-generation algorithm has changed.
3. The configured heart particle count has changed.
4. A new visual version of the heart is intentionally required.

Do not regenerate the binary during every application build.

The existing binary is sufficient for ordinary development and production deployments.

### Particle Count Configuration

The current configuration uses 10,000 heart particles.

This value is defined in:

`frontend/src/components/landing/CardioBackground/config.js`

```javascript
particleCount: 10000,
```

And in:

`frontend/scripts/prepare-cardio-particles.mjs`

```javascript
const particleCount = 10000;
```

These values must remain consistent.

If the number of heart particles changes, update both values and regenerate the binary.

The generated file size will change accordingly.

### Deploying the Application

For an ordinary frontend deployment:

```bash
cd frontend
npm run build
```

The production build must include:

`dist/landing/webgl_asset/cardio-particles.bin`

The large original `mesh_data.json` must not be included.

After building, verify:

```bash
find dist -name "cardio-particles.bin"
find dist -name "mesh_data.json"
```

The first command should locate the optimized binary file.

The second command should return no results.

When the binary is regenerated, commit the updated binary file to Git:

```bash
git add frontend/public/landing/webgl_asset/cardio-particles.bin
git commit -m "Update optimized cardio particle asset"
```

Run these Git commands from the repository root, only when intending to commit the regenerated asset.

### Troubleshooting

**Error: ENOENT — mesh_data.json not found**

Check that the source mesh exists at:

`NCIBB_source_assets/mesh_data.json`

The generator resolves this path relative to its own location, so it can be run from the `frontend` directory.

**Error: Cardio particle count mismatch**

Check that the particle counts in `config.js` and `prepare-cardio-particles.mjs` match.

Regenerate the binary after correcting them.

**Error: Failed to load cardio particles: 404**

Confirm that `cardio-particles.bin` exists under:

`frontend/public/landing/webgl_asset/`

Then rebuild the application.

**The visualization is missing**

Check the browser console for WebGL or shader errors. Confirm that WebGL2 is supported and that the binary asset was loaded successfully.

**Unexpectedly large network transfer**

Open Chrome DevTools → Network and check whether `mesh_data.json` is being requested.

The main React landing page must request only `cardio-particles.bin`.

If the original mesh is being downloaded, inspect the requesting script. The standalone legacy viewers under `frontend/public/landing/cardio_particles/` still contain older mesh-loading code and are separate from the optimized React component.

### Important Rules

- Never deploy the original 270 MB mesh as part of the React landing page.
- Never delete the only backup of the original mesh.
- Never manually edit the generated binary.
- Always use `npm run cardio:generate` to regenerate particles.
- Keep the original mesh outside `frontend/public/`.
- Keep `cardio-particles.bin` available in production.
- Preserve the existing WebGL renderer and shaders unless changes are explicitly required.

### Performance Reference

Before optimization:

- 329 requests
- 538 MB transferred
- Approximately 3.6 minutes to finish loading

After optimization (observed):

- 201 requests
- 543 kB transferred
- 3.86 seconds to finish loading
- DOMContentLoaded: 1.28 seconds

These measurements reflect the tested environment and may vary across browsers, networks, caching states, and deployment configurations.


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

