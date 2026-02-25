function compile(gl, type, source) {
  if (!source || typeof source !== 'string') {
    throw new Error(`Invalid shader source: ${typeof source}. Expected string.`);
  }
  
  // Check WebGL version
  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  if (!isWebGL2 && source.includes('#version 300 es')) {
    throw new Error('Shader requires WebGL2 (uses #version 300 es) but context is WebGL1');
  }
  
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const infoLog = gl.getShaderInfoLog(shader);
    const shaderType = type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
    const errorMsg = infoLog || 'No error log available (check WebGL context and shader syntax)';
    const sourcePreview = source.length > 1000 ? source.substring(0, 1000) + '...' : source;
    throw new Error(`${shaderType} Shader compile failed:\n${errorMsg}\n\nShader source length: ${source.length}\nShader source preview:\n${sourcePreview}`);
  }
  return shader;
}

export function createProgramFromSources(gl, vertSource, fragSource) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
  }
  return program;
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
