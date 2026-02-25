import { createProgramFromSources } from './utils.js';
import * as mat from '../lib/gl-matrix-helpers.js';
import { createAmbientParticleRenderer } from '../ambient-particles/renderer.js';
import { createConnectionRenderer } from './connection-renderer.js';
import { createGlowRenderer } from './glow-renderer.js';

// Import shaders
import heartVert from '../shaders/heart-particle.vert?raw';
import heartFrag from '../shaders/heart-particle.frag?raw';

export function createRenderer(gl, canvas, config, particles, PARTICLE_COUNT, center, maxSize, heartBounds, scrollProgressRef) {
    let program, uniforms, vao;
    let distance, rotationX, rotationY, isDragging, lastMouseX, lastMouseY;
    let mouseWorldPos, targetMousePos, isMouseActive;
    let portalMousePos = [0, 0]; // Normalized mouse position for portal (-1 to 1)
    let targetPortalMousePos = [0, 0]; // Target mouse position (updated on mousemove)
    let tiltX = 0, tiltY = 0;
    let targetTiltX = 0, targetTiltY = 0;
    let frameCount = 0;
    let lastTime = 0;
    let lastVideoTime = -1; // Track last video frame time to avoid redundant texture updates
    let ambientRenderer;
    let connectionRenderer;
    let glowRenderer;
    let bgColor; // Default background color
    
    // Portal rendering
    let portalProgram, portalUniforms, portalVao, portalBuffer;
    let portalVideoTexture, portalNoiseTexture;
    let portalVideo, portalInitialized = false;
    const PORTAL_POSITION = [-maxSize * 4.0, 0, 0]; // Far left side of scene (negative X)
    const PORTAL_SIZE = maxSize * 0.4; // 50% of original width (0.8 * 0.5 = 0.4)
    const PORTAL_TARGET_NDC = { x: -0.8, y: 0.0 }; // Point on canvas to zoom into
    const PORTAL_TARGET_SIZE_PX = 1500; // Final size of portal in pixels (when scrollProgress = 1)
    
    // Event listeners storage for cleanup
    const eventListeners = [];

    function addEventListener(target, type, handler, options) {
        target.addEventListener(type, handler, options);
        eventListeners.push({ target, type, handler, options });
    }

    async function init() {
        // Context should already be validated in CardioBackground, but double-check
        if (!gl) {
            throw new Error('WebGL context is null in renderer.init()');
        }
        
        // Verify WebGL2 context
        const version = gl.getParameter(gl.VERSION);
        const shadingLang = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        
        console.log('Renderer init - WebGL Version:', version);
        console.log('Renderer init - GLSL Version:', shadingLang);
        
        // Check if WebGL2 is actually available
        if (!version) {
            throw new Error('WebGL version parameter is null. This usually means the context was lost or invalidated. Try refreshing the page.');
        }
        
        if (typeof version === 'string' && !version.includes('WebGL 2.0')) {
            throw new Error(`WebGL2 not available. Detected: ${version}. GLSL: ${shadingLang}`);
        }
        
        // Test WebGL2 support with a simple shader first
        // Use proper spacing in layout qualifier
        const testVert = `#version 300 es
precision highp float;
layout (location = 0) in vec3 a_pos;
void main() { 
    gl_Position = vec4(a_pos, 1.0); 
}`;
        
        const testFrag = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() { 
    fragColor = vec4(1.0); 
}`;
        
        try {
            const testProgram = createProgramFromSources(gl, testVert, testFrag);
            gl.deleteProgram(testProgram);
            console.log('WebGL2 shader compilation test passed');
        } catch (e) {
            console.error('WebGL2 shader compilation test failed:', e);
            console.error('WebGL Error Code:', gl.getError());
            throw new Error('WebGL2 shader compilation not working. Error: ' + e.message);
        }
        
        // Verify shaders are loaded
        if (!heartVert || typeof heartVert !== 'string') {
            throw new Error('Vertex shader not loaded correctly. Type: ' + typeof heartVert);
        }
        if (!heartFrag || typeof heartFrag !== 'string') {
            throw new Error('Fragment shader not loaded correctly. Type: ' + typeof heartFrag);
        }
        
        console.log('Vertex shader length:', heartVert.length);
        console.log('Fragment shader length:', heartFrag.length);
        console.log('Vertex shader starts with:', heartVert.substring(0, 50));
        console.log('Fragment shader starts with:', heartFrag.substring(0, 50));
        
        // Check for common shader issues
        if (!heartVert.includes('#version 300 es')) {
            throw new Error('Vertex shader missing #version 300 es directive');
        }
        if (!heartFrag.includes('#version 300 es')) {
            throw new Error('Fragment shader missing #version 300 es directive');
        }
        
        program = createProgramFromSources(gl, heartVert, heartFrag);
        gl.useProgram(program);

        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        const sizeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.sizes, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);

        const phaseBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, phaseBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.phases, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0);

        const aoBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, aoBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.ao, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 1, gl.FLOAT, false, 0, 0);

        const meshIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, meshIndexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, particles.meshIndices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 1, gl.FLOAT, false, 0, 0);

        // Cache uniform locations to avoid repeated lookups
        const locationCache = new Map();
        function getUniform(name) {
            if (!locationCache.has(name)) {
                locationCache.set(name, gl.getUniformLocation(program, name));
            }
            return locationCache.get(name);
        }

        // Initialize uniforms object using cached lookups
        uniforms = {
          uModel: getUniform('u_model'),
          uView: getUniform('u_view'),
          uProjection: getUniform('u_projection'),
          uTime: getUniform('u_time'),
          uHeartCenter: getUniform('u_heartCenter'),
          uPointSize: getUniform('u_pointSize'),
          uMousePos: getUniform('u_mousePos'),
          uMouseRadius: getUniform('u_mouseRadius'),
          uMouseGrowStrength: getUniform('u_mouseGrowStrength'),
          // DOF uniforms
          uDofEnabled: getUniform('u_dofEnabled'),
          uDofFocalDistance: getUniform('u_dofFocalDistance'),
          uDofFocalRange: getUniform('u_dofFocalRange'),
          uDofAperture: getUniform('u_dofAperture'),
          uDofFocalLength: getUniform('u_dofFocalLength'),
          uDofBokehScale: getUniform('u_dofBokehScale'),
          uDofNearBlurStart: getUniform('u_dofNearBlurStart'),
          uDofNearBlurStrength: getUniform('u_dofNearBlurStrength'),
          uDofFarBlurStart: getUniform('u_dofFarBlurStart'),
          uDofFarBlurStrength: getUniform('u_dofFarBlurStrength'),
          uDofDepthDarkening: getUniform('u_dofDepthDarkening'),
          uDofDepthDesaturation: getUniform('u_dofDepthDesaturation'),
          uDofAtmosphericFade: getUniform('u_dofAtmosphericFade'),
          uDofBokehIntensity: getUniform('u_dofBokehIntensity'),
          uDofBokehRotation: getUniform('u_dofBokehRotation'),
          uDofBokehRoundness: getUniform('u_dofBokehRoundness'),
          uDofEdgeBias: getUniform('u_dofEdgeBias'),
          uDofBokehShape: getUniform('u_dofBokehShape'),
          uDofChromaticAberration: getUniform('u_dofChromaticAberration'),
          uHeartColorEnabled: getUniform('u_heartColorEnabled'),
          uHeartColorTint: getUniform('u_heartColorTint'),
          uHeartOpacity: getUniform('u_heartOpacity')
        };

        gl.uniform3fv(uniforms.uHeartCenter, [0, 0, 0]);
        gl.uniform1f(uniforms.uPointSize, 5);
        
        // Initialize heart opacity to 1.0 (fully visible)
        if (uniforms.uHeartOpacity !== null && uniforms.uHeartOpacity !== undefined) {
          gl.uniform1f(uniforms.uHeartOpacity, 1.0);
        }

        mouseWorldPos = [0, 0, -100];
        targetMousePos = [0, 0, -100];
        isMouseActive = false;

        distance = maxSize * 2.5;
        rotationX = 0;
        rotationY = 0;
        isDragging = false;
        lastMouseX = 0;
        lastMouseY = 0;

        // Set initial background color from config
        bgColor = config.backgroundColorRgb || [0.04, 0.04, 0.06];

        // Mouse drag interaction (rotate camera) - only if enabled
        if (config.enableDragRotation !== false) {
          canvas.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Prevent event from bubbling
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            if (config.enableDragRotation !== false) {
              canvas.style.cursor = 'grabbing';
            }
          }, { passive: true });

          canvas.addEventListener('mouseup', () => {
            isDragging = false;
            if (config.enableDragRotation !== false) {
              canvas.style.cursor = 'grab';
            }
          }, { passive: true });
        }

        // Mouse move handler - always needed for particle interaction
        canvas.addEventListener('mousemove', (e) => {
          // Handle camera rotation when dragging (only if drag rotation is enabled)
          if (config.enableDragRotation !== false && isDragging) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            rotationY += deltaX * 0.005;
            rotationX += deltaY * 0.005;
            
            rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
          }
          
          // Mouse position for particle interaction (heart grow effect) - always active
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 2 - 1;
          const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
          
          // Store normalized mouse position for portal (window coordinates like reference)
          // Update target position directly (will be smoothly interpolated in render loop)
          targetPortalMousePos[0] = (e.clientX / window.innerWidth) * 2.0 - 1.0;
          targetPortalMousePos[1] = -((e.clientY / window.innerHeight) * 2.0 - 1.0);
          
          // Set target for camera tilt
          if (config.cameraTiltEnabled) {
            targetTiltX = y * config.cameraTiltStrength;
            targetTiltY = -x * config.cameraTiltStrength;
          }
          
          const aspect = canvas.clientWidth / canvas.clientHeight;
          const fovRad = config.fov;
          const tanHalfFov = Math.tan(fovRad / 2);
          
          // Calculate content/camera offset to correct mouse position
          let cameraOffsetX = 0;
          let cameraOffsetY = 0;
          
          if (config.contentOffset && (config.contentOffset.x !== 0 || config.contentOffset.y !== 0)) {
              const visibleHeight = 2.0 * distance * tanHalfFov;
              const visibleWidth = visibleHeight * aspect;
              cameraOffsetX = -config.contentOffset.x * visibleWidth;
              cameraOffsetY = config.contentOffset.y * visibleHeight;
          }
          
          // Calculate mouse position relative to the shifted camera
          const worldX = (x * distance * tanHalfFov * aspect) + cameraOffsetX;
          const worldY = (y * distance * tanHalfFov) + cameraOffsetY;
          
          const cosY = Math.cos(-rotationY);
          const sinY = Math.sin(-rotationY);
          const cosX = Math.cos(-rotationX);
          const sinX = Math.sin(-rotationX);
          
          // Apply inverse camera rotation to the mouse position
          // We need to subtract the camera offset BEFORE rotation if the rotation is around the center
          // But wait, the camera moves, and it looks AT the target which is ALSO moved.
          // So the entire coordinate system is just shifted.
          // The rotation happens around the pivot point (cameraCenter).
          // So we should treat the position relative to the pivot.
          
          // worldX/Y are already absolute world coordinates on the focus plane (z=0)
          // We need to rotate this point around the new center (cameraOffsetX, cameraOffsetY, 0)
          
          const relX = worldX - cameraOffsetX;
          const relY = worldY - cameraOffsetY;
          
          // Rotate the relative vector
          const rotatedX = relX * cosY + relY * sinX * sinY;
          const rotatedY = relY * cosX;
          const rotatedZ = -relX * sinY + relY * sinX * cosY;
          
          // Add the offset back to get the final position
          const finalX = rotatedX + cameraOffsetX;
          const finalY = rotatedY + cameraOffsetY;
          const finalZ = rotatedZ;

          targetMousePos = [finalX, finalY, finalZ];
          isMouseActive = true;
        }, { passive: true });

        canvas.addEventListener('mouseleave', () => {
          isDragging = false;
          canvas.style.cursor = config.enableDragRotation !== false ? 'grab' : 'default';
          targetMousePos = [0, 0, -100];
          isMouseActive = false;
          
          // Reset camera tilt
          if (config.cameraTiltEnabled) {
            targetTiltX = 0;
            targetTiltY = 0;
          }
        }, { passive: true });

        // Mouse wheel zoom - only if enabled
        if (config.enableWheelZoom !== false) {
          canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            distance *= (1 + e.deltaY * 0.001);
            distance = Math.max(maxSize * 0.5, Math.min(maxSize * 10, distance));
          }, { passive: false });
        }

        canvas.style.cursor = config.enableDragRotation !== false ? 'grab' : 'default';

        // Initialize ambient particle renderer
        ambientRenderer = createAmbientParticleRenderer(gl, config, heartBounds, center);
        await ambientRenderer.init();
        
        // Initialize connection renderer
        connectionRenderer = createConnectionRenderer(gl, config, particles, PARTICLE_COUNT, center, maxSize);
        await connectionRenderer.init();
        
        // Initialize glow renderer
        glowRenderer = createGlowRenderer(gl, config);
        await glowRenderer.init();
        
        // Initialize portal
        await initPortal();
    }
    
    async function initPortal() {
        // Portal vertex shader (WebGL2 compatible)
        const portalVert = `#version 300 es
precision highp float;
layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec2 v_uv;

void main() {
    v_uv = a_uv;
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}`;

        // Portal fragment shader (WebGL2 compatible, simplified version)
        const portalFrag = `#version 300 es
precision highp float;

uniform float u_time;
uniform sampler2D u_texture;
uniform sampler2D u_noise;
uniform vec2 u_mouse;
uniform float u_zoomProgress; // 0 = far (particle-like), 1 = close (portal)
uniform vec3 u_particleColor; // Color to blend with when far
uniform float u_aberration;
uniform float u_distortion;
uniform float u_distortionScale;
uniform float u_ringRadius;
uniform float u_ringThickness;
uniform float u_swirlSpeed;
uniform float u_smokeDensity;
uniform vec3 u_smokeColor;
uniform float u_fogStart;
uniform float u_fogEnd;
uniform vec3 u_fogColor;

in vec2 v_uv;
out vec4 fragColor;

float getLuminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
    vec2 centeredUV = v_uv - 0.5;
    float dist = length(centeredUV);
    
    // IMAGE PROCESSING LAYER: distortion, aberration, B&W
    vec2 noiseUV = centeredUV * u_distortionScale + u_time * 0.02;
    vec2 mouseOffset = u_mouse * 0.03;
    float n = texture(u_noise, noiseUV + mouseOffset).r;
    vec2 displacedUV = v_uv + (n - 0.5) * u_distortion + mouseOffset;
    
    // Chromatic aberration, shifts channels with radius
    float aber = u_aberration * (1.0 + pow(dist / u_ringRadius, 1.45));
    vec3 texR = texture(u_texture, clamp(displacedUV + vec2(aber, 0.0), 0.0, 1.0)).rgb;
    vec3 texG = texture(u_texture, clamp(displacedUV, 0.0, 1.0)).rgb;
    vec3 texB = texture(u_texture, clamp(displacedUV - vec2(aber, 0.0), 0.0, 1.0)).rgb;
    
    float lumR = getLuminance(texR);
    float lumG = getLuminance(texG);
    float lumB = getLuminance(texB);
    vec3 imageBW = vec3(lumR, lumG, lumB);
    
    // FOG MIX: White at the outer edge, image at center
    float fogIntensity = smoothstep(u_fogStart, u_fogEnd, dist);
    fogIntensity = pow(fogIntensity, 1.4);
    vec3 imgFog = mix(imageBW, u_fogColor, fogIntensity);
    
    // FRACTAL SMOKE RING LAYER (only on ring)
    float ringCenter = u_ringRadius;
    float thickness = u_ringThickness;
    float angle = atan(centeredUV.y, centeredUV.x);
    float polarU = (angle / 3.14159265359 + 1.0) * 0.5;
    float polarV = dist;
    
    vec2 uv1 = vec2(mod(polarU + u_time * u_swirlSpeed, 1.0), mod(polarV + u_time * 0.02, 1.0));
    vec2 uv2 = vec2(mod(polarU * 2.063 + u_time * u_swirlSpeed * 0.7, 1.0), mod(polarV * 1.34 + u_time * 0.015, 1.0));
    vec2 uv3 = vec2(mod(polarU * 4.26 + u_time * u_swirlSpeed * 1.4, 1.0), mod(polarV * 2.13 + u_time * 0.08, 1.0));
    
    float turbR = texture(u_noise, uv1).r;
    float turbG = texture(u_noise, uv2).g;
    float turbB = texture(u_noise, uv3).b;
    float smokeTurbulence = 0.5 * turbR + 0.3 * turbG + 0.2 * turbB;
    
    float smokyThickness = thickness * (1.0 + 0.5 * smokeTurbulence);
    float ringMask = 1.0 - smoothstep(0.0, smokyThickness, abs(dist - ringCenter));
    ringMask *= 0.85 + 0.15 * smokeTurbulence;
    
    float smokeIntensity = clamp(ringMask * u_smokeDensity, 0.0, 1.0);
    
    // Compose: image+fog base mixed with smoke only on ring
    vec3 smokeColor = u_smokeColor;
    vec3 colorFinal = mix(imgFog, smokeColor, smokeIntensity);
    
    // Blend between particle color (when far) and portal color (when close)
    vec3 finalColor = mix(u_particleColor, colorFinal, u_zoomProgress);
    
    // Clean circle alpha mask with NO shadows
    float outerAlpha = 1.0 - smoothstep(u_fogEnd - 0.018, u_fogEnd, dist);
    if (outerAlpha < 0.01) discard;
    
    // Make portal invisible initially (when zoomProgress is 0) and visible when zoomed in
    // Only show portal when zoom progress is significant (> 0.15)
    float visibilityProgress = smoothstep(0.0, 0.25, u_zoomProgress);
    outerAlpha *= visibilityProgress;
    
    // Completely invisible when zoomProgress is 0
    if (u_zoomProgress < 0.01) {
        outerAlpha = 0.0;
    }
    
    fragColor = vec4(finalColor, outerAlpha);
}`;

        try {
            portalProgram = createProgramFromSources(gl, portalVert, portalFrag);
            
            // Create portal plane geometry
            const portalSize = PORTAL_SIZE;
            const positions = new Float32Array([
                -portalSize, -portalSize, 0,
                portalSize, -portalSize, 0,
                -portalSize, portalSize, 0,
                portalSize, portalSize, 0
            ]);
            
            const uvs = new Float32Array([
                0, 0,
                1, 0,
                0, 1,
                1, 1
            ]);
            
            portalVao = gl.createVertexArray();
            gl.bindVertexArray(portalVao);
            
            // Position buffer
            portalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, portalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            
            // UV buffer
            const uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
            
            // Get uniform locations
            portalUniforms = {
                u_model: gl.getUniformLocation(portalProgram, 'u_model'),
                u_view: gl.getUniformLocation(portalProgram, 'u_view'),
                u_projection: gl.getUniformLocation(portalProgram, 'u_projection'),
                u_time: gl.getUniformLocation(portalProgram, 'u_time'),
                u_texture: gl.getUniformLocation(portalProgram, 'u_texture'),
                u_noise: gl.getUniformLocation(portalProgram, 'u_noise'),
                u_mouse: gl.getUniformLocation(portalProgram, 'u_mouse'),
                u_zoomProgress: gl.getUniformLocation(portalProgram, 'u_zoomProgress'),
                u_particleColor: gl.getUniformLocation(portalProgram, 'u_particleColor'),
                u_aberration: gl.getUniformLocation(portalProgram, 'u_aberration'),
                u_distortion: gl.getUniformLocation(portalProgram, 'u_distortion'),
                u_distortionScale: gl.getUniformLocation(portalProgram, 'u_distortionScale'),
                u_ringRadius: gl.getUniformLocation(portalProgram, 'u_ringRadius'),
                u_ringThickness: gl.getUniformLocation(portalProgram, 'u_ringThickness'),
                u_swirlSpeed: gl.getUniformLocation(portalProgram, 'u_swirlSpeed'),
                u_smokeDensity: gl.getUniformLocation(portalProgram, 'u_smokeDensity'),
                u_smokeColor: gl.getUniformLocation(portalProgram, 'u_smokeColor'),
                u_fogStart: gl.getUniformLocation(portalProgram, 'u_fogStart'),
                u_fogEnd: gl.getUniformLocation(portalProgram, 'u_fogEnd'),
                u_fogColor: gl.getUniformLocation(portalProgram, 'u_fogColor')
            };
            
            // Load video texture
            portalVideo = document.createElement('video');
            portalVideo.src = '/portal-video.mp4';
            portalVideo.loop = true;
            portalVideo.muted = true;
            portalVideo.playsInline = true;
            portalVideo.autoplay = true;
            portalVideo.crossOrigin = 'anonymous';
            portalVideo.style.display = 'none';
            document.body.appendChild(portalVideo);
            
            const onVideoCanPlay = () => {
                if (portalVideoTexture) return;
                
                portalVideoTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, portalVideoTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                
                // Load noise texture
                const noiseUrl = 'https://gist.githubusercontent.com/atdr/1bd65e54a3f51cd9e2a28e4e9e189b01/raw/08d3409bba9206af9f6a24cdfd99b82cae5de095/rgba-noise-small.png';
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    portalNoiseTexture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, portalNoiseTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    portalInitialized = true;
                };
                img.onerror = () => {
                    console.warn('Failed to load portal noise texture, using fallback');
                    // Create a simple noise texture as fallback
                    portalNoiseTexture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, portalNoiseTexture);
                    const size = 64;
                    const data = new Uint8Array(size * size * 4);
                    for (let i = 0; i < size * size; i++) {
                        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = Math.random() * 255;
                        data[i * 4 + 3] = 255;
                    }
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    portalInitialized = true;
                };
                img.src = noiseUrl;
            };
            
            portalVideo.addEventListener('canplay', onVideoCanPlay);
            portalVideo.load();
            portalVideo.play().catch(e => console.warn('Portal video play error:', e));
            
        } catch (error) {
            console.error('Failed to initialize portal:', error);
        }
    }
    
    function render(time) {
        const deltaTime = time - lastTime;
        lastTime = time;
        const timeInSeconds = time * 0.001;
        frameCount++;
        
        const aspect = canvas.clientWidth / canvas.clientHeight;
        if (aspect <= 0) return;
        
        // Get scroll progress
        const scrollProgress = scrollProgressRef ? scrollProgressRef.current : 0;
        
        // Portal animation: use actual elapsed time for continuous swirling (like reference)
        // The portal should animate continuously regardless of scroll progress
        const portalAnimationTime = timeInSeconds;
        
        if (config.autoRotate) {
          rotationY += 0.003;
        }
        
        const lerpFactor = 0.15;
        mouseWorldPos[0] += (targetMousePos[0] - mouseWorldPos[0]) * lerpFactor;
        mouseWorldPos[1] += (targetMousePos[1] - mouseWorldPos[1]) * lerpFactor;
        mouseWorldPos[2] += (targetMousePos[2] - mouseWorldPos[2]) * lerpFactor;
        
        // Smoothly interpolate tilt
        tiltX += (targetTiltX - tiltX) * lerpFactor;
        tiltY += (targetTiltY - tiltY) * lerpFactor;
        
        // Camera setup - keep distance constant (no zoom for portal)
        const baseDistance = maxSize * 2.5;
        const fovRad = config.fov;
        const tanHalfFov = Math.tan(fovRad / 2);
        
        // Derive the baseline camera framing that respects the configured content offset
        const baseVisibleHeight = 2.0 * baseDistance * tanHalfFov;
        const baseVisibleWidth = baseVisibleHeight * aspect;
        const contentOffset = config.contentOffset || { x: 0, y: 0 };
        const baseCameraX = -contentOffset.x * baseVisibleWidth;
        const baseCameraY = contentOffset.y * baseVisibleHeight;
        
        // Camera distance stays constant (no zoom for portal)
        const effectiveDistance = baseDistance;
        
        // Lock camera to the baseline frame
        const cameraOffsetX = baseCameraX;
        const cameraOffsetY = baseCameraY;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        // Use standard blending for the heart. Ambient renderer will set its own state.
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const translateToOrigin = mat.translate4(-center[0], -center[1], -center[2]);
        const modelMatrix = translateToOrigin;
        
        // Professional Fadeout Animation: Dispersion & Spin
        let dispersionScale = 1.0;
        let fadeRotation = 0.0;
        
        if (scrollProgress > 0.0) {
             // Scale up slightly as it fades (implosion/explosion effect)
             // Normalize progress to 0-0.5 range (duration of fade)
             const progress = Math.min(scrollProgress / 0.5, 1.0); 
             const ease = progress * progress; // x^2 easing (accelerating)
             
             dispersionScale = 1.0 + ease * 0.5; // Scale up to 1.5x
             fadeRotation = ease * 1.0; // Spin 1.0 radian
        }

        const rotY = mat.rotateY4(rotationY + fadeRotation);
        const rotX = mat.rotateX4(rotationX);
        const rotation = mat.multiply4(rotY, rotX);
        const animatedModel = mat.multiply4(modelMatrix, rotation);
        
        // Apply dispersion scale directly to the matrix
        if (dispersionScale !== 1.0) {
             animatedModel[0] *= dispersionScale;
             animatedModel[1] *= dispersionScale;
             animatedModel[2] *= dispersionScale;
             animatedModel[4] *= dispersionScale;
             animatedModel[5] *= dispersionScale;
             animatedModel[6] *= dispersionScale;
             animatedModel[8] *= dispersionScale;
             animatedModel[9] *= dispersionScale;
             animatedModel[10] *= dispersionScale;
        }
        
        const eye = [cameraOffsetX, cameraOffsetY, effectiveDistance];
        const cameraCenter = [cameraOffsetX, cameraOffsetY, 0];
        const up = [0, 1, 0];
        let view = mat.lookAt4(eye, cameraCenter, up);
        
        // Apply camera tilt
        if (config.cameraTiltEnabled) {
          const tiltMatrixY = mat.rotateY4(tiltY);
          const tiltMatrixX = mat.rotateX4(tiltX);
          const tiltMatrix = mat.multiply4(tiltMatrixY, tiltMatrixX);
          view = mat.multiply4(tiltMatrix, view);
        }
        
        let projection = mat.perspective4(config.fov, aspect, maxSize * 0.01, maxSize * 100);
        
        // ========================================
        // PORTAL ANIMATION
        // ========================================
        // All portal-related animations grouped together:
        // - Portal growth (0 to 300px)
        // - Heart particles fade out
        // - Heart connections fade out
        // - Heart glow fade out
        // - Ambient particles blur out (DOF)
        
        // Portal: completely independent view matrix (no heart rotation, no tilt)
        // Only calculate portal position if portal will be rendered (performance optimization)
        let portalView, portalWorldX, portalWorldY, portalWorldZ;
        if (portalInitialized && scrollProgress > 0.01) {
          const portalEye = [0, 0, effectiveDistance];
          const portalCameraCenter = [0, 0, 0];
          const portalUp = [0, 1, 0];
          portalView = mat.lookAt4(portalEye, portalCameraCenter, portalUp);
          
          // Calculate portal world position to appear at (-0.8, 0) in NDC
          const portalDistance = effectiveDistance * 0.5; // Fixed distance from camera
          const portalVisibleHeight = 2.0 * portalDistance * tanHalfFov;
          const portalVisibleWidth = portalVisibleHeight * aspect;
          
          // Base portal position
          portalWorldX = PORTAL_TARGET_NDC.x * portalVisibleWidth * 0.5;
          portalWorldY = PORTAL_TARGET_NDC.y * portalVisibleHeight * 0.5;
          portalWorldZ = -portalDistance; // In front of camera (negative Z in view space)
          
          // Natural particle-like floating animation using multiple sine waves and physics
          const floatSpeed = config.portalFloatSpeed !== undefined ? config.portalFloatSpeed : 0.3;
          const floatAmount = config.portalFloatAmount !== undefined ? config.portalFloatAmount : 0.02;
          const floatAmountX = portalVisibleWidth * floatAmount;
          const floatAmountY = portalVisibleHeight * floatAmount;
          const floatAmountZ = portalDistance * (floatAmount * 0.5);
          
          // Use multiple sine waves with different frequencies and phases for organic motion
          // Each axis uses 3-4 different frequencies combined
          const t = timeInSeconds * floatSpeed;
          
          // X-axis: combination of multiple frequencies
          const x1 = Math.sin(t * 0.7) * 0.4;
          const x2 = Math.sin(t * 1.3 + 1.2) * 0.3;
          const x3 = Math.sin(t * 0.4 + 2.5) * 0.2;
          const x4 = Math.sin(t * 2.1 + 0.8) * 0.1;
          const xOffset = (x1 + x2 + x3 + x4) * floatAmountX;
          
          // Y-axis: different frequencies and phases
          const y1 = Math.cos(t * 0.5 + 0.5) * 0.4;
          const y2 = Math.cos(t * 1.1 + 2.1) * 0.3;
          const y3 = Math.cos(t * 0.6 + 1.7) * 0.2;
          const y4 = Math.cos(t * 1.8 + 0.3) * 0.1;
          const yOffset = (y1 + y2 + y3 + y4) * floatAmountY;
          
          // Z-axis: slower, more subtle movement
          const z1 = Math.sin(t * 0.3 + 1.0) * 0.5;
          const z2 = Math.sin(t * 0.7 + 3.0) * 0.3;
          const z3 = Math.sin(t * 0.2 + 2.0) * 0.2;
          const zOffset = (z1 + z2 + z3) * floatAmountZ;
          
          portalWorldX += xOffset;
          portalWorldY += yOffset;
          portalWorldZ += zOffset;
        }
        
        // Portal Animation: Calculate fade opacity for all heart effects
        // All heart elements (glow, connections, particles) fade out completely by scrollProgress = 0.5
        let heartFadeOpacity = 1.0;
        let heartOpacity = 1.0;
        if (scrollProgress > 0.0) {
          // Fade out completely by 50% of animation progress
          const fadeProgress = Math.min(scrollProgress / 0.5, 1.0);
          
          // Use non-linear fade for smoother look (ease-in to transparency)
          // Starts fading slowly, then disappears quickly
          const fade = Math.pow(1.0 - fadeProgress, 1.5);
          
          heartFadeOpacity = Math.max(0.0, fade);
          heartOpacity = Math.max(0.0, fade);
        }
        
        // Portal Animation: Render glow effect (fades out as portal grows)
        if (glowRenderer) {
          const heartCenter = [0, 0, 0];
          glowRenderer.render(animatedModel, view, projection, heartCenter, maxSize, heartFadeOpacity);
        }
        
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        
        gl.uniformMatrix4fv(uniforms.uModel, false, animatedModel);
        gl.uniformMatrix4fv(uniforms.uView, false, view);
        gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
        gl.uniform1f(uniforms.uTime, timeInSeconds * config.heartRate);
        gl.uniform1f(uniforms.uPointSize, config.heartPointSize);
        gl.uniform3f(uniforms.uMousePos, mouseWorldPos[0], mouseWorldPos[1], mouseWorldPos[2]);
        gl.uniform1f(uniforms.uMouseRadius, config.mouseRadius * maxSize * 0.5);
        gl.uniform1f(uniforms.uMouseGrowStrength, config.heartGrow);
        
        // Set DOF uniforms
        gl.uniform1i(uniforms.uDofEnabled, config.dofEnabled ? 1 : 0);
        gl.uniform1f(uniforms.uDofFocalDistance, config.dofFocalDistance * maxSize);
        gl.uniform1f(uniforms.uDofFocalRange, config.dofFocalRange * maxSize);
        gl.uniform1f(uniforms.uDofAperture, config.dofAperture);
        gl.uniform1f(uniforms.uDofFocalLength, config.dofFocalLength);
        gl.uniform1f(uniforms.uDofBokehScale, config.dofBokehScale);
        gl.uniform1f(uniforms.uDofNearBlurStart, config.dofNearBlurStart * maxSize);
        gl.uniform1f(uniforms.uDofNearBlurStrength, config.dofNearBlurStrength);
        gl.uniform1f(uniforms.uDofFarBlurStart, config.dofFarBlurStart * maxSize);
        gl.uniform1f(uniforms.uDofFarBlurStrength, config.dofFarBlurStrength);
        gl.uniform1f(uniforms.uDofDepthDarkening, config.dofDepthDarkening);
        gl.uniform1f(uniforms.uDofDepthDesaturation, config.dofDepthDesaturation);
        gl.uniform1f(uniforms.uDofAtmosphericFade, config.dofAtmosphericFade);
        gl.uniform1f(uniforms.uDofBokehIntensity, config.dofBokehIntensity);
        gl.uniform1f(uniforms.uDofBokehRotation, config.dofBokehRotation);
        gl.uniform1f(uniforms.uDofBokehRoundness, config.dofBokehRoundness);
        gl.uniform1f(uniforms.uDofEdgeBias, config.dofEdgeBias);
        
        // Convert bokeh shape string to int
        let bokehShapeInt = 0;
        if (config.dofBokehShape === 'hexagon') bokehShapeInt = 1;
        else if (config.dofBokehShape === 'octagon') bokehShapeInt = 2;
        gl.uniform1i(uniforms.uDofBokehShape, bokehShapeInt);
        
        gl.uniform1f(uniforms.uDofChromaticAberration, config.dofChromaticAberration);
        
        // Heart color tint
        if (config.heartColor && uniforms.uHeartColorEnabled && uniforms.uHeartColorTint) {
          gl.uniform1i(uniforms.uHeartColorEnabled, 1);
          gl.uniform3fv(uniforms.uHeartColorTint, config.heartColor);
        } else if (uniforms.uHeartColorEnabled) {
          gl.uniform1i(uniforms.uHeartColorEnabled, 0);
        }
        
        // DEBUG: Log DOF settings on first frame
        if (frameCount === 1) {
          console.log('🎨 DOF DEBUG:', {
            enabled: config.dofEnabled,
            focalDistance: config.dofFocalDistance * maxSize,
            focalRange: config.dofFocalRange * maxSize,
            aperture: config.dofAperture,
            bokehIntensity: config.dofBokehIntensity,
            bokehScale: config.dofBokehScale,
            bokehShape: config.dofBokehShape,
            maxSize: maxSize
          });
        }

        // Portal Animation: Render connections (fade out as portal grows)
        if (connectionRenderer) {
          connectionRenderer.render(animatedModel, view, projection, timeInSeconds, heartFadeOpacity);
        }
        
        // ** FIX: Re-bind particle program and VAO before drawing particles **
        // The connection renderer uses its own program, so we need to switch back
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        
        // Update uniforms that change every frame
        // Matrices
        gl.uniformMatrix4fv(uniforms.uModel, false, animatedModel);
        gl.uniformMatrix4fv(uniforms.uView, false, view);
        gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
        
        // Time & Interaction
        gl.uniform1f(uniforms.uTime, timeInSeconds * config.heartRate);
        gl.uniform1f(uniforms.uPointSize, config.heartPointSize);
        gl.uniform3f(uniforms.uMousePos, mouseWorldPos[0], mouseWorldPos[1], mouseWorldPos[2]);
        gl.uniform1f(uniforms.uMouseRadius, config.mouseRadius * maxSize * 0.5);
        gl.uniform1f(uniforms.uMouseGrowStrength, config.heartGrow);
        
        // Portal Animation: DOF blur for ambient particles (blur out as portal grows)
        const dynamicDofEnabled = config.dofEnabled || scrollProgress > 0.01;
        
        if (dynamicDofEnabled) {
            gl.uniform1i(uniforms.uDofEnabled, 1);
            
            // Base values from config
            let focalDist = config.dofFocalDistance * maxSize;
            let focalRange = config.dofFocalRange * maxSize;
            let aperture = config.dofAperture;
            let nearBlurStart = config.dofNearBlurStart * maxSize;
            let nearBlurStrength = config.dofNearBlurStrength;
            let farBlurStart = config.dofFarBlurStart * maxSize;
            let farBlurStrength = config.dofFarBlurStrength;
            let atmosphericFade = config.dofAtmosphericFade;
            
            // As portal grows, focus on portal and blur everything else
            if (scrollProgress > 0.01 && portalWorldZ !== undefined) {
                const portalDistanceFromCamera = Math.abs(portalWorldZ);
                const focusProgress = scrollProgress;
                
                // Focus shifts to portal distance (portal stays sharp, everything else blurs)
                focalDist = focalDist * (1 - focusProgress) + portalDistanceFromCamera * focusProgress;
                focalRange = focalRange * (1 - focusProgress) + (maxSize * 0.02) * focusProgress;
                aperture = aperture * (1 - focusProgress) + 3.0 * focusProgress;
                nearBlurStrength = nearBlurStrength * (1 - focusProgress) + 5.0 * focusProgress;
                farBlurStrength = farBlurStrength * (1 - focusProgress) + 5.0 * focusProgress;
                nearBlurStart = nearBlurStart * (1 - focusProgress) + (maxSize * 0.01) * focusProgress;
                farBlurStart = farBlurStart * (1 - focusProgress) + (maxSize * 0.01) * focusProgress;
                atmosphericFade = atmosphericFade * (1 - focusProgress) + 1.5 * focusProgress;
            }
            
            gl.uniform1f(uniforms.uDofFocalDistance, focalDist);
            gl.uniform1f(uniforms.uDofFocalRange, focalRange);
            gl.uniform1f(uniforms.uDofAperture, aperture);
            gl.uniform1f(uniforms.uDofFocalLength, config.dofFocalLength);
            gl.uniform1f(uniforms.uDofBokehScale, config.dofBokehScale);
            gl.uniform1f(uniforms.uDofNearBlurStart, nearBlurStart);
            gl.uniform1f(uniforms.uDofNearBlurStrength, nearBlurStrength);
            gl.uniform1f(uniforms.uDofFarBlurStart, farBlurStart);
            gl.uniform1f(uniforms.uDofFarBlurStrength, farBlurStrength);
            gl.uniform1f(uniforms.uDofDepthDarkening, config.dofDepthDarkening);
            gl.uniform1f(uniforms.uDofDepthDesaturation, config.dofDepthDesaturation);
            gl.uniform1f(uniforms.uDofAtmosphericFade, atmosphericFade);
            gl.uniform1f(uniforms.uDofBokehIntensity, config.dofBokehIntensity);
            gl.uniform1f(uniforms.uDofBokehRotation, config.dofBokehRotation);
            gl.uniform1f(uniforms.uDofBokehRoundness, config.dofBokehRoundness);
            gl.uniform1f(uniforms.uDofEdgeBias, config.dofEdgeBias);
            
            let bokehShapeInt = 0;
            if (config.dofBokehShape === 'hexagon') bokehShapeInt = 1;
            else if (config.dofBokehShape === 'octagon') bokehShapeInt = 2;
            gl.uniform1i(uniforms.uDofBokehShape, bokehShapeInt);
            
            gl.uniform1f(uniforms.uDofChromaticAberration, config.dofChromaticAberration);
        } else {
            gl.uniform1i(uniforms.uDofEnabled, 0);
        }
        
        // Portal Animation: Heart particle opacity fade (set uniform)
        if (uniforms.uHeartOpacity !== null && uniforms.uHeartOpacity !== undefined) {
          gl.uniform1f(uniforms.uHeartOpacity, heartOpacity);
        }
        
        // Heart color tint
        if (config.heartColor && uniforms.uHeartColorEnabled && uniforms.uHeartColorTint) {
          gl.uniform1i(uniforms.uHeartColorEnabled, 1);
          gl.uniform3fv(uniforms.uHeartColorTint, config.heartColor);
        } else if (uniforms.uHeartColorEnabled) {
          gl.uniform1i(uniforms.uHeartColorEnabled, 0);
        }

        gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

        // Portal Animation: Render ambient particles (blur out as portal grows)
        if (ambientRenderer) {
          let ambientOpacity = 1.0;
          if (scrollProgress > 0.0) {
             // Fade out linearly to 0 at 100% progress
             ambientOpacity = Math.max(0.0, 1.0 - scrollProgress);
          }

          if (scrollProgress > 0.01) {
            // Temporarily update config DOF values for portal growth blur effect
            const originalDofEnabled = config.dofEnabled;
            const originalFocalDistance = config.dofFocalDistance;
            const originalFocalRange = config.dofFocalRange;
            const originalAperture = config.dofAperture;
            const originalNearBlurStart = config.dofNearBlurStart;
            const originalNearBlurStrength = config.dofNearBlurStrength;
            const originalFarBlurStart = config.dofFarBlurStart;
            const originalFarBlurStrength = config.dofFarBlurStrength;
            const originalAtmosphericFade = config.dofAtmosphericFade;
            
            // Calculate portal distance (only if portal is visible)
            if (portalWorldZ !== undefined) {
              const portalDistanceFromCamera = Math.abs(portalWorldZ);
              const focusProgress = scrollProgress;
              
              // Update config with portal growth DOF settings (same as heart particles)
              config.dofEnabled = true;
              config.dofFocalDistance = ((config.dofFocalDistance * maxSize * (1 - focusProgress) + portalDistanceFromCamera * focusProgress) / maxSize);
              config.dofFocalRange = ((config.dofFocalRange * maxSize * (1 - focusProgress) + (maxSize * 0.02) * focusProgress) / maxSize);
              config.dofAperture = config.dofAperture * (1 - focusProgress) + 3.0 * focusProgress;
              config.dofNearBlurStart = ((config.dofNearBlurStart * maxSize * (1 - focusProgress) + (maxSize * 0.01) * focusProgress) / maxSize);
              config.dofNearBlurStrength = config.dofNearBlurStrength * (1 - focusProgress) + 5.0 * focusProgress;
              config.dofFarBlurStart = ((config.dofFarBlurStart * maxSize * (1 - focusProgress) + (maxSize * 0.01) * focusProgress) / maxSize);
              config.dofFarBlurStrength = config.dofFarBlurStrength * (1 - focusProgress) + 5.0 * focusProgress;
              config.dofAtmosphericFade = config.dofAtmosphericFade * (1 - focusProgress) + 1.5 * focusProgress;
            }
            
            ambientRenderer.updateConfig(config);
            
            ambientRenderer.update(timeInSeconds);
            ambientRenderer.render(animatedModel, view, projection, 1.0, mouseWorldPos, ambientOpacity);
            
            // Restore original config values
            config.dofEnabled = originalDofEnabled;
            config.dofFocalDistance = originalFocalDistance;
            config.dofFocalRange = originalFocalRange;
            config.dofAperture = originalAperture;
            config.dofNearBlurStart = originalNearBlurStart;
            config.dofNearBlurStrength = originalNearBlurStrength;
            config.dofFarBlurStart = originalFarBlurStart;
            config.dofFarBlurStrength = originalFarBlurStrength;
            config.dofAtmosphericFade = originalAtmosphericFade;
          } else {
            ambientRenderer.update(timeInSeconds);
            ambientRenderer.render(animatedModel, view, projection, 1.0, mouseWorldPos, ambientOpacity);
          }
        }

        // Smoothly interpolate mouse position every frame (like reference: mouse.lerp(targetMouse, 0.045))
        // This ensures smooth interaction even when portal isn't visible, preventing jumps when it appears
        const portalLerpFactor = 0.045;
        portalMousePos[0] += (targetPortalMousePos[0] - portalMousePos[0]) * portalLerpFactor;
        portalMousePos[1] += (targetPortalMousePos[1] - portalMousePos[1]) * portalLerpFactor;

        // Portal Animation: Render portal (grows from 0 to 300px)
        // Only render if portal is visible (scrollProgress > 0.01)
        if (portalInitialized && portalProgram && portalVideoTexture && portalNoiseTexture && scrollProgress > 0.01) {
          // Update video texture ONLY when video frame actually changes (major performance optimization)
          if (portalVideo && portalVideo.readyState >= 2) {
            const currentVideoTime = portalVideo.currentTime;
            if (Math.abs(currentVideoTime - lastVideoTime) > 0.033) { // Only update if >33ms passed (30fps video)
              gl.bindTexture(gl.TEXTURE_2D, portalVideoTexture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, portalVideo);
              lastVideoTime = currentVideoTime;
            }
          }
          
          gl.useProgram(portalProgram);
          gl.bindVertexArray(portalVao);
          
          // Portal grows from 0 to target size independently (2D scale, not camera zoom)
          // Calculate scale needed to achieve target pixel size at portal's distance from camera
          const portalDistanceFromCamera = Math.abs(portalWorldZ);
          const worldSizeAtTarget = (PORTAL_TARGET_SIZE_PX * tanHalfFov * portalDistanceFromCamera) / canvas.clientHeight;
          
          // Portal starts at 0 size and grows to target size based on scroll progress
          const minPortalSize = 0;
          const maxPortalSize = worldSizeAtTarget;
          const currentWorldSize = minPortalSize + (maxPortalSize - minPortalSize) * scrollProgress;
          
          // Calculate scale factor relative to PORTAL_SIZE
          const currentScale = currentWorldSize / PORTAL_SIZE;
          
          // Portal positioned independently - no heart rotation applied
          const translateMatrix = mat.translate4(portalWorldX, portalWorldY, portalWorldZ);
          const scaleMatrix = new Float32Array([
              currentScale, 0, 0, 0,
              0, currentScale, 0, 0,
              0, 0, 1, 0,
              0, 0, 0, 1
          ]);
          
          const portalModel = mat.multiply4(translateMatrix, scaleMatrix);
          
          // Set uniforms - use separate portal view matrix (no heart rotation)
          gl.uniformMatrix4fv(portalUniforms.u_model, false, portalModel);
          gl.uniformMatrix4fv(portalUniforms.u_view, false, portalView);
          gl.uniformMatrix4fv(portalUniforms.u_projection, false, projection);
          gl.uniform1f(portalUniforms.u_time, portalAnimationTime);
          gl.uniform1f(portalUniforms.u_zoomProgress, scrollProgress);
          
          // Get particle color from config (use heart color or default)
          const particleColor = config.heartColor || [0.8, 0.2, 0.3]; // Default reddish color
          gl.uniform3fv(portalUniforms.u_particleColor, particleColor);
          
          // Portal effect uniforms - match reference portal.html CONFIG (cached for performance)
          const portalAberration = config.portalAberrationStrength ?? 0.005;
          const portalDistortion = config.portalDistortionStrength ?? 0.01;
          const portalDistortionScale = config.portalDistortionNoiseScale ?? 0.5;
          const portalRingRadius = config.portalRingRadius ?? 0.5;
          const portalRingThickness = config.portalRingThickness ?? 0.1;
          const portalSwirlSpeed = config.portalSwirlSpeed ?? 0.05;
          const portalSmokeDensity = config.portalSmokeDensity ?? 1.2;
          const portalSmokeColor = config.portalSmokeColor || [1.0, 1.0, 1.0];
          const portalFogStart = config.portalFogStart ?? 0.3;
          const portalFogEnd = config.portalFogEnd ?? 0.5;
          const portalFogColor = config.portalFogColor || [1.0, 1.0, 1.0];
          
          gl.uniform1f(portalUniforms.u_aberration, portalAberration);
          gl.uniform1f(portalUniforms.u_distortion, portalDistortion);
          gl.uniform1f(portalUniforms.u_distortionScale, portalDistortionScale);
          gl.uniform1f(portalUniforms.u_ringRadius, portalRingRadius);
          gl.uniform1f(portalUniforms.u_ringThickness, portalRingThickness);
          gl.uniform1f(portalUniforms.u_swirlSpeed, portalSwirlSpeed);
          gl.uniform1f(portalUniforms.u_smokeDensity, portalSmokeDensity);
          gl.uniform3fv(portalUniforms.u_smokeColor, portalSmokeColor);
          gl.uniform1f(portalUniforms.u_fogStart, portalFogStart);
          gl.uniform1f(portalUniforms.u_fogEnd, portalFogEnd);
          gl.uniform3fv(portalUniforms.u_fogColor, portalFogColor);
          
          // Mouse position - use window coordinates like reference (normalized to -1 to 1)
          // Note: portalMousePos is already interpolated above, outside this block
          gl.uniform2f(portalUniforms.u_mouse, portalMousePos[0], portalMousePos[1]);
          
          // Bind textures
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, portalVideoTexture);
          gl.uniform1i(portalUniforms.u_texture, 0);
          
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, portalNoiseTexture);
          gl.uniform1i(portalUniforms.u_noise, 1);
          
          // Enable blending for portal
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          
          // Draw portal (triangle strip for quad)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        // recursive RAF removed - controlled by React component
    }

    function updateConfig(newConfig) {
        // Update the internal config reference
        Object.assign(config, newConfig);
        
        // Update background color
        if (newConfig.backgroundColorRgb) {
            bgColor = newConfig.backgroundColorRgb;
        }
        
        // Update sub-renderers
        if (ambientRenderer) {
          ambientRenderer.updateConfig(config);
        }
        if (connectionRenderer) {
          connectionRenderer.updateConfig(config);
        }
        if (glowRenderer) {
          glowRenderer.updateConfig(config);
        }
    }

    function setCameraPreset(preset) {
        switch(preset) {
            case 'front':
              rotationX = 0;
              rotationY = 0;
              distance = maxSize * 2.5;
              break;
            case 'side':
              rotationX = 0;
              rotationY = Math.PI / 2;
              distance = maxSize * 2.5;
              break;
            case 'top':
              rotationX = -Math.PI / 2;
              rotationY = 0;
              distance = maxSize * 2.5;
              break;
            case 'angled':
              rotationX = -Math.PI / 6;
              rotationY = Math.PI / 4;
              distance = maxSize * 3;
              break;
          }
    }

    return {
        init,
        render,
        setCameraPreset,
        updateConfig,
    };
}
