uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uNoise;
uniform vec2 uMouse;
uniform float uAberration;
uniform float uDistortion;
uniform float uDistortionScale;
uniform float uRingRadius;
uniform float uRingThickness;
uniform float uSwirlSpeed;
uniform float uSmokeDensity;
uniform vec3 uSmokeColor;
uniform float uFogStart, uFogEnd;
uniform vec3 uFogColor;

varying vec2 vUv;

float getLuminance(vec3 c) { return dot(c, vec3(0.299,0.587,0.114)); }

void main() {
    vec2 centeredUV = vUv - 0.5;
    float dist = length(centeredUV);
    float angle = atan(centeredUV.y, centeredUV.x);
    float radius = dist;

    // IMAGE PROCESSING LAYER: distortion, abberation, B&W
    vec2 noiseUV = centeredUV * uDistortionScale + uTime*0.02;
    vec2 mouseOffset = uMouse * 0.03;
    float n = texture2D(uNoise, noiseUV + mouseOffset).r;
    vec2 displacedUV = vUv + (n-0.5) * uDistortion + mouseOffset;

    // Chromatic aberration, shifts channels with radius
    float aber = uAberration * (1.0 + pow(dist/uRingRadius,1.45));
    vec2 aberVec = vec2(aber,0.0);

    vec3 texR = texture2D(uTexture, clamp(displacedUV + aberVec,0.0,1.0)).rgb;
    vec3 texG = texture2D(uTexture, clamp(displacedUV,0.0,1.0)).rgb;
    vec3 texB = texture2D(uTexture, clamp(displacedUV - aberVec,0.0,1.0)).rgb;

    vec3 imageRGB = vec3(texR.r, texG.g, texB.b);

    // FOG MIX: White at the outer edge, image at center
    // Handle both normal and inverted fog ranges
    float fogMin = min(uFogStart, uFogEnd);
    float fogMax = max(uFogStart, uFogEnd);
    float fogIntensity = smoothstep(fogMin, fogMax, dist);
    // If fogEnd < fogStart, invert the result
    if (uFogEnd < uFogStart) {
        fogIntensity = 1.0 - fogIntensity;
    }
    // Make fog more visible - reduce the power curve
    fogIntensity = pow(fogIntensity, 0.8); // Changed from 1.4 to 0.8 for more visible fog
    // Ensure minimum fog visibility at edges
    fogIntensity = max(fogIntensity, dist * 0.3); // Add base fog based on distance
    
    // Ensure fog is visible - mix image with fog color
    // TEMPORARY TEST: Replace output with fog color to verify uniform works
    // Uncomment the next line to test if fog color uniform is working:
    // vec3 imgFog = uFogColor; // FORCE FOG COLOR FOR TESTING
    vec3 imgFog = mix(imageRGB, uFogColor, fogIntensity);

    // FRACTAL SMOKE RING LAYER (only on ring)
    float ringCenter = uRingRadius;
    float thickness = uRingThickness;
    float polarU = (angle / 3.14159265359 + 1.0) * 0.5;
    float polarV = radius;

    vec2 uv1 = vec2(mod(polarU + uTime * uSwirlSpeed, 1.), mod(polarV + uTime * 0.02, 1.));
    vec2 uv2 = vec2(mod(polarU * 2.063 + uTime * uSwirlSpeed * 0.7, 1.), mod(polarV * 1.34 + uTime * 0.015, 1.));
    vec2 uv3 = vec2(mod(polarU * 4.26 + uTime * uSwirlSpeed * 1.4, 1.), mod(polarV * 2.13 + uTime * 0.08, 1.));

    float turbR = texture2D(uNoise, uv1).r;
    float turbG = texture2D(uNoise, uv2).g;
    float turbB = texture2D(uNoise, uv3).b;
    float smokeTurbulence = 0.5*turbR + 0.3*turbG + 0.2*turbB;

    float smokyThickness = thickness * (1. + 0.5 * smokeTurbulence);
    float ringMask = 1.0 - smoothstep(0.0, smokyThickness, abs(dist - ringCenter));
    ringMask *= 0.85 + 0.15 * smokeTurbulence;

    float smokeIntensity = clamp(ringMask * uSmokeDensity, 0.0, 1.0);

    // Compose: image+fog base mixed with smoke only on ring
    vec3 smokeColor = uSmokeColor;
    float smokeMix = smokeIntensity;
    vec3 colorFinal = mix(imgFog, smokeColor, smokeMix);

    // Clean circle alpha mask with NO shadows
    // Use the maximum of fogStart and fogEnd for the outer edge
    float outerEdge = max(uFogStart, uFogEnd);
    float outerAlpha = 1.0 - smoothstep(outerEdge - 0.018, outerEdge, dist);
    if(outerAlpha < 0.01) discard;

    gl_FragColor = vec4(colorFinal, outerAlpha);
}

