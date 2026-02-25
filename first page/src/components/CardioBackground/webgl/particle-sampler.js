export function sampleParticlesFromMesh(positions, normals, meshIndices, vertexCount, particleCount, center, bbox, totalMeshes) {
  const particlePositions = new Float32Array(particleCount * 3);
  const particleNormals = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particlePhases = new Float32Array(particleCount);
  const particleAO = new Float32Array(particleCount);
  const particleMeshIndices = new Float32Array(particleCount);

  // --- START: PARTICLE ALLOCATION ---
  // 1. Tally vertices for each mesh and create lists of vertex indices
  const meshVertexCounts = Array(totalMeshes).fill(0);
  const meshVertexIndices = Array.from({ length: totalMeshes }, () => []);
  for (let i = 0; i < vertexCount; i++) {
    const meshIdx = meshIndices[i];
    meshVertexCounts[meshIdx]++;
    meshVertexIndices[meshIdx].push(i);
  }
  
  const particleAllocations = new Int32Array(totalMeshes);

  // 2. Allocate particles based on uniform density
  console.log('Using uniform density sampling strategy...');
  // Determine particle allocation for each mesh based on its proportion of total vertices
  let allocatedCount = 0;
  for (let i = 0; i < totalMeshes; i++) {
    const proportion = meshVertexCounts[i] / vertexCount;
    const allocation = Math.round(proportion * particleCount);
    particleAllocations[i] = allocation;
    allocatedCount += allocation;
  }
  
  // Adjust allocations to match the exact particle count due to rounding
  let diff = particleCount - allocatedCount;
  while (diff !== 0) {
    const index = Math.floor(Math.random() * totalMeshes);
    if (diff > 0) {
      particleAllocations[index]++;
      diff--;
    } else if (particleAllocations[index] > 0) {
      particleAllocations[index]--;
      diff++;
    }
  }

  console.log('Particle allocations per mesh:', particleAllocations);
  // --- END: PARTICLE ALLOCATION ---

  // Simple 3D noise for color variation
  function noise3d(x, y, z) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return n - Math.floor(n);
  }

  // Generate subtle color tint based on mesh index
  function getMeshTint(meshIdx, totalMeshes) {
    // Create subtle hue shifts across the spectrum
    const hueShift = (meshIdx / totalMeshes) * 60 - 30; // -30 to +30 degree shift
    const saturationBoost = 0.08; // Subtle saturation increase
    const brightnessShift = (Math.sin(meshIdx * 2.1) * 0.05); // Slight brightness variation
    
    return { hueShift, saturationBoost, brightnessShift };
  }

  // Apply subtle tint to RGB color
  function applyTint(r, g, b, tint) {
    // Convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
      } else {
        h = ((r - g) / d + 4) / 6;
      }
    }

    // Apply subtle tint
    h = (h * 360 + tint.hueShift) / 360;
    if (h < 0) h += 1;
    if (h > 1) h -= 1;
    s = Math.min(1, s + tint.saturationBoost);
    const lAdjusted = Math.max(0, Math.min(1, l + tint.brightnessShift));

    // Convert back to RGB
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    if (s === 0) {
      return [lAdjusted, lAdjusted, lAdjusted];
    } else {
      const q = lAdjusted < 0.5 ? lAdjusted * (1 + s) : lAdjusted + s - lAdjusted * s;
      const p = 2 * lAdjusted - q;
      return [
        hue2rgb(p, q, h + 1/3),
        hue2rgb(p, q, h),
        hue2rgb(p, q, h - 1/3)
      ];
    }
  }

  // Calculate ambient occlusion for a vertex
  function calculateAO(vertIdx, positions, normals, vertexCount) {
    if (!normals) return 0.7;
    
    const px = positions[vertIdx * 3];
    const py = positions[vertIdx * 3 + 1];
    const pz = positions[vertIdx * 3 + 2];
    const nx = normals[vertIdx * 3];
    const ny = normals[vertIdx * 3 + 1];
    const nz = normals[vertIdx * 3 + 2];
    
    let aoSum = 0;
    let sampleCount = 0;
    const sampleRadius = 0.5;
    const maxSamples = 16;
    
    // Sample nearby vertices
    for (let j = 0; j < maxSamples && sampleCount < maxSamples; j++) {
      const sampleIdx = Math.floor(Math.random() * Math.min(vertexCount, vertIdx + 100));
      if (sampleIdx === vertIdx) continue;
      
      const sx = positions[sampleIdx * 3];
      const sy = positions[sampleIdx * 3 + 1];
      const sz = positions[sampleIdx * 3 + 2];
      
      const dx = sx - px;
      const dy = sy - py;
      const dz = sz - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist < sampleRadius && dist > 0.001) {
        // Check if sample is in the hemisphere of the normal
        const dotProduct = (dx * nx + dy * ny + dz * nz) / dist;
        if (dotProduct > 0) {
          // Closer samples contribute more to occlusion
          aoSum += (1.0 - dist / sampleRadius) * Math.max(0, dotProduct);
          sampleCount++;
        }
      }
    }
    
    if (sampleCount === 0) return 0.8;
    
    // Convert occlusion to accessibility (1.0 = fully accessible, 0.0 = fully occluded)
    const occlusion = aoSum / sampleCount;
    return Math.max(0.2, 1.0 - occlusion * 0.5);
  }

  let particleCursor = 0;
  // 4. Sample particles from each mesh according to its allocation
  for (let meshIdx = 0; meshIdx < totalMeshes; meshIdx++) {
    const numParticlesToSample = particleAllocations[meshIdx];
    const currentMeshVertices = meshVertexIndices[meshIdx];

    if (currentMeshVertices.length === 0) continue;

    for (let i = 0; i < numParticlesToSample; i++) {
      if (particleCursor >= particleCount) break;

      // Pick a random vertex *from this mesh*
      const vertIdx = currentMeshVertices[Math.floor(Math.random() * currentMeshVertices.length)];
      
      // Copy position
      const px = positions[vertIdx * 3];
      const py = positions[vertIdx * 3 + 1];
      const pz = positions[vertIdx * 3 + 2];
      
      particlePositions[particleCursor * 3] = px;
      particlePositions[particleCursor * 3 + 1] = py;
      particlePositions[particleCursor * 3 + 2] = pz;
      
      // Copy or generate normal
      if (normals) {
        particleNormals[particleCursor * 3] = normals[vertIdx * 3];
        particleNormals[particleCursor * 3 + 1] = normals[vertIdx * 3 + 1];
        particleNormals[particleCursor * 3 + 2] = normals[vertIdx * 3 + 2];
      } else {
        particleNormals[particleCursor * 3] = 0;
        particleNormals[particleCursor * 3 + 1] = 1;
        particleNormals[particleCursor * 3 + 2] = 0;
      }
      
      // Calculate ambient occlusion
      particleAO[particleCursor] = calculateAO(vertIdx, positions, normals, vertexCount);
      
      // Normalized positions for color generation
      const normalizedY = (py - bbox.min[1]) / (bbox.max[1] - bbox.min[1]);
      const normalizedX = (px - bbox.min[0]) / (bbox.max[0] - bbox.min[0]);
      const normalizedZ = (pz - bbox.min[2]) / (bbox.max[2] - bbox.min[2]);
      
      // Use 3D noise for organic color variation
      const noise1 = noise3d(px * 0.8, py * 0.8, pz * 0.8);
      const noise2 = noise3d(px * 0.5 + 100, py * 0.5, pz * 0.5);
      const noise3Val = noise3d(px * 1.2, py * 1.2 + 50, pz * 1.2);
      const noise4 = noise3d(px * 0.3, py * 0.3 + 200, pz * 0.3);
      
      // Distance from center for regional coloring
      const distFromCenter = Math.sqrt(
        Math.pow(normalizedX - 0.5, 2) + 
        Math.pow(normalizedZ - 0.5, 2)
      );
      
      // Determine tissue type based on texture reference
      let r, g, b;
      const rand = Math.random();
      
      // Yellow/beige fat tissue (5% - edges and connective tissue)
      if ((distFromCenter > 0.45 || normalizedY > 0.85) && noise1 > 0.75 && rand < 0.05) {
        r = 0.88 + noise1 * 0.08;
        g = 0.75 + noise2 * 0.15;
        b = 0.45 + noise3Val * 0.15;
      }
      // Cyan/blue veins (10% - specific zones)
      else if (noise2 < 0.25 && (distFromCenter > 0.3 || normalizedY < 0.3) && rand < 0.15) {
        r = 0.25 + noise1 * 0.15;
        g = 0.50 + noise2 * 0.20;
        b = 0.60 + noise3Val * 0.25;
      }
      // Bright red arteries (15% - outer regions and vessels)
      else if ((distFromCenter > 0.38 || noise3Val > 0.7) && rand < 0.30) {
        r = 0.92 + noise1 * 0.08;
        g = 0.12 + noise2 * 0.10;
        b = 0.10 + noise3Val * 0.10;
      }
      // Pink/red muscle tissue (70% - main body)
      else {
        // Vertical gradient: darker at bottom, lighter at top
        const muscleBase = 0.80 + normalizedY * 0.10;
        r = muscleBase + noise1 * 0.08;
        g = 0.40 + normalizedY * 0.15 + noise2 * 0.10;
        b = 0.42 + normalizedY * 0.10 + noise3Val * 0.12;
        
        // Add pink tones
        r = Math.min(1.0, r + 0.05);
        b = Math.min(1.0, b + 0.03);
      }
      
      // Add depth variation based on position
      const depthFactor = noise4 * 0.15;
      r = Math.max(0.1, r - depthFactor);
      g = Math.max(0.1, g - depthFactor);
      b = Math.max(0.1, b - depthFactor);
      
      // Surface texture variation (small-scale detail)
      const surfaceNoise = noise3d(px * 3.0, py * 3.0, pz * 3.0);
      const textureFactor = (surfaceNoise - 0.5) * 0.1;
      r = Math.max(0.05, Math.min(1.0, r + textureFactor));
      g = Math.max(0.05, Math.min(1.0, g + textureFactor));
      b = Math.max(0.05, Math.min(1.0, b + textureFactor));
      
      // Apply subtle mesh-based tinting
      const meshIdxFromVert = meshIndices[vertIdx];
      const meshTint = getMeshTint(meshIdxFromVert, totalMeshes);
      const tintedColor = applyTint(r, g, b, meshTint);
      
      particleColors[particleCursor * 3] = tintedColor[0];
      particleColors[particleCursor * 3 + 1] = tintedColor[1];
      particleColors[particleCursor * 3 + 2] = tintedColor[2];
      
      // Random size variation
      particleSizes[particleCursor] = 1.8 + Math.random() * 0.4;
      
      // Random phase for heartbeat timing
      particlePhases[particleCursor] = Math.random();
      
      // Store mesh index
      particleMeshIndices[particleCursor] = meshIdx;

      particleCursor++;
    }
  }
  
  return {
    positions: particlePositions,
    normals: particleNormals,
    colors: particleColors,
    sizes: particleSizes,
    phases: particlePhases,
    ao: particleAO,
    meshIndices: particleMeshIndices
  };
}
