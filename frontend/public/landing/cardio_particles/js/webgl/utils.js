async function loadShader(gl, type, url) {
  const response = await fetch(url);
  const source = await response.text();
  return compile(gl, type, source);
}

export async function createProgram(gl, vertUrl, fragUrl) {
  const vs = await loadShader(gl, gl.VERTEX_SHADER, vertUrl);
  const fs = await loadShader(gl, gl.FRAGMENT_SHADER, fragUrl);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
  }
  return program;
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed');
  }
  return shader;
}

export function toTypedArray(spec) {
  const data = spec.data;
  if (Array.isArray(data) && data.length > 0) {
    if (Array.isArray(data[0])) {
      return new Float32Array(data.flat());
    }
    return new Float32Array(data);
  }
  throw new Error('Invalid data format in attribute spec');
}

export function computeBoundingBox(positions, vertexCount) {
  if (vertexCount === 0) {
    return { min: [0, 0, 0], max: [0, 0, 0] };
  }
  
  let minX = positions[0], minY = positions[1], minZ = positions[2];
  let maxX = positions[0], maxY = positions[1], maxZ = positions[2];
  
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  
  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ]
  };
}

export function resize(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
}
