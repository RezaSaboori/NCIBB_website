#version 300 es
precision highp float;

in float v_phase;
in float v_depth;

uniform vec3 u_connectionColor;
uniform float u_connectionOpacity;
uniform bool u_connectionPulse;

out vec4 fragColor;

void main() {
    vec3 baseColor = u_connectionColor;
    float variation = (v_phase - 0.5) * 0.05;
    vec3 color = baseColor + vec3(variation);
    float alpha = u_connectionOpacity;
    
    // Pulse with heartbeat if enabled
    if (u_connectionPulse) {
        alpha *= 0.7 + 0.3 * v_phase;
    }
    
    // Depth-based fading (slight)
    float depthFade = 1.0 - smoothstep(1.0, 5.0, v_depth) * 0.3;
    alpha *= depthFade;
    
    fragColor = vec4(color, alpha);
}

