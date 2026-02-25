#version 300 es
precision highp float;

layout (location = 0) in vec3 a_p1;
layout (location = 1) in vec3 a_p2;
layout (location = 2) in vec3 a_normal1;
layout (location = 3) in vec3 a_normal2;
layout (location = 4) in float a_phase1;
layout (location = 5) in float a_phase2;
layout (location = 6) in vec2 a_offset;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform float u_time;
uniform vec3 u_heartCenter;
uniform float u_lineWidth;
uniform vec2 u_resolution;

out float v_phase;
out float v_depth;

float smootherstep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float getHeartBeatPhase(float time) {
    // Compress cycle to 0.3 for faster, tighter beats (was 1.0)
    float t = mod(time, 0.3);
    float normalizedT = t / 0.3; // Normalize back to 0-1 range
    
    // Explosive Contraction (Systole)
    float attack = smoothstep(0.0, 0.05, normalizedT);
    
    // Fast relaxation - compressed for faster beats
    float release = 1.0 - smoothstep(0.05, 0.4, normalizedT);
    release = pow(release, 2.0); // consistent with particle shader
    
    return attack * release;
}

vec3 animate_vertex(vec3 pos, vec3 normal, float phase) {
    // Consistent random offset logic is hard without a_position index, 
    // but we use phase which correlates to position.
    float localTime = u_time + phase * 0.05;
    float beatPhase = getHeartBeatPhase(localTime);
    
    vec3 toVertex = pos - u_heartCenter;
    float yFromCenter = toVertex.y;
    float verticalGradient = smoothstep(-2.0, 2.0, yFromCenter);
    
    // Volume scaling (same as particles, reduced to 25% of original change)
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
    float rnd = fract(sin(dot(pos, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
    
    float scatterIntensity = beatPhase;
    float scatter = scatterIntensity * (0.1 + 0.4 * rnd);
    
    animatedPos += normal * scatter * 0.5 * 3.0;
    // Match particle radial scatter
    vec3 toVertexDir = normalize(pos - u_heartCenter);
    animatedPos += toVertexDir * scatterIntensity * 0.15 * rnd;
    
    return animatedPos;
}

void main() {
    vec3 animatedP1 = animate_vertex(a_p1, a_normal1, a_phase1);
    vec3 animatedP2 = animate_vertex(a_p2, a_normal2, a_phase2);

    mat4 modelView = u_view * u_model;
    vec4 p1_clip = u_projection * modelView * vec4(animatedP1, 1.0);
    vec4 p2_clip = u_projection * modelView * vec4(animatedP2, 1.0);
    
    vec2 p1_screen = p1_clip.xy / p1_clip.w;
    vec2 p2_screen = p2_clip.xy / p2_clip.w;
    
    vec2 dir = normalize(p2_screen - p1_screen);
    vec2 normal = vec2(-dir.y, dir.x);
    
    float aspect = u_resolution.x / u_resolution.y;
    normal.x /= aspect;
    
    float extrude = u_lineWidth * 0.5;
    
    vec4 base_clip = (a_offset.x < 0.0) ? p1_clip : p2_clip;
    base_clip.xy += normal * extrude * a_offset.y * base_clip.w / u_resolution.y * 2.0;
    
    gl_Position = base_clip;
    
    // Use the phase of the current vertex
    float current_phase = (a_offset.x < 0.0) ? a_phase1 : a_phase2;
    float localTime = u_time + current_phase * 0.05;
    v_phase = getHeartBeatPhase(localTime);

    v_depth = - (modelView * vec4((a_offset.x < 0.0) ? animatedP1 : animatedP2, 1.0)).z;
}

