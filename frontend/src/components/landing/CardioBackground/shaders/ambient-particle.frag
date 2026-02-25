#version 300 es
precision highp float;

in vec3 v_color;
in float v_depth;
in float v_blurAmount;
in float v_depthFactor;

// DOF uniforms
uniform bool u_dofEnabled;
uniform float u_dofBokehIntensity;
uniform float u_dofBokehRotation;
uniform float u_dofBokehRoundness;
uniform float u_dofBokehFalloff;
uniform int u_dofBokehShape;
uniform float u_dofChromaticAberration;
uniform float u_dofDepthDarkening;
uniform float u_dofDepthDesaturation;
uniform float u_dofAtmosphericFade;
uniform float u_dofBlurFadeStrength;
uniform float u_ambientOpacity;

out vec4 fragColor;

const float PI = 3.14159265359;

vec2 rotate2D(vec2 v, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

float polygonShape(vec2 coord, int sides, float rotation, float roundness) {
    vec2 rotated = rotate2D(coord, rotation);
    float angle = atan(rotated.y, rotated.x);
    float radius = length(rotated);
    
    // --- BUG FIX ---
    // The polygon math must be scaled to the coordinate system of gl_PointCoord,
    // which has a radius of 0.5, not 1.0. This was the cause of the squares.
    const float SHAPE_RADIUS = 0.5;

    float angleStep = 2.0 * PI / float(sides);
    float currentAngle = mod(angle, angleStep) - angleStep * 0.5;
    float polygonRadius = (cos(angleStep * 0.5) * SHAPE_RADIUS) / cos(currentAngle);
    
    float circleRadius = SHAPE_RADIUS;
    float targetRadius = mix(polygonRadius, circleRadius, roundness);
    
    // This returns a value from 0.0 at the center to 1.0 at the shape's edge.
    return radius / targetRadius;
}

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    fragColor = vec4(0.0);

    // Render bokeh for out-of-focus particles
    if (u_dofEnabled && v_blurAmount > 0.01) {
        float shapeDist;
        if (u_dofBokehShape == 1) { // Hexagon
            shapeDist = polygonShape(coord, 6, u_dofBokehRotation, u_dofBokehRoundness);
        } else if (u_dofBokehShape == 2) { // Octagon
            shapeDist = polygonShape(coord, 8, u_dofBokehRotation, u_dofBokehRoundness);
        } else { // Circle
            shapeDist = length(coord) * 2.0; // length(coord) is 0.5 max, so this normalizes to 1.0
        }

        if (shapeDist > 1.0) {
            discard;
        }
        
        // Create a soft mask based on the shape distance.
        float bokehMask = 1.0 - smoothstep(0.8, 1.0, shapeDist);
        
        // Calculate brightness with a soft falloff from the center.
        float centerBias = 1.0 - pow(shapeDist, u_dofBokehFalloff);
        float bokehBrightness = 1.0 + (v_blurAmount * u_dofBokehIntensity * centerBias);
        bokehBrightness = min(bokehBrightness, 3.0); // Prevent overexposure
        
        vec3 baseColor = v_color; // Use vertex color from config
        float variation = (fract(v_depth * 100.0) - 0.5) * 0.05;
        vec3 color = baseColor + vec3(variation);
        
        // Atmospheric effects
        float depthDarken = 1.0 - (v_depthFactor * u_dofDepthDarkening);
        color *= depthDarken;
        
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, vec3(luminance), v_depthFactor * u_dofDepthDesaturation);
        
        vec3 finalColor = color * bokehBrightness;
        
        float alpha = bokehMask;
        
        // Exponentially reduce opacity based on blur amount
        if (u_dofBlurFadeStrength > 0.0) {
            float blurFade = exp(-v_blurAmount * u_dofBlurFadeStrength);
            alpha *= blurFade;
        }

        alpha *= 1.0 - (v_depthFactor * u_dofAtmosphericFade);
        
        // Apply global fade
        alpha *= u_ambientOpacity;

        fragColor = vec4(finalColor, alpha);

    } else {
        // In focus - circular with a standard soft edge
        float dist = length(coord);
        if (dist > 0.5) {
            discard;
        }
        
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        vec3 baseColor = v_color; // Use vertex color from config
        float variation = (fract(v_depth * 100.0) - 0.5) * 0.05;
        vec3 finalColor = baseColor + vec3(variation);
        
        if (u_dofEnabled) {
             float depthDarken = 1.0 - (v_depthFactor * u_dofDepthDarkening * 0.3);
             finalColor *= depthDarken;
             alpha *= 1.0 - (v_depthFactor * u_dofAtmosphericFade * 0.5);
        }
        
        // Apply global fade
        alpha *= u_ambientOpacity;
        
        fragColor = vec4(finalColor, alpha);
    }

    // Pre-multiply alpha for correct blending
    fragColor.rgb *= fragColor.a;
}
