#version 300 es
precision highp float;

// Ambient particle vertex shader with DOF support

// INPUTS
layout (location = 0) in vec3 a_position;
layout (location = 2) in vec3 a_color;
layout (location = 3) in float a_size;

// UNIFORMS (from JavaScript)
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform float u_pointSize;

// DOF UNIFORMS
uniform bool u_dofEnabled;
uniform float u_dofFocalDistance;
uniform float u_dofFocalRange;
uniform float u_dofAperture;
uniform float u_dofFocalLength;
uniform float u_dofBokehScale;
uniform float u_dofNearBlurStart;
uniform float u_dofNearBlurStrength;
uniform float u_dofFarBlurStart;
uniform float u_dofFarBlurStrength;

// Mouse repel uniforms
uniform vec3 u_mousePos;
uniform float u_mouseRepelStrength;
uniform float u_mouseRepelRadius;

// OUTPUTS to Fragment Shader
out vec3 v_color;
out float v_depth;
out float v_blurAmount; // THIS IS THE CRITICAL LINE
out float v_depthFactor;

void main() {
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    
    // Mouse Repel Logic
    if (u_mouseRepelStrength > 0.0) {
        vec3 fromMouse = worldPos.xyz - u_mousePos;
        float dist = length(fromMouse);
        
        if (dist < u_mouseRepelRadius) {
            float force = smoothstep(u_mouseRepelRadius, 0.0, dist);
            vec3 direction = normalize(fromMouse);
            worldPos.xyz += direction * force * u_mouseRepelStrength * 0.1;
        }
    }
    
    vec4 viewPos = u_view * worldPos;
    gl_Position = u_projection * viewPos;
    
    // Pass color to fragment shader
    v_color = a_color;
    
    // Calculate depth from camera (positive value)
    float depth = -viewPos.z;
    v_depth = depth;
    
    float sizeMultiplier = 1.0;
    
    // === DOF CALCULATIONS ===
    if (u_dofEnabled) {
        // Calculate blur amount based on distance from focal plane
        float nearBlur = 0.0;
        float farBlur = 0.0;
        
        // NEAR FIELD (closer than focal plane)
        if (depth < u_dofFocalDistance - u_dofFocalRange) {
            float nearDist = (u_dofFocalDistance - u_dofFocalRange) - depth;
            nearBlur = smoothstep(0.0, u_dofNearBlurStart, nearDist) * u_dofNearBlurStrength;
        } 
        // FAR FIELD (further than focal plane)
        else if (depth > u_dofFocalDistance + u_dofFocalRange) {
            float farDist = depth - (u_dofFocalDistance + u_dofFocalRange);
            farBlur = smoothstep(0.0, u_dofFarBlurStart, farDist) * u_dofFarBlurStrength;
        }
        
        // Pass blur amount and depth factor to fragment shader
        v_blurAmount = max(nearBlur, farBlur);
        v_depthFactor = clamp((depth - u_dofFocalDistance) / 15.0, 0.0, 1.0);
        
        // Increase particle size for out-of-focus particles (bokeh effect)
        sizeMultiplier = 1.0 + v_blurAmount * 1.5 * u_dofBokehScale;
    } else {
        // If DOF is disabled, pass zero values
        v_blurAmount = 0.0;
        v_depthFactor = 0.0;
    }
    
    // Final point size includes base size, depth scaling, and bokeh scaling
    gl_PointSize = (u_pointSize * a_size * sizeMultiplier) / depth * 50.0;
}
