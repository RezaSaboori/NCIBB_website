#version 300 es
precision highp float;

// Fullscreen quad vertex shader
// Generates a fullscreen triangle/quad without vertex buffer
layout (location = 0) in vec2 a_position;

out vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}

