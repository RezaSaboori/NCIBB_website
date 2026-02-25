#version 300 es
precision highp float;

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec3 a_normal;
layout (location = 2) in vec3 a_color;
layout (location = 3) in float a_size;
layout (location = 4) in float a_phase;
layout (location = 5) in float a_ao;
layout (location = 6) in float a_meshIndex;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform float u_time;
uniform vec3 u_heartCenter;
uniform float u_pointSize;
uniform vec3 u_mousePos;
uniform float u_mouseRadius;
uniform float u_mouseGrowStrength;

// Depth of Field uniforms
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
uniform float u_dofDepthDarkening;
uniform float u_dofDepthDesaturation;
uniform float u_dofAtmosphericFade;

out vec3 v_color;
out float v_intensity;
out float v_depth;
out float v_coc;
out float v_blurAmount;
out float v_depthFactor;
out float v_meshIndex;

float smootherstep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float getHeartBeatPhase(float time) {
    // Compress cycle to 0.3 for faster, tighter beats (was 1.0)
    float t = mod(time, 0.3);
    float normalizedT = t / 0.3; // Normalize back to 0-1 range
    
    // Explosive Contraction (Systole)
    // Extremely fast attack (0.0 to 0.05) for the explosive "pop"
    float attack = smoothstep(0.0, 0.05, normalizedT);
    
    // Fast relaxation (0.05 to 0.4) - compressed for faster beats
    // Using pow to shape the return curve - maintaining energy briefly before settling
    float release = 1.0 - smoothstep(0.05, 0.4, normalizedT);
    release = pow(release, 2.0); // fast drop-off (squared release)
    
    return attack * release;
}

void main() {
    // Heartbeat animation (heartRate controlled by uniform via u_time scaling)
    // We add a small random offset to phase per particle for "organic" delay, but keep it tight
    float rndOffset = fract(sin(dot(a_position, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
    float localTime = u_time + a_phase * 0.05 - rndOffset * 0.02; 
    
    float beatPhase = getHeartBeatPhase(localTime);
    
    vec3 toVertex = a_position - u_heartCenter;
    float yFromCenter = toVertex.y;
    float verticalGradient = smoothstep(-2.0, 2.0, yFromCenter);
    
    // Volume scaling (reduced to 25% of original change)
    float volumeScale = mix(1.0, 0.97, beatPhase);
    vec3 animatedPos = u_heartCenter + toVertex * volumeScale;
    
    // Vertical compression (reduced to 25% of original change)
    float compressionFactor = (1.0 - verticalGradient) * beatPhase * 0.0375;
    animatedPos.y += compressionFactor * abs(toVertex.y);
    
    // Radial squeeze (reduced to 25% of original change)
    float radialScale = mix(1.0, 0.98, beatPhase * (1.0 - verticalGradient * 0.5));
    vec2 xzOffset = vec2(toVertex.x, toVertex.z);
    animatedPos.x = u_heartCenter.x + xzOffset.x * radialScale;
    animatedPos.z = u_heartCenter.z + xzOffset.y * radialScale;
    
    // Particle expansion along normal
    float rnd = fract(sin(dot(a_position, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
    
    // Scatter Logic:
    // During contraction (beatPhase near 1.0), particles scatter outward.
    // The release is squared in getHeartBeatPhase, so we use linear here to maintain that snap.
    float scatterIntensity = beatPhase; 
    // Increased scatter distance for "explosive" feel
    float scatter = scatterIntensity * (0.1 + 0.4 * rnd); 
    
    animatedPos += a_normal * scatter * a_size * 3.0;
    
    // Stronger radial burst for internal particles
    animatedPos += normalize(toVertex) * scatterIntensity * 0.15 * rnd;
    
    vec4 worldPos = u_model * vec4(animatedPos, 1.0);
    vec4 viewPos = u_view * worldPos;
    gl_Position = u_projection * viewPos;
    
    // Mouse grow effect - enlarge particles near cursor
    float particleScale = 1.0;
    vec3 toMouse = animatedPos - u_mousePos;
    float distToMouse = length(toMouse);
    
    if (distToMouse < u_mouseRadius) {
        // Smooth falloff from center to edge
        float mouseInfluence = 1.0 - smoothstep(0.0, u_mouseRadius, distToMouse);
        // Smooth easing for organic growth
        mouseInfluence = smoothstep(0.0, 1.0, mouseInfluence);
        // Scale particles up to growStrength multiplier
        particleScale = 1.0 + (u_mouseGrowStrength - 1.0) * mouseInfluence;
    }
    
    // Calculate depth from camera (positive value)
    float depth = -viewPos.z;
    v_depth = depth;
    
    // ========================================
    // DEPTH OF FIELD CALCULATION - DISABLED FOR HEART PARTICLES
    // Heart particles stay sharp, only ambient particles blur
    // ========================================
    // DOF calculation disabled - heart particles remain sharp
    v_coc = 0.0;
    v_blurAmount = 0.0;
    v_depthFactor = 0.0;
    
    // Point size based on depth, particle size, mouse interaction
    gl_PointSize = (u_pointSize * a_size * particleScale) / depth * 50.0;
    
    // Base color and intensity
    v_color = a_color;
    v_intensity = mix(0.8, 1.2, beatPhase * 0.5 + 0.5);
    v_meshIndex = a_meshIndex;
}
