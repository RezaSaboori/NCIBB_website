import { SimplexNoise } from './noise.js';

class Particle {
  constructor() {
    this.position = [0, 0, 0];
    this.velocity = [0, 0, 0];
    this.age = 0;
    this.lifespan = 0;
  }

  reset(radius, spawnRadius, heartCenter, minLifespan, maxLifespan) {
    this.age = 0;
    this.lifespan = minLifespan + Math.random() * (maxLifespan - minLifespan);
    
    // Spawn randomly within spherical restriction area
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * radius; // Cube root for uniform volume distribution
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    this.position[0] = heartCenter[0] + x;
    this.position[1] = heartCenter[1] + y;
    this.position[2] = heartCenter[2] + z;
    
    // Small random initial velocity
    this.velocity[0] = (Math.random() - 0.5) * 0.5;
    this.velocity[1] = (Math.random() - 0.5) * 0.5;
    this.velocity[2] = (Math.random() - 0.5) * 0.5;
  }

  getDistanceToHeart(heartCenter) {
    const dx = this.position[0] - heartCenter[0];
    const dy = this.position[1] - heartCenter[1];
    const dz = this.position[2] - heartCenter[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export class CurlFlowParticles {
  constructor(gl, config, headerSize, headerCenter) {
    this.gl = gl;
    this.config = config;
    this.headerSize = headerSize;
    this.headerCenter = headerCenter;
    
    // Area configuration (spherical)
    this.areaMultiplier = config.ambientType2AreaMultiplier || 2.0;
    this.customRadius = config.ambientType2Width; // Using 'Width' config property as radius
    this.updateBounds();
    
    // Particle count
    this.particleCount = config.ambientType2Count || 3000;
    
    // Physics parameters
    this.particleSpeed = config.ambientType2ParticleSpeed || 1.0;
    this.spawnRadius = config.ambientType2SpawnRadius || 1.8;
    this.springStrength = config.ambientType2SpringStrength || 0.15;
    this.dragCoefficient = config.ambientType2DragCoefficient || 0.98;
    
    // Noise parameters
    this.noiseStrength = config.ambientType2NoiseStrength || 12.0;
    this.noiseScale = config.ambientType2NoiseScale || 0.02;
    this.noiseOctaves = config.ambientType2NoiseOctaves || 3;
    this.noisePersistence = config.ambientType2NoisePersistence || 0.5;
    this.noiseLacunarity = config.ambientType2NoiseLacunarity || 2.0;
    this.noiseTimeScale = config.ambientType2NoiseTimeScale || 0.05;
    this.patternShiftSpeed = config.ambientType2PatternShiftSpeed || 0.01;
    
    // Lifespan
    this.minLifespan = config.ambientType2MinLifespan || 10.0;
    this.maxLifespan = config.ambientType2MaxLifespan || 20.0;
    
    // Particle properties
    this.particleSize = config.ambientType2Size || 1.5;
    this.particleColor = config.ambientType2Color || [0.5, 0.7, 1.0]; // Blue-ish
    
    // Initialize noise instances for curl
    this.noiseX = new SimplexNoise(Math.random() * 1000);
    this.noiseY = new SimplexNoise(Math.random() * 1000 + 1000);
    this.noiseZ = new SimplexNoise(Math.random() * 1000 + 2000);
    this.noisePatternX = new SimplexNoise(Math.random() * 1000 + 3000);
    this.noisePatternY = new SimplexNoise(Math.random() * 1000 + 4000);
    this.noisePatternZ = new SimplexNoise(Math.random() * 1000 + 5000);
    
    // Heart surface detection threshold
    this.heartSurfaceThreshold = 0.5; // Distance from center to consider "reached heart"
    
    // Initialize particles
    this.particles = [];
    this.positions = new Float32Array(this.particleCount * 3);
    
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
  }

  initParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = new Particle();
      particle.reset(this.radius, this.spawnRadius, this.headerCenter, this.minLifespan, this.maxLifespan);
      this.particles.push(particle);
      
      const idx = i * 3;
      this.positions[idx] = particle.position[0];
      this.positions[idx + 1] = particle.position[1];
      this.positions[idx + 2] = particle.position[2];
    }
  }

  initBuffers() {
    // Position buffer
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions, this.gl.DYNAMIC_DRAW);
    
    // Color buffer (all same color)
    this.colorBuffer = this.gl.createBuffer();
    const colors = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount; i++) {
      colors[i * 3] = this.particleColor[0];
      colors[i * 3 + 1] = this.particleColor[1];
      colors[i * 3 + 2] = this.particleColor[2];
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
    
    // Size buffer
    this.sizeBuffer = this.gl.createBuffer();
    const sizes = new Float32Array(this.particleCount);
    sizes.fill(this.particleSize);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizes, this.gl.STATIC_DRAW);
  }

  getCurlNoise(position, time, patternOffset) {
    let noiseVec = [0, 0, 0];
    let amplitude = 1.0;
    let scale = this.noiseScale;
    
    const posX = position[0] + patternOffset[0];
    const posY = position[1] + patternOffset[1];
    const posZ = position[2] + patternOffset[2];
    
    for (let octave = 0; octave < this.noiseOctaves; octave++) {
      const scaledX = posX * scale;
      const scaledY = posY * scale;
      const scaledZ = posZ * scale;
      const timeScaled = time * this.noiseTimeScale;
      
      const nx = this.noiseX.noise3D(scaledX, scaledY, scaledZ + timeScaled);
      const ny = this.noiseY.noise3D(scaledY, scaledZ, scaledX + timeScaled + 100);
      const nz = this.noiseZ.noise3D(scaledZ, scaledX, scaledY + timeScaled + 200);
      
      noiseVec[0] += nx * amplitude;
      noiseVec[1] += ny * amplitude;
      noiseVec[2] += nz * amplitude;
      
      amplitude *= this.noisePersistence;
      scale *= this.noiseLacunarity;
    }
    
    // Normalize and apply strength
    const length = Math.sqrt(noiseVec[0] * noiseVec[0] + noiseVec[1] * noiseVec[1] + noiseVec[2] * noiseVec[2]);
    if (length > 0.0001) {
      const factor = this.noiseStrength / length;
      noiseVec[0] *= factor;
      noiseVec[1] *= factor;
      noiseVec[2] *= factor;
    }
    
    return noiseVec;
  }

  update(time) {
    const deltaTime = 0.016; // Approximate 60fps
    
    // Calculate pattern offset for evolving curl patterns
    const patternOffset = [
      this.noisePatternX.noise2D(time * this.patternShiftSpeed, 0) * 10,
      this.noisePatternY.noise2D(time * this.patternShiftSpeed, 100) * 10,
      this.noisePatternZ.noise2D(time * this.patternShiftSpeed, 200) * 10
    ];
    
    for (let i = 0; i < this.particleCount; i++) {
      const particle = this.particles[i];
      particle.age += deltaTime;
      
      // Check reset conditions
      const distToHeart = particle.getDistanceToHeart(this.headerCenter);
      if (distToHeart < this.heartSurfaceThreshold || particle.age > particle.lifespan) {
        particle.reset(this.radius, this.spawnRadius, this.headerCenter, this.minLifespan, this.maxLifespan);
      }
      
      // Calculate spring force (pulls toward heart center)
      const dx = this.headerCenter[0] - particle.position[0];
      const dy = this.headerCenter[1] - particle.position[1];
      const dz = this.headerCenter[2] - particle.position[2];
      
      const springForce = [
        dx * this.springStrength,
        dy * this.springStrength,
        dz * this.springStrength
      ];
      
      // Calculate curl noise force
      const curlNoise = this.getCurlNoise(particle.position, time, patternOffset);
      
      // Combine forces
      const acceleration = [
        springForce[0] + curlNoise[0],
        springForce[1] + curlNoise[1],
        springForce[2] + curlNoise[2]
      ];
      
      // Update velocity
      particle.velocity[0] = (particle.velocity[0] + acceleration[0] * deltaTime) * this.dragCoefficient;
      particle.velocity[1] = (particle.velocity[1] + acceleration[1] * deltaTime) * this.dragCoefficient;
      particle.velocity[2] = (particle.velocity[2] + acceleration[2] * deltaTime) * this.dragCoefficient;
      
      // Ensure minimum velocity to avoid stagnation
      const velLength = Math.sqrt(
        particle.velocity[0] * particle.velocity[0] +
        particle.velocity[1] * particle.velocity[1] +
        particle.velocity[2] * particle.velocity[2]
      );
      
      if (velLength < 0.1) {
        // Add small inward push
        const pushFactor = 0.5 / Math.max(distToHeart, 0.001);
        particle.velocity[0] += dx * pushFactor;
        particle.velocity[1] += dy * pushFactor;
        particle.velocity[2] += dz * pushFactor;
      }
      
      // Update position with speed multiplier
      particle.position[0] += particle.velocity[0] * deltaTime * this.particleSpeed;
      particle.position[1] += particle.velocity[1] * deltaTime * this.particleSpeed;
      particle.position[2] += particle.velocity[2] * deltaTime * this.particleSpeed;
      
      // Spherical boundary constraints
      const relX = particle.position[0] - this.headerCenter[0];
      const relY = particle.position[1] - this.headerCenter[1];
      const relZ = particle.position[2] - this.headerCenter[2];
      
      const distanceFromCenter = Math.sqrt(relX * relX + relY * relY + relZ * relZ);
      
      if (distanceFromCenter > this.radius) {
        // Normalize direction and place particle on sphere surface
        const normalizedX = relX / distanceFromCenter;
        const normalizedY = relY / distanceFromCenter;
        const normalizedZ = relZ / distanceFromCenter;
        
        particle.position[0] = this.headerCenter[0] + normalizedX * this.radius;
        particle.position[1] = this.headerCenter[1] + normalizedY * this.radius;
        particle.position[2] = this.headerCenter[2] + normalizedZ * this.radius;
        
        // Bounce velocity back (reflect along radial direction)
        const dotProduct = particle.velocity[0] * normalizedX + 
                          particle.velocity[1] * normalizedY + 
                          particle.velocity[2] * normalizedZ;
        
        particle.velocity[0] -= 2 * dotProduct * normalizedX * 0.5;
        particle.velocity[1] -= 2 * dotProduct * normalizedY * 0.5;
        particle.velocity[2] -= 2 * dotProduct * normalizedZ * 0.5;
      }
      
      // Update positions array
      const idx = i * 3;
      this.positions[idx] = particle.position[0];
      this.positions[idx + 1] = particle.position[1];
      this.positions[idx + 2] = particle.position[2];
    }
    
    // Update GPU buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.positions);
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
    
    // Handle particle count change
    if (config.ambientType2Count !== undefined && config.ambientType2Count !== this.particleCount) {
      this.particleCount = config.ambientType2Count;
      this.particles = [];
      this.positions = new Float32Array(this.particleCount * 3);
      this.initParticles();
      this.initBuffers();
      return;
    }
    
    // Update area configuration
    if (config.ambientType2AreaMultiplier !== undefined) {
      this.areaMultiplier = config.ambientType2AreaMultiplier;
    }
    
    // Update custom radius (use width as radius override)
    if (config.ambientType2Width !== undefined) {
      this.customRadius = config.ambientType2Width;
    }
    
    // Recalculate bounds if dimension-related config changed
    if (config.ambientType2AreaMultiplier !== undefined || 
        config.ambientType2Width !== undefined) {
      this.updateBounds();
    }
    
    // Update physics parameters
    if (config.ambientType2ParticleSpeed !== undefined) {
      this.particleSpeed = config.ambientType2ParticleSpeed;
    }
    if (config.ambientType2SpawnRadius !== undefined) {
      this.spawnRadius = config.ambientType2SpawnRadius;
    }
    if (config.ambientType2SpringStrength !== undefined) {
      this.springStrength = config.ambientType2SpringStrength;
    }
    if (config.ambientType2DragCoefficient !== undefined) {
      this.dragCoefficient = config.ambientType2DragCoefficient;
    }
    
    // Update noise parameters
    if (config.ambientType2NoiseStrength !== undefined) {
      this.noiseStrength = config.ambientType2NoiseStrength;
    }
    if (config.ambientType2NoiseScale !== undefined) {
      this.noiseScale = config.ambientType2NoiseScale;
    }
    if (config.ambientType2NoiseOctaves !== undefined) {
      this.noiseOctaves = config.ambientType2NoiseOctaves;
    }
    if (config.ambientType2NoisePersistence !== undefined) {
      this.noisePersistence = config.ambientType2NoisePersistence;
    }
    if (config.ambientType2NoiseLacunarity !== undefined) {
      this.noiseLacunarity = config.ambientType2NoiseLacunarity;
    }
    if (config.ambientType2NoiseTimeScale !== undefined) {
      this.noiseTimeScale = config.ambientType2NoiseTimeScale;
    }
    if (config.ambientType2PatternShiftSpeed !== undefined) {
      this.patternShiftSpeed = config.ambientType2PatternShiftSpeed;
    }
    
    // Update lifespan
    if (config.ambientType2MinLifespan !== undefined) {
      this.minLifespan = config.ambientType2MinLifespan;
    }
    if (config.ambientType2MaxLifespan !== undefined) {
      this.maxLifespan = config.ambientType2MaxLifespan;
    }
    
    // Update size
    if (config.ambientType2Size !== undefined) {
      this.particleSize = config.ambientType2Size;
      const sizes = new Float32Array(this.particleCount);
      sizes.fill(this.particleSize);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, sizes);
    }
    
    // Update color
    if (config.ambientType2Color !== undefined) {
      this.particleColor = config.ambientType2Color;
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
}

