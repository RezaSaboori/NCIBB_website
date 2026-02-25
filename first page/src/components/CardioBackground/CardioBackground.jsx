import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { createRenderer } from './webgl/renderer.js';
import { sampleParticlesFromMesh } from './webgl/particle-sampler.js';
import { toTypedArray, resize } from './webgl/utils.js';
import { getFlatConfig, applyPreset, CONFIG } from './config.js';

// Track initialized canvases globally to prevent double-init in StrictMode
const initializedCanvases = new WeakMap();

// Helper function to convert hex color to RGB array [r, g, b] (0-1 range)
function hexToRgbNormalized(hex) {
  if (!hex) return [0.04, 0.04, 0.06]; // Default dark gray
  
  // Remove # if present
  let hexColor = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hexColor.length === 3) {
    hexColor = hexColor.split('').map(char => char + char).join('');
  }
  
  // Parse hex to RGB (0-255)
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Convert to 0-1 range for WebGL
  return [r / 255, g / 255, b / 255];
}

const CardioBackground = forwardRef(({ 
  quality = 'auto',
  interactive = true,
  autoRotate = false,
  enableDragRotation = true, // Enable/disable mouse drag to rotate camera
  enableWheelZoom = true, // Enable/disable mouse wheel zoom
  contentOffset = { x: -0.4, y: 0 }, // Shifts rendering within the canvas. x, y from -1 to 1.
  backgroundColor = '#0a0a0f', // Background color for the canvas rendering
  theme = 'dark', // Current theme ('light' or 'dark')
  className = '',
  style = {},
  configOverrides = {},
  paused = false,
  scrollProgress = 0 // Scroll progress from 0 to 1
}, ref) => {
  // Use the forwarded ref for the canvas, or an internal one if not provided
  const internalCanvasRef = useRef(null);
  const canvasRef = ref || internalCanvasRef;

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  const [isSupported, setIsSupported] = useState(true);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(null);
  const cleanupRef = useRef(null);
  const isInitializingRef = useRef(false);
  const glRef = useRef(null);
  const meshDataRef = useRef(null); // Cache mesh data
  const particleDataRef = useRef(null); // Cache sampled particles

  // Separate effect for theme/color updates to prevent laggy re-initialization
  useEffect(() => {
    if (rendererRef.current) {
      const bgRgb = hexToRgbNormalized(backgroundColor);
      const newConfig = getFlatConfig(theme);
      
      // Merge overrides
      const finalConfig = { 
        ...newConfig, 
        ...configOverrides,
        backgroundColorRgb: bgRgb,
        contentOffset
      };
      
      rendererRef.current.updateConfig(finalConfig);
    }
  }, [theme, backgroundColor, configOverrides, contentOffset.x, contentOffset.y]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if this canvas was already initialized (handles StrictMode double-mount)
    if (initializedCanvases.has(canvas)) {
      return;
    }
    
    // Prevent double initialization (React StrictMode)
    if (isInitializingRef.current) {
      return;
    }
    
    // Clean up any existing invalid context
    if (glRef.current && glRef.current.isContextLost && glRef.current.isContextLost()) {
      glRef.current = null;
    }

    const gl = canvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      alpha: false,
      antialias: false, // Disable for performance, we handle it or don't need it for particles
      stencil: false,
      depth: true,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: false
    });
    
    glRef.current = gl;

    if (!gl) {
      const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl1) {
        setIsSupported(false);
        return;
      }
      setIsSupported(false);
      return;
    }
    
    // Handle context loss events
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault(); // Prevent default behavior to try to restore
      isInitializingRef.current = false;
    });
    
    canvas.addEventListener('webglcontextrestored', () => {
      // Could reinitialize here if needed
    });
    
    // Verify it's actually WebGL2 - check multiple ways
    const version = gl.getParameter(gl.VERSION);
    const isWebGL2ByVersion = version && version.includes('WebGL 2.0');
    
    const isWebGL2ByFeatures = typeof gl.createVertexArray !== 'undefined' && 
                                typeof gl.texImage3D !== 'undefined' &&
                                typeof gl.getUniformBlockIndex !== 'undefined';
    
    const isWebGL2ByInstance = typeof WebGL2RenderingContext !== 'undefined' && 
                                (gl instanceof WebGL2RenderingContext || 
                                 gl.constructor === WebGL2RenderingContext);
    
    if (!isWebGL2ByVersion && !isWebGL2ByFeatures) {
      setIsSupported(false);
      return;
    }

    // Handle resize
    const handleResize = () => {
      if (canvas) resize(canvas);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize
    const init = async () => {
      // Set flag to prevent double initialization
      if (isInitializingRef.current) {
        return;
      }
      
      // Double-check context is still valid
      if (!gl || (gl.isContextLost && gl.isContextLost())) {
        return;
      }
      
      isInitializingRef.current = true;
      
      try {
        // Load mesh data
        let positions, normals, meshIndices, totalVertexCount, center, maxSize, size, bbox, meshIndex;
        
        if (!particleDataRef.current) {
          const assetBase = import.meta.env?.BASE_URL || '/';
          const meshUrl = `${assetBase}webgl_asset/mesh_data.json`;
          
          const response = await fetch(meshUrl);
          if (!response.ok) throw new Error(`Failed to load mesh data: ${response.status}`);
          const manifest = await response.json();

          // Process mesh data (logic adapted from main.js)
          const allPositions = [];
          const allNormals = [];
          const allMeshIndices = [];
          totalVertexCount = 0;
          let bboxMin = [Infinity, Infinity, Infinity];
          let bboxMax = [-Infinity, -Infinity, -Infinity];
          meshIndex = 0;

          for (const [meshName, primitives] of Object.entries(manifest.meshes)) {
            for (const primitive of primitives) {
              if (!primitive.attributes.POSITION) continue;

              const positionSpec = primitive.attributes.POSITION;
              const positionsArr = toTypedArray(positionSpec);
              const vertexCount = positionsArr.length / 3;

              for (let i = 0; i < positionsArr.length; i++) {
                allPositions.push(positionsArr[i]);
              }
              for (let i = 0; i < vertexCount; i++) {
                allMeshIndices.push(meshIndex);
              }

              if (primitive.attributes.NORMAL) {
                const normalsArr = toTypedArray(primitive.attributes.NORMAL);
                for (let i = 0; i < normalsArr.length; i++) {
                  allNormals.push(normalsArr[i]);
                }
              } else {
                for (let i = 0; i < vertexCount; i++) {
                  allNormals.push(0, 1, 0);
                }
              }

              // BBox update
              for (let i = 0; i < vertexCount; i++) {
                const x = positionsArr[i * 3];
                const y = positionsArr[i * 3 + 1];
                const z = positionsArr[i * 3 + 2];
                bboxMin[0] = Math.min(bboxMin[0], x);
                bboxMin[1] = Math.min(bboxMin[1], y);
                bboxMin[2] = Math.min(bboxMin[2], z);
                bboxMax[0] = Math.max(bboxMax[0], x);
                bboxMax[1] = Math.max(bboxMax[1], y);
                bboxMax[2] = Math.max(bboxMax[2], z);
              }
              
              totalVertexCount += vertexCount;
              meshIndex++;
            }
          }

          positions = new Float32Array(allPositions);
          normals = allNormals.length > 0 ? new Float32Array(allNormals) : null;
          meshIndices = new Uint8Array(allMeshIndices);
          
          // Calculate BBox
          bbox = { min: bboxMin, max: bboxMax };
          center = [
            (bbox.min[0] + bbox.max[0]) / 2,
            (bbox.min[1] + bbox.max[1]) / 2,
            (bbox.min[2] + bbox.max[2]) / 2
          ];
          size = [
            bbox.max[0] - bbox.min[0],
            bbox.max[1] - bbox.min[1],
            bbox.max[2] - bbox.min[2]
          ];
          maxSize = Math.max(size[0], size[1], size[2]);
          
          meshDataRef.current = { totalVertexCount, center, maxSize, size, bbox, meshIndex, positions, normals, meshIndices };
        } else {
          ({ totalVertexCount, center, maxSize, size, bbox, meshIndex, positions, normals, meshIndices } = meshDataRef.current);
        }

        // Config & Quality
        let baseConfig = getFlatConfig(theme);
        
        // Apply Quality Preset
        let effectiveQuality = quality;
        if (quality === 'auto') {
           // Advanced auto-detection
           const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
           const hardwareConcurrency = navigator.hardwareConcurrency || 4;
           const deviceMemory = navigator.deviceMemory || 4; // GB
           
           if (isMobile) {
               effectiveQuality = 'low'; // Default mobile to low for safety
               if (hardwareConcurrency >= 6 && deviceMemory >= 4) {
                   effectiveQuality = 'medium'; // High-end mobile
               }
           } else {
               // Desktop
               effectiveQuality = 'medium'; // Default desktop
               if (hardwareConcurrency >= 8 && deviceMemory >= 8) {
                   effectiveQuality = 'high'; // High-end desktop
               }
               if (hardwareConcurrency <= 4) {
                   effectiveQuality = 'low'; // Low-end desktop/laptop
               }
           }
        }
        
        // Apply preset modifications (logic from config.js presets would go here or we use helper)
        // We need to update config.js to export presets directly or use them here.
        // For now, let's assume manual adjustment or use the applyPreset function if I make it available.
        if (['low', 'medium', 'high', 'ultra', 'calm', 'energetic', 'minimal'].includes(effectiveQuality)) {
             // Map quality names to presets if needed, or use them if they match
             const presetMap = {
                 'low': 'minimal', 
                 'medium': 'calm',
                 'high': 'energetic', // Just as an example mapping, or create specific quality presets
                 'ultra': 'maximum'
             };
             const presetName = presetMap[effectiveQuality] || effectiveQuality;
             baseConfig = applyPreset(presetName, baseConfig);
        }

        // Override config with props
        if (interactive === false) {
            baseConfig.mouseRadius = 0;
            baseConfig.heartGrow = 1.0;
            baseConfig.ambientType1MouseRepelEnabled = false;
            baseConfig.ambientType2MouseRepelEnabled = false;
            baseConfig.cameraTiltEnabled = false;
        }
        if (autoRotate !== undefined) {
            baseConfig.autoRotate = autoRotate;
        }
        
        // Add drag rotation control to config
        baseConfig.enableDragRotation = enableDragRotation;
        
        // Add wheel zoom control to config
        baseConfig.enableWheelZoom = enableWheelZoom;
        
        // Add background color to config (convert hex to normalized RGB)
        const bgRgb = hexToRgbNormalized(backgroundColor);
        baseConfig.backgroundColorRgb = bgRgb;
        
        // Add content offset to config
        baseConfig.contentOffset = contentOffset;

        // Merge user overrides
        baseConfig = { ...baseConfig, ...configOverrides };

        // Particle Count
        let PARTICLE_COUNT;
        if (baseConfig.particleCount > 0) {
          PARTICLE_COUNT = baseConfig.particleCount;
        } else {
          // Reduce density for lower qualities/mobile
          let densityMultiplier = 1.0;
          if (effectiveQuality === 'low' || effectiveQuality === 'minimal') densityMultiplier = 0.3;
          if (effectiveQuality === 'medium') densityMultiplier = 0.6;
          
          const heartDensity = baseConfig.heartDensity * densityMultiplier;
          PARTICLE_COUNT = Math.min(200000, Math.max(5000, Math.floor(totalVertexCount * heartDensity)));
        }

        // Sample Particles - Use cached if available
        let particleData;
        if (particleDataRef.current && particleDataRef.current.PARTICLE_COUNT === PARTICLE_COUNT) {
          particleData = particleDataRef.current.data;
        } else {
          particleData = sampleParticlesFromMesh(positions, normals, meshIndices, totalVertexCount, PARTICLE_COUNT, center, bbox, meshIndex);
          particleDataRef.current = { data: particleData, PARTICLE_COUNT };
        }

        const heartBounds = [
          Math.max(size[0] * 0.8, 0.001),
          Math.max(size[1] * 0.6, 0.001),
          Math.max(size[2] * 0.4, 0.001)
        ];

        // Verify context is still valid before creating renderer
        if (!gl) {
          isInitializingRef.current = false;
          throw new Error('WebGL context is null');
        }
        
        // Check if context is lost
        if (gl.isContextLost && gl.isContextLost()) {
          isInitializingRef.current = false;
          return; // Don't throw, just return silently
        }
        
        // Test context with a simple operation
        try {
          const testParam = gl.getParameter(gl.VERSION);
          if (!testParam) {
            isInitializingRef.current = false;
            return; // Don't throw, just return silently
          }
        } catch (e) {
          isInitializingRef.current = false;
          return; // Don't throw, just return silently
        }
        
        // Initialize Renderer
        const renderer = createRenderer(gl, canvas, baseConfig, particleData, PARTICLE_COUNT, center, maxSize, heartBounds, scrollProgressRef);
        await renderer.init();
        rendererRef.current = renderer;
        
        // Mark canvas as initialized
        initializedCanvases.set(canvas, true);

        // FPS Throttling Variables
        let lastFrameTime = 0;
        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;

        // Animation Loop
        const renderLoop = (time) => {
          // Check if context is still valid before rendering
          if (gl.isContextLost && gl.isContextLost()) {
            return;
          }

          if (!pausedRef.current) {
            // FPS Throttling
            const elapsed = time - lastFrameTime;
            
            if (elapsed > frameInterval) {
                lastFrameTime = time - (elapsed % frameInterval);
                renderer.render(time);
            }
          }
          
          frameIdRef.current = requestAnimationFrame(renderLoop);
        };
        frameIdRef.current = requestAnimationFrame(renderLoop);
        
        // Store cleanup function
        cleanupRef.current = () => {
            if (renderer.dispose) renderer.dispose();
            // Also cancel animation frame
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            // Only remove from initialized set if context is actually lost
            // This prevents StrictMode from causing issues
            if (gl.isContextLost && gl.isContextLost()) {
                initializedCanvases.delete(canvas);
            }
        };

      } catch (error) {
        setIsSupported(false);
      } finally {
        isInitializingRef.current = false;
      }
    };

    init();

    return () => {
      isInitializingRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current = null;
      }
      
      // Don't explicitly lose context - let React handle cleanup naturally
      // Losing context can cause issues with React StrictMode double-mounting
      // The context will be cleaned up when the canvas is removed from DOM
    };
  }, [quality, interactive, autoRotate, enableDragRotation, enableWheelZoom]);

  if (!isSupported) {
    return <div className={className} style={{ ...style, background: backgroundColor }}>WebGL2 Not Supported</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      tabIndex={interactive ? 0 : -1} // Make canvas focusable for keyboard/mouse events
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        zIndex: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        touchAction: 'none', // Prevent touch scrolling on mobile
        outline: 'none', // Remove focus outline
        ...style
      }}
      onMouseDown={(e) => {
        // React-level mouse handler to ensure events work
        if (interactive) {
          canvasRef.current?.focus();
        }
      }}
      onContextMenu={(e) => {
        // Prevent right-click context menu if drag rotation is disabled
        if (!enableDragRotation && interactive) {
          e.preventDefault();
        }
      }}
    />
  );
});

export default CardioBackground;

