#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_uv;

uniform vec3 u_lightDirection;
uniform vec3 u_baseColor;
uniform sampler2D u_baseColorTexture;
uniform bool u_useBaseColorTexture;

out vec4 o_color;

void main() {
    vec3 n = normalize(v_normal);
    float light = max(dot(n, normalize(u_lightDirection)), 0.0);

    vec3 color = u_baseColor;
    if (u_useBaseColorTexture) {
        color *= texture(u_baseColorTexture, v_uv).rgb;
    }

    vec3 ambient = 0.1 * color;
    vec3 diffuse = light * color;
    o_color = vec4(ambient + diffuse, 1.0);
}
