#version 300 es
precision highp float;

in vec3 v_color;
in float v_intensity;
in float v_depth;
in float v_coc;
in float v_blurAmount;
in float v_depthFactor;
in float v_meshIndex;

// DOF uniforms for fragment shader
uniform bool u_dofEnabled;
uniform float u_dofBokehIntensity;
uniform float u_dofBokehRotation;
uniform float u_dofBokehRoundness;
uniform float u_dofEdgeBias;
uniform int u_dofBokehShape; // 0=circle, 1=hexagon, 2=octagon
uniform float u_dofChromaticAberration;
uniform float u_dofDepthDarkening;
uniform float u_dofDepthDesaturation;
uniform float u_dofAtmosphericFade;

// Heart color tint (null = use procedural colors, set = tint all particles)
uniform bool u_heartColorEnabled;
uniform vec3 u_heartColorTint;

out vec4 fragColor;

// Constants
const float PI = 3.14159265359;

// Rotate 2D coordinates
vec2 rotate2D(vec2 v, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

// Calculate distance to polygon edge (for bokeh shapes)
float polygonShape(vec2 coord, int sides, float rotation, float roundness) {
    vec2 rotated = rotate2D(coord, rotation);
    float angle = atan(rotated.y, rotated.x);
    float radius = length(rotated);
    
    // Polygon distance function
    float angleStep = 2.0 * PI / float(sides);
    float currentAngle = mod(angle, angleStep) - angleStep * 0.5;
    float polygonRadius = cos(angleStep * 0.5) / cos(currentAngle);
    
    // Mix between polygon and circle based on roundness
    float circleRadius = 1.0;
    float targetRadius = mix(polygonRadius, circleRadius, roundness);
    
    return radius / targetRadius;
}

// Calculate chromatic aberration offset
vec3 chromaticColor(vec2 coord, vec3 baseColor, float aberration) {
    if (aberration < 0.01) return baseColor;
    
    float dist = length(coord);
    vec2 direction = normalize(coord);
    
    // Separate color channels with radial offset
    float rOffset = aberration * 0.02;
    float bOffset = -aberration * 0.02;
    
    vec2 rCoord = coord - direction * rOffset;
    vec2 bCoord = coord + direction * bOffset;
    
    float rDist = length(rCoord);
    float bDist = length(bCoord);
    
    // Modulate color channels based on distance
    vec3 chromatic = baseColor;
    chromatic.r *= 1.0 - smoothstep(0.4, 0.5, rDist);
    chromatic.b *= 1.0 - smoothstep(0.4, 0.5, bDist);
    chromatic.g *= 1.0 - smoothstep(0.4, 0.5, dist);
    
    return chromatic;
}

void main() {
    // Center coordinate (-0.5 to 0.5)
    vec2 coord = gl_PointCoord - vec2(0.5);
    
    float shapeDist;
    
    // Heart particles stay SHARP - DOF disabled for heart
    if (false && u_dofEnabled && v_blurAmount > 0.1) {
        // This code is now disabled to keep the heart sharp
        if (u_dofBokehShape == 1) {
            // Hexagon
            shapeDist = polygonShape(coord, 6, u_dofBokehRotation, u_dofBokehRoundness);
        } else if (u_dofBokehShape == 2) {
            // Octagon
            shapeDist = polygonShape(coord, 8, u_dofBokehRotation, u_dofBokehRoundness);
        } else {
            // Circle (default)
            shapeDist = length(coord) * 2.0;
        }
        
        if (shapeDist > 1.0) {
            discard;
        }
        
        // ========================================
        // BOKEH EFFECTS
        // ========================================
        
        // Edge bias - brighter edges (cat's eye effect)
        float edgeEnhancement = pow(shapeDist, u_dofEdgeBias);
        float bokehMask = 1.0 - smoothstep(0.7, 1.0, shapeDist);
        
        // Bokeh intensity - out of focus particles are brighter
        float bokehBrightness = 1.0 + (v_blurAmount * u_dofBokehIntensity * edgeEnhancement);
        
        // Chromatic aberration for supernatural effect
        vec3 color;
        if (u_heartColorEnabled) {
            color = u_heartColorTint;
        } else {
            float mesh_variation = mod(v_meshIndex, 6.0) * 0.015;
            vec3 base_white = vec3(0.95 + mesh_variation);
            color = base_white;
            if (u_dofChromaticAberration > 0.01) {
                color = chromaticColor(coord * 2.0, base_white, u_dofChromaticAberration * v_blurAmount);
            }
        }
        
        // Apply atmospheric effects
        float depthDarken = 1.0 - (v_depthFactor * u_dofDepthDarkening);
        color *= depthDarken;
        
        // Desaturation with distance
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, vec3(luminance), v_depthFactor * u_dofDepthDesaturation);
        
        // Apply bokeh brightness
        vec3 finalColor = color * v_intensity * bokehBrightness;
        
        // Opacity reduction with distance and blur
        float alpha = clamp(v_intensity, 0.0, 1.0) * bokehMask;
        alpha *= 1.0 - (v_depthFactor * u_dofAtmosphericFade);
        alpha *= 0.7 + 0.3 * (1.0 - v_blurAmount); // Slightly more transparent when blurred
        
        fragColor = vec4(finalColor, alpha);
        
    } else {
        // In focus - sharp circular particle
        float dist = length(coord);
        
        if (dist > 0.5) {
            discard;
        }
        
        vec3 color;
        if (u_heartColorEnabled) {
            // Use configured color tint
            color = u_heartColorTint;
            float variation = (fract(dot(gl_PointCoord, vec2(12.9898, 78.233))) * 2.0 - 1.0) * 0.02;
            color += vec3(variation);
        } else {
            // Use procedural colors from vertex shader
            float mesh_variation_focus = mod(v_meshIndex, 6.0) * 0.015;
            vec3 base_white_focus = vec3(0.95 + mesh_variation_focus);
            float variation = (fract(dot(gl_PointCoord, vec2(12.9898, 78.233))) * 2.0 - 1.0) * 0.02;
            color = base_white_focus + vec3(variation);
        }
        
        // Minimal atmospheric effects even when in focus
        if (u_dofEnabled) {
            float depthDarken = 1.0 - (v_depthFactor * u_dofDepthDarkening * 0.3);
            color *= depthDarken;
        }
        
        vec3 finalColor = color * v_intensity;
        float alpha = clamp(v_intensity, 0.0, 1.0);
        
        if (u_dofEnabled) {
            alpha *= 1.0 - (v_depthFactor * u_dofAtmosphericFade * 0.5);
        }
        
        fragColor = vec4(finalColor, alpha);
    }
}
