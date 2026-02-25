#version 300 es
precision highp float;

in vec2 v_uv;

uniform vec2 u_heartScreenPos;  // Heart center in screen space (0-1)
uniform float u_intensity;      // Glow intensity (0-1)
uniform float u_radius;         // Glow radius in screen space
uniform float u_falloff;        // Falloff power (higher = sharper falloff)
uniform vec3 u_color;           // Glow color (RGB)
uniform vec2 u_resolution;      // Screen resolution for aspect correction

out vec4 fragColor;

void main() {
    // Correct for aspect ratio
    vec2 aspectRatio = vec2(u_resolution.x / u_resolution.y, 1.0);
    
    // Calculate distance from heart center
    vec2 centeredUV = (v_uv - u_heartScreenPos) * aspectRatio;
    
    // Make glow slightly heart-shaped (elongated vertically)
    // Scale Y-axis to create an elliptical shape that better matches heart proportions
    vec2 heartShape = centeredUV;
    heartShape.y *= 0.85; // Slightly compress vertically for heart-like shape
    
    float dist = length(heartShape);
    
    // Smooth radial falloff
    float glow = 1.0 - smoothstep(0.0, u_radius, dist);
    glow = pow(glow, u_falloff);
    
    // Apply intensity
    glow *= u_intensity;
    
    // Output glow color with calculated intensity
    vec3 glowColor = u_color * glow;
    
    // Use additive blending, so alpha represents contribution
    fragColor = vec4(glowColor, glow);
}

