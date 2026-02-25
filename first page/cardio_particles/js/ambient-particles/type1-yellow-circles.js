import { SimplexNoise } from './noise.js';

export class YellowCircleParticles {
  constructor(gl, config, headerSize, headerCenter) {
    this.gl = gl;
    this.config = config;
    this.headerSize = headerSize; // [width, height, depth]
    this.headerCenter = headerCenter; // [x, y, z]
    
    // Area multiplier - defines how much larger the spherical particle area is than the header
    this.areaMultiplier = config.ambientType1AreaMultiplier || 1.5;
    
    // Custom radius override (if set, use this instead of multiplier)
    this.customRadius = config.ambientType1Width; // Using 'Width' config property as radius
    
    // Calculate particle bounds (spherical)
    this.updateBounds();
    
    // Particle count
    this.particleCount = config.ambientType1Count || 5000;
    
    // Particle speed multiplier
    this.particleSpeed = config.ambientType1ParticleSpeed || 1.0;
    
    // Noise instances for different movement components
    this.noiseX = new SimplexNoise(Math.random() * 1000);
    this.noiseY = new SimplexNoise(Math.random() * 1000 + 1000);
    this.noiseZ = new SimplexNoise(Math.random() * 1000 + 2000);
    
    // Noise parameters
    this.noiseScale = config.ambientType1NoiseScale || 0.01;
    this.noiseSpeed = config.ambientType1NoiseSpeed || 0.1;
    this.noiseStrength = config.ambientType1NoiseStrength || 0.5;
    
    // Particle properties
    this.particleSize = config.ambientType1Size || 2.0;
    this.particleColor = config.ambientType1Color || [1.0, 0.9, 0.2]; // Use config color or default yellow
    
    // Diffusion parameters to prevent clustering
    this.diffusionStrength = config.ambientType1Diffusion || 0.02;
    this.repulsionRadius = config.ambientType1RepulsionRadius || 0.1;
    
    // Initialize particles
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.offsets = new Float32Array(this.particleCount * 3); // Random offsets for noise sampling
    
    this.initParticles();
    this.initBuffers();
  }

  updateBounds() {
    // Calculate sphere radius from header dimensions
    // Use the maximum of the header dimensions as base radius for better coverage
    const baseRadius = Math.max(this.headerSize[0], this.headerSize[1], this.headerSize[2]) * 0.5;
    
    // Apply custom radius or use multiplier
    if (this.customRadius !== null && this.customRadius !== undefined && this.customRadius > 0) {
      this.radius = this.customRadius;
    } else {
      this.radius = baseRadius * this.areaMultiplier;
    }
    
    console.log('[Type1] Spherical boundary - radius:', this.radius, 'baseRadius:', baseRadius, 'multiplier:', this.areaMultiplier);
  }

  initParticles() {
    // Initialize particles in a spherical volume
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      
      // Use Halton sequence for better spherical distribution
      const haltonU = this.halton(i, 2);
      const haltonV = this.halton(i, 3);
      const haltonW = this.halton(i, 5);
      
      // Convert to spherical coordinates for uniform distribution
      const theta = haltonU * 2 * Math.PI; // azimuthal angle
      const phi = Math.acos(2 * haltonV - 1); // polar angle
      const r = Math.cbrt(haltonW) * this.radius; // radial distance (cube root for volume uniformity)
      
      // Convert to Cartesian coordinates
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      this.positions[idx] = this.headerCenter[0] + x;
      this.positions[idx + 1] = this.headerCenter[1] + y;
      this.positions[idx + 2] = this.headerCenter[2] + z;
      
      // Initialize velocities to zero
      this.velocities[idx] = 0;
      this.velocities[idx + 1] = 0;
      this.velocities[idx + 2] = 0;
      
      // Random offsets for noise sampling (ensures each particle samples different noise)
      this.offsets[idx] = Math.random() * 1000;
      this.offsets[idx + 1] = Math.random() * 1000;
      this.offsets[idx + 2] = Math.random() * 1000;
    }
  }

  halton(index, base) {
    let result = 0;
    let f = 1.0 / base;
    let i = index;
    while (i > 0) {
      result += f * (i % base);
      i = Math.floor(i / base);
      f /= base;
    }
    return result;
  }

  initBuffers() {
    // Create buffers for positions
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions, this.gl.DYNAMIC_DRAW);
    
    // Create buffer for colors (all yellow)
    this.colorBuffer = this.gl.createBuffer();
    const colors = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount; i++) {
      colors[i * 3] = this.particleColor[0];
      colors[i * 3 + 1] = this.particleColor[1];
      colors[i * 3 + 2] = this.particleColor[2];
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
    
    // Create buffer for sizes
    this.sizeBuffer = this.gl.createBuffer();
    const sizes = new Float32Array(this.particleCount);
    sizes.fill(this.particleSize);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizes, this.gl.STATIC_DRAW);
  }

  update(time) {
    // Update noise time (slowly changing)
    const noiseTime = time * this.noiseSpeed;
    
    // Update each particle
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      
      // Sample noise at particle position with time offset
      const noiseX = this.noiseX.fractalNoise3D(
        this.positions[idx] * this.noiseScale + this.offsets[idx],
        this.positions[idx + 1] * this.noiseScale + this.offsets[idx + 1],
        noiseTime + this.offsets[idx],
        3, 0.5, 0.5
      );
      
      const noiseY = this.noiseY.fractalNoise3D(
        this.positions[idx] * this.noiseScale + this.offsets[idx],
        this.positions[idx + 1] * this.noiseScale + this.offsets[idx + 1],
        noiseTime + this.offsets[idx + 1],
        3, 0.5, 0.5
      );
      
      const noiseZ = this.noiseZ.fractalNoise3D(
        this.positions[idx] * this.noiseScale + this.offsets[idx],
        this.positions[idx + 1] * this.noiseScale + this.offsets[idx + 1],
        noiseTime + this.offsets[idx + 2],
        3, 0.5, 0.5
      );
      
      // Update velocity based on noise (harmonic movement)
      this.velocities[idx] += (noiseX * this.noiseStrength - this.velocities[idx]) * 0.1;
      this.velocities[idx + 1] += (noiseY * this.noiseStrength - this.velocities[idx + 1]) * 0.1;
      this.velocities[idx + 2] += (noiseZ * this.noiseStrength - this.velocities[idx + 2]) * 0.1;
      
      // Apply diffusion (random walk to prevent clustering)
      this.velocities[idx] += (Math.random() - 0.5) * this.diffusionStrength;
      this.velocities[idx + 1] += (Math.random() - 0.5) * this.diffusionStrength;
      this.velocities[idx + 2] += (Math.random() - 0.5) * this.diffusionStrength;
      
      // Apply repulsion from nearby particles (prevent clustering)
      this.applyRepulsion(i);
      
      // Update position (apply particle speed multiplier)
      this.positions[idx] += this.velocities[idx] * this.particleSpeed;
      this.positions[idx + 1] += this.velocities[idx + 1] * this.particleSpeed;
      this.positions[idx + 2] += this.velocities[idx + 2] * this.particleSpeed;
      
      // Spherical boundary constraints (keep particles within sphere)
      const dx = this.positions[idx] - this.headerCenter[0];
      const dy = this.positions[idx + 1] - this.headerCenter[1];
      const dz = this.positions[idx + 2] - this.headerCenter[2];
      
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distanceFromCenter > this.radius) {
        // Normalize direction and place particle on sphere surface
        const normalizedX = dx / distanceFromCenter;
        const normalizedY = dy / distanceFromCenter;
        const normalizedZ = dz / distanceFromCenter;
        
        this.positions[idx] = this.headerCenter[0] + normalizedX * this.radius;
        this.positions[idx + 1] = this.headerCenter[1] + normalizedY * this.radius;
        this.positions[idx + 2] = this.headerCenter[2] + normalizedZ * this.radius;
        
        // Bounce velocity back (reflect along radial direction)
        const dotProduct = this.velocities[idx] * normalizedX + 
                          this.velocities[idx + 1] * normalizedY + 
                          this.velocities[idx + 2] * normalizedZ;
        
        this.velocities[idx] -= 2 * dotProduct * normalizedX * 0.5;
        this.velocities[idx + 1] -= 2 * dotProduct * normalizedY * 0.5;
        this.velocities[idx + 2] -= 2 * dotProduct * normalizedZ * 0.5;
      }
    }
    
    // Update GPU buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.positions);
  }

  applyRepulsion(particleIndex) {
    const idx = particleIndex * 3;
    const px = this.positions[idx];
    const py = this.positions[idx + 1];
    const pz = this.positions[idx + 2];
    
    let repulsionX = 0;
    let repulsionY = 0;
    let repulsionZ = 0;
    
    // Check nearby particles (sample a subset for performance)
    const sampleCount = Math.min(50, this.particleCount);
    const step = Math.max(1, Math.floor(this.particleCount / sampleCount));
    
    for (let i = 0; i < this.particleCount; i += step) {
      if (i === particleIndex) continue;
      
      const otherIdx = i * 3;
      const dx = px - this.positions[otherIdx];
      const dy = py - this.positions[otherIdx + 1];
      const dz = pz - this.positions[otherIdx + 2];
      
      const distSq = dx * dx + dy * dy + dz * dz;
      const repulsionRadiusSq = this.repulsionRadius * this.repulsionRadius;
      
      if (distSq < repulsionRadiusSq && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const force = (1.0 - dist / this.repulsionRadius) / dist;
        repulsionX += dx * force;
        repulsionY += dy * force;
        repulsionZ += dz * force;
      }
    }
    
    // Apply repulsion to velocity
    this.velocities[idx] += repulsionX * this.diffusionStrength * 10;
    this.velocities[idx + 1] += repulsionY * this.diffusionStrength * 10;
    this.velocities[idx + 2] += repulsionZ * this.diffusionStrength * 10;
  }

  bindBuffers(vao) {
    this.gl.bindVertexArray(vao);
    
    // Position
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
    
    // Color
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 0, 0);
    
    // Size
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.enableVertexAttribArray(3);
    this.gl.vertexAttribPointer(3, 1, this.gl.FLOAT, false, 0, 0);
  }

  draw() {
    this.gl.drawArrays(this.gl.POINTS, 0, this.particleCount);
  }

  updateConfig(config) {
    this.config = config;
    
    // Handle particle count change - requires reinitialization
    if (config.ambientType1Count !== undefined && config.ambientType1Count !== this.particleCount) {
      this.particleCount = config.ambientType1Count;
      this.positions = new Float32Array(this.particleCount * 3);
      this.velocities = new Float32Array(this.particleCount * 3);
      this.offsets = new Float32Array(this.particleCount * 3);
      this.initParticles();
      this.initBuffers();
      return; // Early return since buffers were recreated
    }
    
    // Update area multiplier
    if (config.ambientType1AreaMultiplier !== undefined) {
      this.areaMultiplier = config.ambientType1AreaMultiplier;
    }
    
    // Update custom radius (use width as radius override)
    if (config.ambientType1Width !== undefined) {
      this.customRadius = config.ambientType1Width;
    }
    
    // Update color if changed
    if (config.ambientType1Color !== undefined) {
      const newColor = config.ambientType1Color;
      if (newColor[0] !== this.particleColor[0] || 
          newColor[1] !== this.particleColor[1] || 
          newColor[2] !== this.particleColor[2]) {
        this.particleColor = newColor;
        // Update color buffer
        const colors = new Float32Array(this.particleCount * 3);
        for (let i = 0; i < this.particleCount; i++) {
          colors[i * 3] = this.particleColor[0];
          colors[i * 3 + 1] = this.particleColor[1];
          colors[i * 3 + 2] = this.particleColor[2];
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, colors);
      }
    }
    
    // Recalculate bounds if dimension-related config changed
    if (config.ambientType1AreaMultiplier !== undefined || 
        config.ambientType1Width !== undefined) {
      this.updateBounds();
    }
    
    // Update particle speed
    if (config.ambientType1ParticleSpeed !== undefined) {
      this.particleSpeed = config.ambientType1ParticleSpeed;
    }
    
    if (config.ambientType1NoiseScale !== undefined) {
      this.noiseScale = config.ambientType1NoiseScale;
    }
    
    if (config.ambientType1NoiseSpeed !== undefined) {
      this.noiseSpeed = config.ambientType1NoiseSpeed;
    }
    
    if (config.ambientType1NoiseStrength !== undefined) {
      this.noiseStrength = config.ambientType1NoiseStrength;
    }
    
    if (config.ambientType1Diffusion !== undefined) {
      this.diffusionStrength = config.ambientType1Diffusion;
    }
    
    if (config.ambientType1RepulsionRadius !== undefined) {
      this.repulsionRadius = config.ambientType1RepulsionRadius;
    }
    
    if (config.ambientType1Size !== undefined) {
      this.particleSize = config.ambientType1Size;
      const sizes = new Float32Array(this.particleCount);
      sizes.fill(this.particleSize);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, sizes);
    }
  }
}

