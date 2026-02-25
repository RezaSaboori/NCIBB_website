import { createRenderer } from './webgl/renderer.js';
import { sampleParticlesFromMesh } from './webgl/particle-sampler.js';
import { toTypedArray, resize } from './webgl/utils.js';
import { setupControls } from './ui/controls.js';
import { getFlatConfig } from './config.js';

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2 unavailable');

resize(canvas);
window.addEventListener('resize', () => resize(canvas));

const particleCountEl = document.getElementById('particleCount');

const assetBase = (() => {
  const path = window.location.pathname || '';
  return path.includes('/webgl_asset/')
    ? './'
    : './webgl_asset/';
})();

(async function init() {
  try {
    console.log('Loading mesh data...');
    const manifest = await fetch(`${assetBase}mesh_data.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load mesh_data.json: ${r.status}`);
      return r.json();
    });

    console.log('Manifest loaded:', Object.keys(manifest.meshes).length, 'meshes');
    
    // Load all meshes and combine their data
    const allPositions = [];
    const allNormals = [];
    const allMeshIndices = []; // Track which mesh each vertex belongs to
    let totalVertexCount = 0;
    let bboxMin = [Infinity, Infinity, Infinity];
    let bboxMax = [-Infinity, -Infinity, -Infinity];
    let meshIndex = 0;

    for (const [meshName, primitives] of Object.entries(manifest.meshes)) {
      for (const primitive of primitives) {
        if (!primitive.attributes.POSITION) {
          console.warn(`Skipping ${meshName} - no POSITION attribute`);
          continue;
        }

        // Extract vertex positions
        const positionSpec = primitive.attributes.POSITION;
        const positions = toTypedArray(positionSpec);
        const vertexCount = positions.length / 3;
        
        console.log(`Loading ${meshName} (index ${meshIndex}): ${vertexCount} vertices`);
        
        // Add to combined positions
        for (let i = 0; i < positions.length; i++) {
          allPositions.push(positions[i]);
        }
        
        // Track mesh index for each vertex
        for (let i = 0; i < vertexCount; i++) {
          allMeshIndices.push(meshIndex);
        }
        
        // Extract and add normals if available
        if (primitive.attributes.NORMAL) {
          const normalSpec = primitive.attributes.NORMAL;
          const normals = toTypedArray(normalSpec);
          for (let i = 0; i < normals.length; i++) {
            allNormals.push(normals[i]);
          }
        } else {
          // Add default normals if not available
          for (let i = 0; i < vertexCount; i++) {
            allNormals.push(0, 1, 0);
          }
        }
        
        // Update bounding box incrementally
        for (let i = 0; i < vertexCount; i++) {
          const x = positions[i * 3];
          const y = positions[i * 3 + 1];
          const z = positions[i * 3 + 2];
          bboxMin[0] = Math.min(bboxMin[0], x);
          bboxMin[1] = Math.min(bboxMin[1], y);
          bboxMin[2] = Math.min(bboxMin[2], z);
          bboxMax[0] = Math.max(bboxMax[0], x);
          bboxMax[1] = Math.max(bboxMax[1], y);
          bboxMax[2] = Math.max(bboxMax[2], z);
        }
        
        totalVertexCount += vertexCount;
        meshIndex++;
      }
    }

    // Convert to typed arrays
    const positions = new Float32Array(allPositions);
    const normals = allNormals.length > 0 ? new Float32Array(allNormals) : null;
    const meshIndices = new Uint8Array(allMeshIndices);
    const vertexCount = totalVertexCount;
    const totalMeshes = meshIndex;
    
    console.log(`Total vertices loaded: ${vertexCount} from ${totalMeshes} meshes`);

    // Calculate bounding box from accumulated min/max
    const bbox = { min: bboxMin, max: bboxMax };
    const center = [
      (bbox.min[0] + bbox.max[0]) / 2,
      (bbox.min[1] + bbox.max[1]) / 2,
      (bbox.min[2] + bbox.max[2]) / 2
    ];
    const size = [
      bbox.max[0] - bbox.min[0],
      bbox.max[1] - bbox.min[1],
      bbox.max[2] - bbox.min[2]
    ];
    const maxSize = Math.max(size[0], size[1], size[2]);
    
    console.log('Bounding box:', bbox);
    console.log('Center:', center);
    console.log('Size:', size);

    // Load configuration from centralized config file
    const config = getFlatConfig();

    // Calculate particle count
    let PARTICLE_COUNT;
    if (config.particleCount > 0) {
      PARTICLE_COUNT = config.particleCount;
      console.log(`Using fixed particle count from config: ${PARTICLE_COUNT}`);
    } else {
      const heartDensity = config.heartDensity;
      PARTICLE_COUNT = Math.min(200000, Math.max(20000, Math.floor(vertexCount * heartDensity)));
      console.log(`Calculated particle count: ${PARTICLE_COUNT} (from ${vertexCount} vertices, density: ${heartDensity})`);
    }
    
    // Update particle count display (if element exists)
    if (particleCountEl) {
      particleCountEl.textContent = PARTICLE_COUNT.toLocaleString();
    }

    // Sample particles from mesh
    console.log(`Generating ${PARTICLE_COUNT} particles...`);
    const particles = sampleParticlesFromMesh(positions, normals, meshIndices, vertexCount, PARTICLE_COUNT, center, bbox, totalMeshes);
    console.log('Particles generated');

    const heartBounds = [
      Math.max(size[0] * 0.8, 0.001),
      Math.max(size[1] * 0.6, 0.001),
      Math.max(size[2] * 0.4, 0.001)
    ];

    const renderer = createRenderer(gl, canvas, config, particles, PARTICLE_COUNT, center, maxSize, heartBounds);
    await renderer.init();
    
    setupControls(config, canvas, renderer);

    console.log('Starting particle render loop...');
    requestAnimationFrame(renderer.render);
    
  } catch (error) {
    console.error('Initialization error:', error);
    document.body.innerHTML = `<div style="color: white; padding: 20px; font-family: monospace;">
      <h2>Error loading particle system</h2>
      <pre>${error.message}\n${error.stack}</pre>
    </div>`;
  }
})();
