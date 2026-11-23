const vertexSource = `
  attribute vec2 aPosition;
  varying vec2 vPoint;

  void main() {
    vPoint = aPosition;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const fragmentSource = `
  precision mediump float;
  varying vec2 vPoint;
  uniform vec2 uDrift;

  float cloud(vec2 point, vec2 center, vec2 scale) {
    vec2 distance = (point - center) * scale;
    return exp(-dot(distance, distance));
  }

  void main() {
    float surface = 1.0 - dot(vPoint, vPoint);
    // Paint past the circle so CSS can clip it smoothly at display resolution.
    if (surface < -0.10) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float depth = sqrt(max(0.0, surface));
    vec2 interior = vPoint * (0.81 + 0.31 * depth);
    vec2 crossDrift = vec2(-uDrift.y, uDrift.x);

    vec2 violetCenter = vec2(-0.27, 0.28) - vec2(0.54, 0.35) * uDrift;
    vec2 cyanCenter = vec2(0.22, 0.20) + vec2(0.52, 0.40) * crossDrift;
    float violet = cloud(interior, violetCenter, vec2(1.58, 1.42));
    float cyan = cloud(interior, cyanCenter, vec2(1.43, 1.34));
    vec3 tint = vec3(0.63, 0.69, 0.97)
      + violet * vec3(0.08, -0.31, -0.014)
      + cyan * vec3(-0.21, 0.24, 0.029);

    // The upper-left light stays fixed, including its glow through the far side.
    float glow = cloud(vPoint, vec2(0.44, -0.61), vec2(1.92, 2.35));
    float arcDepth = depth - 0.44;
    float reflection = exp(-94.0 * arcDepth * arcDepth)
      * smoothstep(0.40, 0.85, dot(vPoint, vec2(-0.74, 0.67)));
    tint = mix(tint, vec3(1.0, 0.96, 0.99), glow);
    tint = mix(tint, vec3(1.0), 0.96 * reflection);

    float opacity = min(0.95,
      0.27 + 0.10 * depth + 0.36 * max(violet, cyan)
      + 0.50 * glow + 0.40 * reflection);
    gl_FragColor = vec4(tint * opacity, opacity);
  }
`

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)

  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader

  gl.deleteShader(shader)

  return null
}

export function createGlassAvatarRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  })

  if (!gl) return null

  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()

  if (program && vertex && fragment) {
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
  }
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!program || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)

    return null
  }

  const triangle = gl.createBuffer()

  if (!triangle) {
    gl.deleteProgram(program)

    return null
  }

  const position = gl.getAttribLocation(program, "aPosition")
  const drift = gl.getUniformLocation(program, "uDrift")

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  )
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  return {
    draw(phase: number) {
      gl.uniform2f(drift, Math.cos(phase), Math.sin(phase))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      gl.disableVertexAttribArray(position)
      gl.useProgram(null)
      gl.deleteBuffer(triangle)
      gl.deleteProgram(program)
    },
  }
}
