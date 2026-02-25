import { createProgram } from './utils.js';
import * as mat from '../lib/gl-matrix-helpers.js';
import { createAmbientParticleRenderer } from '../ambient-particles/renderer.js';
import { createConnectionRenderer } from './connection-renderer.js';
import { createGlowRenderer } from './glow-renderer.js';

export function createRenderer(gl, canvas, config, particles, PARTICLE_COUNT, center, maxSize, heartBounds) {
    let program, uniforms, vao;
    let distance, rotationX, rotationY, isDragging, lastMouseX, lastMouseY;
    let mouseWorldPos, targetMousePos, isMouseActive;
    let tiltX = 0, tiltY = 0;
    let targetTiltX = 0, targetTiltY = 0;
    let frameCount = 0;
    let lastTime = 0;
    let ambientRenderer;
    let connectionRenderer;
    let glowRenderer;

    async function init() {
        const cacheBuster = `?v=${Date.now()}`;
        program = await createProgram(gl, `../shaders/heart-particle.vert${cacheBuster}`, `../shaders/heart-particle.frag${cacheBuster}`);
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

        uniforms = {
          uModel: gl.getUniformLocation(program, 'u_model'),
          uView: gl.getUniformLocation(program, 'u_view'),
          uProjection: gl.getUniformLocation(program, 'u_projection'),
          uTime: gl.getUniformLocation(program, 'u_time'),
          uHeartCenter: gl.getUniformLocation(program, 'u_heartCenter'),
          uPointSize: gl.getUniformLocation(program, 'u_pointSize'),
          uMousePos: gl.getUniformLocation(program, 'u_mousePos'),
          uMouseRadius: gl.getUniformLocation(program, 'u_mouseRadius'),
          uMouseGrowStrength: gl.getUniformLocation(program, 'u_mouseGrowStrength'),
          // DOF uniforms
          uDofEnabled: gl.getUniformLocation(program, 'u_dofEnabled'),
          uDofFocalDistance: gl.getUniformLocation(program, 'u_dofFocalDistance'),
          uDofFocalRange: gl.getUniformLocation(program, 'u_dofFocalRange'),
          uDofAperture: gl.getUniformLocation(program, 'u_dofAperture'),
          uDofFocalLength: gl.getUniformLocation(program, 'u_dofFocalLength'),
          uDofBokehScale: gl.getUniformLocation(program, 'u_dofBokehScale'),
          uDofNearBlurStart: gl.getUniformLocation(program, 'u_dofNearBlurStart'),
          uDofNearBlurStrength: gl.getUniformLocation(program, 'u_dofNearBlurStrength'),
          uDofFarBlurStart: gl.getUniformLocation(program, 'u_dofFarBlurStart'),
          uDofFarBlurStrength: gl.getUniformLocation(program, 'u_dofFarBlurStrength'),
          uDofDepthDarkening: gl.getUniformLocation(program, 'u_dofDepthDarkening'),
          uDofDepthDesaturation: gl.getUniformLocation(program, 'u_dofDepthDesaturation'),
          uDofAtmosphericFade: gl.getUniformLocation(program, 'u_dofAtmosphericFade'),
          uDofBokehIntensity: gl.getUniformLocation(program, 'u_dofBokehIntensity'),
          uDofBokehRotation: gl.getUniformLocation(program, 'u_dofBokehRotation'),
          uDofBokehRoundness: gl.getUniformLocation(program, 'u_dofBokehRoundness'),
          uDofEdgeBias: gl.getUniformLocation(program, 'u_dofEdgeBias'),
          uDofBokehShape: gl.getUniformLocation(program, 'u_dofBokehShape'),
          uDofChromaticAberration: gl.getUniformLocation(program, 'u_dofChromaticAberration'),
          uHeartColorEnabled: gl.getUniformLocation(program, 'u_heartColorEnabled'),
          uHeartColorTint: gl.getUniformLocation(program, 'u_heartColorTint')
        };

        gl.uniform3fv(uniforms.uHeartCenter, [0, 0, 0]);
        gl.uniform1f(uniforms.uPointSize, 5);

        mouseWorldPos = [0, 0, -100];
        targetMousePos = [0, 0, -100];
        isMouseActive = false;

        distance = maxSize * 2.5;
        rotationX = 0;
        rotationY = 0;
        isDragging = false;
        lastMouseX = 0;
        lastMouseY = 0;

        canvas.addEventListener('mousedown', (e) => {
          isDragging = true;
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          
          const deltaX = e.clientX - lastMouseX;
          const deltaY = e.clientY - lastMouseY;
          
          rotationY += deltaX * 0.005;
          rotationX += deltaY * 0.005;
          
          rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
          
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
        });

        canvas.addEventListener('mouseup', () => {
          isDragging = false;
          canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mouseleave', () => {
          isDragging = false;
          canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('wheel', (e) => {
          e.preventDefault();
          distance *= (1 + e.deltaY * 0.001);
          distance = Math.max(maxSize * 0.5, Math.min(maxSize * 10, distance));
        }, { passive: false });

        canvas.style.cursor = 'grab';

        canvas.addEventListener('mousemove', (e) => {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 2 - 1;
          const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
          
          // Set target for camera tilt
          if (config.cameraTiltEnabled) {
            targetTiltX = y * config.cameraTiltStrength;
            targetTiltY = -x * config.cameraTiltStrength;
          }
          
          const aspect = canvas.clientWidth / canvas.clientHeight;
          const fovRad = config.fov;
          const tanHalfFov = Math.tan(fovRad / 2);
          
          const worldX = x * distance * tanHalfFov * aspect;
          const worldY = y * distance * tanHalfFov;
          
          const cosY = Math.cos(-rotationY);
          const sinY = Math.sin(-rotationY);
          const cosX = Math.cos(-rotationX);
          const sinX = Math.sin(-rotationX);
          
          // Apply inverse camera rotation to the mouse position
          const finalX = worldX * cosY + worldY * sinX * sinY;
          const finalY = worldY * cosX;
          const finalZ = -worldX * sinY + worldY * sinX * cosY;

          targetMousePos = [finalX, finalY, finalZ];
          isMouseActive = true;
        });
        
        canvas.addEventListener('mouseleave', () => {
          targetMousePos = [0, 0, -100];
          isMouseActive = false;
          
          // Reset camera tilt
          if (config.cameraTiltEnabled) {
            targetTiltX = 0;
            targetTiltY = 0;
          }
        });

        // Initialize ambient particle renderer
        ambientRenderer = createAmbientParticleRenderer(gl, config, heartBounds, center);
        await ambientRenderer.init();
        
        // Initialize connection renderer
        connectionRenderer = createConnectionRenderer(gl, config, particles, PARTICLE_COUNT, center, maxSize);
        await connectionRenderer.init();
        
        // Initialize glow renderer
        glowRenderer = createGlowRenderer(gl, config);
        await glowRenderer.init();
    }
    
    function render(time) {
        const deltaTime = time - lastTime;
        lastTime = time;
        const timeInSeconds = time * 0.001;
        frameCount++;
        
        const aspect = canvas.clientWidth / canvas.clientHeight;
        if (aspect <= 0) return;
        
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
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        // Use standard blending for the heart. Ambient renderer will set its own state.
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.04, 0.04, 0.06, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const translateToOrigin = mat.translate4(-center[0], -center[1], -center[2]);
        const modelMatrix = translateToOrigin;
        const rotY = mat.rotateY4(rotationY);
        const rotX = mat.rotateX4(rotationX);
        const rotation = mat.multiply4(rotY, rotX);
        const animatedModel = mat.multiply4(modelMatrix, rotation);

        const eye = [0, 0, distance];
        const cameraCenter = [0, 0, 0];
        const up = [0, 1, 0];
        let view = mat.lookAt4(eye, cameraCenter, up);
        
        // Apply camera tilt
        if (config.cameraTiltEnabled) {
          const tiltMatrixY = mat.rotateY4(tiltY);
          const tiltMatrixX = mat.rotateX4(tiltX);
          const tiltMatrix = mat.multiply4(tiltMatrixY, tiltMatrixX);
          view = mat.multiply4(tiltMatrix, view);
        }
        
        const projection = mat.perspective4(config.fov, aspect, maxSize * 0.01, maxSize * 100);
        
        // Render glow effect first (fullscreen background)
        if (glowRenderer) {
          const heartCenter = [0, 0, 0];
          glowRenderer.render(animatedModel, view, projection, heartCenter, maxSize);
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

        // Render connections BEFORE particles for proper depth layering
        if (connectionRenderer) {
          connectionRenderer.render(animatedModel, view, projection, timeInSeconds);
        }
        
        // ** FIX: Re-bind particle program and VAO before drawing particles **
        // The connection renderer uses its own program, so we need to switch back
        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

        // Update and render ambient particles
        if (ambientRenderer) {
          ambientRenderer.update(timeInSeconds);
          ambientRenderer.render(animatedModel, view, projection, 1.0, mouseWorldPos);
        }

        requestAnimationFrame(render);
    }

    function updateAmbientConfig() {
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
        updateAmbientConfig,
    };
}
