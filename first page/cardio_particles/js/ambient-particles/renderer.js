import { createProgram } from '../webgl/utils.js';
import { YellowCircleParticles } from './type1-yellow-circles.js';
import { CurlFlowParticles } from './type2-curl-flow.js';

export function createAmbientParticleRenderer(gl, config, headerSize, headerCenter) {
  let program, uniforms, vao;
  let type1Particles;
  let type2Particles;
  const configRef = config;
  const headerSizeRef = headerSize;
  const headerCenterRef = headerCenter;

  async function init() {
    // Create shader program with cache-busting query string
    const cacheBuster = `?v=${Date.now()}`;
    program = await createProgram(gl, `../shaders/ambient-particle.vert${cacheBuster}`, `../shaders/ambient-particle.frag${cacheBuster}`);
    gl.useProgram(program);

    // Create VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Get uniform locations
    uniforms = {
      uModel: gl.getUniformLocation(program, 'u_model'),
      uView: gl.getUniformLocation(program, 'u_view'),
      uProjection: gl.getUniformLocation(program, 'u_projection'),
      uPointSize: gl.getUniformLocation(program, 'u_pointSize'),
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
      uDofBokehFalloff: gl.getUniformLocation(program, 'u_dofBokehFalloff'),
      uDofBokehShape: gl.getUniformLocation(program, 'u_dofBokehShape'),
      uDofChromaticAberration: gl.getUniformLocation(program, 'u_dofChromaticAberration'),
      uDofBlurFadeStrength: gl.getUniformLocation(program, 'u_dofBlurFadeStrength'),
      
      // Mouse repel uniforms
      uMousePos: gl.getUniformLocation(program, 'u_mousePos'),
      uMouseRepelStrength: gl.getUniformLocation(program, 'u_mouseRepelStrength'),
      uMouseRepelRadius: gl.getUniformLocation(program, 'u_mouseRepelRadius')
    };

    // Initialize type 1 particles (yellow circles) only if enabled
    if (configRef.ambientType1Enabled) {
      type1Particles = new YellowCircleParticles(gl, configRef, headerSizeRef, headerCenterRef);
    }
    
    // Initialize type 2 particles (curl flow) only if enabled
    if (configRef.ambientType2Enabled) {
      type2Particles = new CurlFlowParticles(gl, configRef, headerSizeRef, headerCenterRef);
    }
  }

  function update(time) {
    if (type1Particles && configRef.ambientType1Enabled) {
      type1Particles.update(time);
    }
    if (type2Particles && configRef.ambientType2Enabled) {
      type2Particles.update(time);
    }
  }

  function render(modelMatrix, viewMatrix, projectionMatrix, pointSize, mousePos) {
    if (!program) return;
    
    // Set the correct GL state for glowing, transparent particles using Pre-multiplied Alpha
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Use Pre-multiplied Alpha blending
    gl.depthMask(false);                         // Don't write to depth buffer

    // Calculate max size for DOF scaling (approximate from header size)
    const maxSize = Math.max(...headerSizeRef);
    
    // Helper function to set DOF uniforms
    function setDofUniforms() {
      gl.uniform1i(uniforms.uDofEnabled, configRef.dofEnabled ? 1 : 0);
      gl.uniform1f(uniforms.uDofFocalDistance, configRef.dofFocalDistance * maxSize);
      gl.uniform1f(uniforms.uDofFocalRange, configRef.dofFocalRange * maxSize);
      gl.uniform1f(uniforms.uDofAperture, configRef.dofAperture);
      gl.uniform1f(uniforms.uDofFocalLength, configRef.dofFocalLength);
      gl.uniform1f(uniforms.uDofBokehScale, configRef.dofBokehScale);
      gl.uniform1f(uniforms.uDofNearBlurStart, configRef.dofNearBlurStart * maxSize);
      gl.uniform1f(uniforms.uDofNearBlurStrength, configRef.dofNearBlurStrength);
      gl.uniform1f(uniforms.uDofFarBlurStart, configRef.dofFarBlurStart * maxSize);
      gl.uniform1f(uniforms.uDofFarBlurStrength, configRef.dofFarBlurStrength);
      gl.uniform1f(uniforms.uDofDepthDarkening, configRef.dofDepthDarkening);
      gl.uniform1f(uniforms.uDofDepthDesaturation, configRef.dofDepthDesaturation);
      gl.uniform1f(uniforms.uDofAtmosphericFade, configRef.dofAtmosphericFade);
      gl.uniform1f(uniforms.uDofBokehIntensity, configRef.dofBokehIntensity);
      gl.uniform1f(uniforms.uDofBokehRotation, configRef.dofBokehRotation);
      gl.uniform1f(uniforms.uDofBokehRoundness, configRef.dofBokehRoundness);
      gl.uniform1f(uniforms.uDofBokehFalloff, configRef.dofBokehFalloff);
      
      let bokehShapeInt = 0;
      if (configRef.dofBokehShape === 'hexagon') bokehShapeInt = 1;
      else if (configRef.dofBokehShape === 'octagon') bokehShapeInt = 2;
      gl.uniform1i(uniforms.uDofBokehShape, bokehShapeInt);
      
      gl.uniform1f(uniforms.uDofChromaticAberration, configRef.dofChromaticAberration);
      gl.uniform1f(uniforms.uDofBlurFadeStrength, configRef.dofBlurFadeStrength);
    }
    
    // Render type 1 particles
    if (type1Particles && configRef.ambientType1Enabled) {

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      // Set uniforms
      gl.uniformMatrix4fv(uniforms.uModel, false, modelMatrix);
      gl.uniformMatrix4fv(uniforms.uView, false, viewMatrix);
      gl.uniformMatrix4fv(uniforms.uProjection, false, projectionMatrix);
      gl.uniform1f(uniforms.uPointSize, configRef.ambientType1Size || 2.0);
      
      // Set mouse repel uniforms if enabled for this particle type
      if (configRef.ambientType1MouseRepelEnabled) {
        gl.uniform3fv(uniforms.uMousePos, mousePos);
        gl.uniform1f(uniforms.uMouseRepelStrength, configRef.ambientType1MouseRepelStrength);
        gl.uniform1f(uniforms.uMouseRepelRadius, configRef.ambientType1MouseRepelRadius * Math.max(...headerSizeRef));
      } else {
        gl.uniform1f(uniforms.uMouseRepelStrength, 0.0); // Disable effect if not enabled
      }
      
      // Set DOF uniforms
      setDofUniforms();

      // Bind and draw type 1 particles
      type1Particles.bindBuffers(vao);
      type1Particles.draw();
    }
    
    // Render type 2 particles
    if (type2Particles && configRef.ambientType2Enabled) {
      gl.useProgram(program);
      gl.bindVertexArray(vao);

      // Set uniforms
      gl.uniformMatrix4fv(uniforms.uModel, false, modelMatrix);
      gl.uniformMatrix4fv(uniforms.uView, false, viewMatrix);
      gl.uniformMatrix4fv(uniforms.uProjection, false, projectionMatrix);
      gl.uniform1f(uniforms.uPointSize, configRef.ambientType2Size || 1.5);
      
      // Set mouse repel uniforms if enabled for this particle type
      if (configRef.ambientType2MouseRepelEnabled) {
        gl.uniform3fv(uniforms.uMousePos, mousePos);
        gl.uniform1f(uniforms.uMouseRepelStrength, configRef.ambientType2MouseRepelStrength);
        gl.uniform1f(uniforms.uMouseRepelRadius, configRef.ambientType2MouseRepelRadius * Math.max(...headerSizeRef));
      } else {
        gl.uniform1f(uniforms.uMouseRepelStrength, 0.0); // Disable effect if not enabled
      }
      
      // Set DOF uniforms
      setDofUniforms();

      // Bind and draw type 2 particles
      type2Particles.bindBuffers(vao);
      type2Particles.draw();
    }
    
    // Restore GL state for opaque objects (like the heart)
    gl.depthMask(true);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  function updateConfig(newConfig) {
    // Update config reference
    Object.assign(configRef, newConfig);
    
    // Reinitialize type 1 particles if they were disabled but are now enabled
    if (!type1Particles && configRef.ambientType1Enabled) {
      type1Particles = new YellowCircleParticles(gl, configRef, headerSizeRef, headerCenterRef);
    }
    
    if (type1Particles) {
      type1Particles.updateConfig(configRef);
    }
    
    // Reinitialize type 2 particles if they were disabled but are now enabled
    if (!type2Particles && configRef.ambientType2Enabled) {
      type2Particles = new CurlFlowParticles(gl, configRef, headerSizeRef, headerCenterRef);
    }
    
    if (type2Particles) {
      type2Particles.updateConfig(configRef);
    }
  }

  return {
    init,
    update,
    render,
    updateConfig
  };
}

