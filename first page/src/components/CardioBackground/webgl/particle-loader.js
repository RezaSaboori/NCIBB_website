/**
 * Utility to load pre-generated particle data
 * Use this if you've pre-converted mesh_data.json to particles using convert_mesh_to_particles.py/js
 */

/**
 * Decode base64 string to Float32Array
 * @param {string} base64 - Base64 encoded string
 * @returns {Float32Array} Decoded Float32Array
 */
function decodeBase64ToFloat32Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
}

/**
 * Load pre-generated particle data from JSON file
 * @param {string} url - URL to particles.json file
 * @returns {Promise<Object>} Particle data object with positions, normals, colors, sizes, phases, ao, meshIndices
 */
export async function loadParticlesFromJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load particles: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.format !== 'base64_float32') {
        throw new Error(`Unsupported particle format: ${data.format}`);
    }
    
    return {
        positions: decodeBase64ToFloat32Array(data.positions),
        normals: decodeBase64ToFloat32Array(data.normals),
        colors: decodeBase64ToFloat32Array(data.colors),
        sizes: decodeBase64ToFloat32Array(data.sizes),
        phases: decodeBase64ToFloat32Array(data.phases),
        ao: decodeBase64ToFloat32Array(data.ao),
        meshIndices: decodeBase64ToFloat32Array(data.meshIndices),
        count: data.count
    };
}

/**
 * Check if pre-generated particle data exists
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if file exists
 */
export async function particlesExist(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

