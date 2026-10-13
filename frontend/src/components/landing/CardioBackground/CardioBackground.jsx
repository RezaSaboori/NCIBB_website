
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { createRenderer } from './webgl/renderer.js';
import { loadCardioParticles } from './webgl/particle-loader.js';
import { resize } from './webgl/utils.js';
import { getFlatConfig, applyPreset } from './config.js';

const DEFAULT_CONFIG_OVERRIDES = {};

function hexToRgbNormalized(hex) {
  if (!hex) return [0.04, 0.04, 0.06];

  let hexColor = hex.replace('#', '');

  if (hexColor.length === 3) {
    hexColor = hexColor
      .split('')
      .map(char => char + char)
      .join('');
  }

  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  return [r / 255, g / 255, b / 255];
}

const CardioBackground = forwardRef(({
  quality = 'auto',
  interactive = true,
  autoRotate = false,
  enableDragRotation = true,
  enableWheelZoom = true,
  contentOffset = { x: -0.4, y: 0 },
  backgroundColor = '#070707',
  theme = 'dark',
  className = '',
  style = {},
  configOverrides = DEFAULT_CONFIG_OVERRIDES,
  paused = false,
  scrollProgress = 0,
  onLoadingProgress,
  onInitialized,
  onError
}, ref) => {
  const internalCanvasRef = useRef(null);
  const canvasRef = ref || internalCanvasRef;

  const pausedRef = useRef(paused);
  const scrollProgressRef = useRef(scrollProgress);
  const rendererRef = useRef(null);

  const [isSupported, setIsSupported] = useState(true);

  const appearanceRef = useRef({
    theme,
    backgroundColor,
    contentOffset,
    configOverrides
  });

  appearanceRef.current = {
    theme,
    backgroundColor,
    contentOffset,
    configOverrides
  };

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Update visual configuration without reinitializing WebGL.
  useEffect(() => {
    const renderer = rendererRef.current;

    if (!renderer) return;

    const nextConfig = getFlatConfig(theme);

    renderer.updateConfig({
      ...nextConfig,
      ...configOverrides,
      backgroundColorRgb: hexToRgbNormalized(backgroundColor),
      contentOffset
    });
  }, [
    theme,
    backgroundColor,
    configOverrides,
    contentOffset.x,
    contentOffset.y
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let cancelled = false;
    let animationFrameId = null;
    let rendererInstance = null;
    let rendererReady = false;

    const gl = canvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      alpha: false,
      antialias: false,
      stencil: false,
      depth: true,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: false
    });

    if (!gl) {
      setIsSupported(false);
      return;
    }

    const version = gl.getParameter(gl.VERSION);

    const isWebGL2ByVersion =
      typeof version === 'string' &&
      version.includes('WebGL 2.0');

    const isWebGL2ByFeatures =
      typeof gl.createVertexArray === 'function' &&
      typeof gl.texImage3D === 'function' &&
      typeof gl.getUniformBlockIndex === 'function';

    if (!isWebGL2ByVersion && !isWebGL2ByFeatures) {
      setIsSupported(false);
      return;
    }

    const handleContextLost = (event) => {
      event.preventDefault();

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const handleContextRestored = () => {};

    const handleResize = () => {
      resize(canvas);
    };

    canvas.addEventListener(
      'webglcontextlost',
      handleContextLost
    );

    canvas.addEventListener(
      'webglcontextrestored',
      handleContextRestored
    );

    window.addEventListener('resize', handleResize);

    handleResize();

    const initialize = async () => {
      try {
        onLoadingProgress?.(10);

        const assetBase = import.meta.env.BASE_URL || '/';

        const particlesUrl =
          `${assetBase}landing/webgl_asset/cardio-particles.bin`;

        onLoadingProgress?.(20);

        const {
          particleData,
          particleCount,
          center,
          maxSize,
          heartBounds
        } = await loadCardioParticles(particlesUrl);

        if (cancelled) return;

        onLoadingProgress?.(80);

        // Preserve the existing quality selection behavior.
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
            .test(navigator.userAgent);

        const hardwareConcurrency =
          navigator.hardwareConcurrency || 4;

        const deviceMemory =
          navigator.deviceMemory || 4;

        let effectiveQuality = quality;

        if (quality === 'auto') {
          if (isMobile) {
            effectiveQuality = 'low';

            if (
              hardwareConcurrency >= 6 &&
              deviceMemory >= 4
            ) {
              effectiveQuality = 'medium';
            }
          } else {
            effectiveQuality = 'medium';

            if (
              hardwareConcurrency >= 8 &&
              deviceMemory >= 8
            ) {
              effectiveQuality = 'high';
            }

            if (hardwareConcurrency <= 4) {
              effectiveQuality = 'low';
            }
          }
        }

        const currentAppearance = appearanceRef.current;

        let baseConfig = getFlatConfig(
          currentAppearance.theme
        );

        if (
          [
            'low',
            'medium',
            'high',
            'ultra',
            'calm',
            'energetic',
            'minimal'
          ].includes(effectiveQuality)
        ) {
          const presetMap = {
            low: 'minimal',
            medium: 'calm',
            high: 'energetic',
            ultra: 'maximum'
          };

          const presetName =
            presetMap[effectiveQuality] || effectiveQuality;

          baseConfig = applyPreset(
            presetName,
            baseConfig
          );
        }

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

        baseConfig.enableDragRotation =
          enableDragRotation;

        baseConfig.enableWheelZoom =
          enableWheelZoom;

        baseConfig.backgroundColorRgb =
          hexToRgbNormalized(
            currentAppearance.backgroundColor
          );

        baseConfig.contentOffset =
          currentAppearance.contentOffset;

        baseConfig = {
          ...baseConfig,
          ...currentAppearance.configOverrides
        };

        // The pre-generated asset must match the particle count
        // requested by the existing rendering configuration.
        if (
          baseConfig.particleCount > 0 &&
          baseConfig.particleCount !== particleCount
        ) {
          throw new Error(
            `Cardio particle count mismatch: ` +
            `expected ${baseConfig.particleCount}, ` +
            `received ${particleCount}`
          );
        }

        if (cancelled) return;

        if (gl.isContextLost()) {
          throw new Error(
            'WebGL context lost during initialization'
          );
        }

        const renderer = createRenderer(
          gl,
          canvas,
          baseConfig,
          particleData,
          particleCount,
          center,
          maxSize,
          heartBounds,
          scrollProgressRef
        );

        rendererInstance = renderer;

        await renderer.init();

        rendererReady = true;

        if (cancelled) {
          renderer.dispose?.();
          return;
        }

        if (gl.isContextLost()) {
          throw new Error(
            'WebGL context lost after renderer initialization'
          );
        }

        rendererRef.current = renderer;

        onLoadingProgress?.(100);
        onInitialized?.();

        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;

        let lastFrameTime = 0;

        const renderLoop = (time) => {
          if (cancelled || gl.isContextLost()) {
            return;
          }

          if (!pausedRef.current) {
            const elapsed = time - lastFrameTime;

            if (elapsed > frameInterval) {
              lastFrameTime =
                time - (elapsed % frameInterval);

              renderer.render(time);
            }
          }

          animationFrameId =
            requestAnimationFrame(renderLoop);
        };

        animationFrameId =
          requestAnimationFrame(renderLoop);

      } catch (error) {
        if (rendererInstance) {
          rendererInstance.dispose?.();

          if (rendererRef.current === rendererInstance) {
            rendererRef.current = null;
          }
        }

        if (cancelled) return;

        console.error(
          'CardioBackground initialization error:',
          error
        );

        setIsSupported(false);

        onError?.(
          error instanceof Error
            ? error.message
            : 'Failed to initialize 3D background'
        );
      }
    };

    initialize();

    return () => {
      cancelled = true;

      window.removeEventListener(
        'resize',
        handleResize
      );

      canvas.removeEventListener(
        'webglcontextlost',
        handleContextLost
      );

      canvas.removeEventListener(
        'webglcontextrestored',
        handleContextRestored
      );

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // If initialization is still pending, its own cancelled
      // check disposes the renderer after initialization settles.
      if (rendererInstance && rendererReady) {
        rendererInstance.dispose?.();
      }

      if (rendererRef.current === rendererInstance) {
        rendererRef.current = null;
      }
    };
  }, [
    quality,
    interactive,
    autoRotate,
    enableDragRotation,
    enableWheelZoom
  ]);

  if (!isSupported) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: backgroundColor
        }}
      >
        WebGL2 Not Supported
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      tabIndex={interactive ? 0 : -1}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        zIndex: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        touchAction: 'none',
        outline: 'none',
        ...style
      }}
      onMouseDown={() => {
        if (interactive) {
          canvasRef.current?.focus();
        }
      }}
      onContextMenu={(event) => {
        if (!enableDragRotation && interactive) {
          event.preventDefault();
        }
      }}
    />
  );
});

export default CardioBackground;
