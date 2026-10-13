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

const particleRequests = new Map();

export function loadCardioParticles(url) {
    if (!particleRequests.has(url)) {
        const request = fetch(url)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        `Failed to load cardio particles: ${response.status}`
                    );
                }

                const buffer = await response.arrayBuffer();

                if (buffer.byteLength % 4 !== 0) {
                    throw new Error('Invalid particle binary alignment');
                }

                const values = new Float32Array(buffer);

                if (values.length < 8) {
                    throw new Error('Invalid particle binary header');
                }

                const particleCount = values[0];

                if (
                    !Number.isInteger(particleCount) ||
                    particleCount <= 0 ||
                    values.length !== 8 + particleCount * 13
                ) {
                    throw new Error('Invalid particle binary length');
                }

                const particleData = {};
                let offset = 8;

                for (const [name, dimensions] of [
                    ['positions', 3],
                    ['normals', 3],
                    ['colors', 3],
                    ['sizes', 1],
                    ['phases', 1],
                    ['ao', 1],
                    ['meshIndices', 1],
                ]) {
                    const length = particleCount * dimensions;

                    particleData[name] = values.slice(
                        offset,
                        offset + length
                    );

                    offset += length;
                }

                return {
                    particleData,
                    particleCount,
                    center: Array.from(values.slice(1, 4)),
                    maxSize: values[4],
                    heartBounds: Array.from(values.slice(5, 8)),
                };
            })
            .catch((error) => {
                particleRequests.delete(url);
                throw error;
            });

        particleRequests.set(url, request);
    }

    return particleRequests.get(url);
}

