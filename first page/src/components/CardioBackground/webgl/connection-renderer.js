import { createProgramFromSources } from './utils.js';

// Import shaders
import connectionVert from '../shaders/heart-connection.vert?raw';
import connectionFrag from '../shaders/heart-connection.frag?raw';

/**
 * Connection Renderer for Heart Particles
 * Renders sophisticated connections between particles on the heart surface
 */
export function createConnectionRenderer(gl, config, particles, particleCount, center, maxSize) {
    let program, uniforms, vao;
    
    // Buffers for quad geometry
    let p1Buffer, p2Buffer, normal1Buffer, normal2Buffer, phase1Buffer, phase2Buffer, offsetBuffer;
    
    let vertexCount = 0;

    /**
     * Calculate geodesic-aware nearest neighbors
     * Uses normal vectors to ensure connections stay on surface
     */
    function calculateConnections() {
        const maxNeighbors = config.maxNeighbors;
        const maxDistance = config.connectionDistance * maxSize;
        const geodesicThreshold = config.geodesicThreshold;
        
        console.log(`Calculating connections: maxNeighbors=${maxNeighbors}, maxDistance=${maxDistance.toFixed(3)}, geodesicThreshold=${geodesicThreshold}`);
        
        const connections = [];
        const connectionSet = new Set(); // Track unique connections
        
        // Build spatial hash for faster neighbor lookups
        const spatialHash = buildSpatialHash(particles.positions, particleCount, maxDistance);
        
        for (let i = 0; i < particleCount; i++) {
            const px = particles.positions[i * 3];
            const py = particles.positions[i * 3 + 1];
            const pz = particles.positions[i * 3 + 2];
            const nx = particles.normals[i * 3];
            const ny = particles.normals[i * 3 + 1];
            const nz = particles.normals[i * 3 + 2];
            
            // Get candidate neighbors from spatial hash
            const candidates = getSpatialNeighbors(spatialHash, px, py, pz, maxDistance);
            
            // Calculate distances and filter by geodesic constraint
            const neighbors = [];
            for (const j of candidates) {
                if (j <= i) continue; // Avoid duplicate connections
                
                const qx = particles.positions[j * 3];
                const qy = particles.positions[j * 3 + 1];
                const qz = particles.positions[j * 3 + 2];
                
                const dx = qx - px;
                const dy = qy - py;
                const dz = qz - pz;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist > maxDistance || dist < 0.001) continue;
                
                // Check if connection follows surface using normal vectors
                if (followsSurface(
                    px, py, pz, nx, ny, nz,
                    qx, qy, qz,
                    particles.normals[j * 3],
                    particles.normals[j * 3 + 1],
                    particles.normals[j * 3 + 2],
                    geodesicThreshold
                )) {
                    neighbors.push({ index: j, distance: dist });
                }
            }
            
            // Sort by distance and take closest neighbors
            neighbors.sort((a, b) => a.distance - b.distance);
            const topNeighbors = neighbors.slice(0, maxNeighbors);
            
            // Add connections
            for (const neighbor of topNeighbors) {
                const j = neighbor.index;
                const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
                
                if (!connectionSet.has(key)) {
                    connectionSet.add(key);
                    connections.push({
                        p1: i,
                        p2: j,
                        distance: neighbor.distance
                    });
                }
            }
        }
        
        console.log(`Generated ${connections.length} connections (${(connections.length / particleCount).toFixed(2)} per particle)`);
        
        return connections;
    }
    
    /**
     * Build spatial hash for efficient neighbor queries
     */
    function buildSpatialHash(positions, count, cellSize) {
        const hash = new Map();
        
        for (let i = 0; i < count; i++) {
            const px = positions[i * 3];
            const py = positions[i * 3 + 1];
            const pz = positions[i * 3 + 2];
            
            const cellX = Math.floor(px / cellSize);
            const cellY = Math.floor(py / cellSize);
            const cellZ = Math.floor(pz / cellSize);
            const key = `${cellX},${cellY},${cellZ}`;
            
            if (!hash.has(key)) {
                hash.set(key, []);
            }
            hash.get(key).push(i);
        }
        
        return { hash, cellSize };
    }
    
    /**
     * Get neighbors from spatial hash (including adjacent cells)
     */
    function getSpatialNeighbors(spatialHash, px, py, pz, maxDistance) {
        const { hash, cellSize } = spatialHash;
        const neighbors = [];
        
        const cellX = Math.floor(px / cellSize);
        const cellY = Math.floor(py / cellSize);
        const cellZ = Math.floor(pz / cellSize);
        
        // Check current cell and 26 adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const key = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
                    const cell = hash.get(key);
                    if (cell) {
                        neighbors.push(...cell);
                    }
                }
            }
        }
        
        return neighbors;
    }
    
    /**
     * Check if connection follows the surface using normal vectors
     * A connection follows the surface if:
     * 1. The line segment is roughly perpendicular to both normals
     * 2. The normals point in similar directions (smooth surface)
     */
    function followsSurface(px, py, pz, nx, ny, nz, qx, qy, qz, qnx, qny, qnz, threshold) {
        // Direction vector
        const dx = qx - px;
        const dy = qy - py;
        const dz = qz - pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 0.001) return false;
        
        const dirX = dx / dist;
        const dirY = dy / dist;
        const dirZ = dz / dist;
        
        // Check if direction is perpendicular to normals (dot product near 0)
        const dot1 = Math.abs(dirX * nx + dirY * ny + dirZ * nz);
        const dot2 = Math.abs(dirX * qnx + dirY * qny + dirZ * qnz);
        
        // Check normal alignment (normals should point similar direction)
        const normalDot = nx * qnx + ny * qny + nz * qnz;
        
        // Connection is on surface if:
        // - Direction is mostly perpendicular to both normals (tangent to surface)
        // - Normals are aligned (smooth surface region)
        const isPerp = (dot1 < 0.6 && dot2 < 0.6); // Threshold for perpendicularity
        const isAligned = normalDot > (1.0 / threshold); // Threshold for normal alignment
        
        return isPerp && isAligned;
    }
    
    /**
     * Build line geometry from connections
     */
    function buildLineGeometry(connections) {
        vertexCount = connections.length * 6; // 6 vertices per quad (2 triangles)
        
        const p1Data = new Float32Array(vertexCount * 3);
        const p2Data = new Float32Array(vertexCount * 3);
        const normal1Data = new Float32Array(vertexCount * 3);
        const normal2Data = new Float32Array(vertexCount * 3);
        const phase1Data = new Float32Array(vertexCount);
        const phase2Data = new Float32Array(vertexCount);
        const offsetData = new Float32Array(vertexCount * 2);
        
        let i = 0;
        let offset_i = 0;
        for (const conn of connections) {
            const p1_idx = conn.p1;
            const p2_idx = conn.p2;

            const p1 = [particles.positions[p1_idx * 3], particles.positions[p1_idx * 3 + 1], particles.positions[p1_idx * 3 + 2]];
            const p2 = [particles.positions[p2_idx * 3], particles.positions[p2_idx * 3 + 1], particles.positions[p2_idx * 3 + 2]];
            const n1 = [particles.normals[p1_idx * 3], particles.normals[p1_idx * 3 + 1], particles.normals[p1_idx * 3 + 2]];
            const n2 = [particles.normals[p2_idx * 3], particles.normals[p2_idx * 3 + 1], particles.normals[p2_idx * 3 + 2]];
            const phase1 = particles.phases[p1_idx];
            const phase2 = particles.phases[p2_idx];

            const offsets = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
            
            for (let j = 0; j < 6; j++) {
                p1Data.set(p1, i * 3);
                p2Data.set(p2, i * 3);
                normal1Data.set(n1, i * 3);
                normal2Data.set(n2, i * 3);
                phase1Data[i] = phase1;
                phase2Data[i] = phase2;
                offsetData[i * 2] = offsets[j * 2];
                offsetData[i * 2 + 1] = offsets[j * 2 + 1];
                i++;
            }
        }
        
        return { p1Data, p2Data, normal1Data, normal2Data, phase1Data, phase2Data, offsetData };
    }
    
    /**
     * Initialize connection renderer
     */
    async function init() {
        console.log('Initializing connection renderer...');
        
        // Calculate connections
        const connections = calculateConnections();
        const geometry = buildLineGeometry(connections);
        
        if (vertexCount === 0) {
            console.warn('No connections generated!');
            return;
        }
        
        // Create shader program
        program = createProgramFromSources(gl, connectionVert, connectionFrag);
        
        // Create VAO and buffers
        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
        // p1 buffer
        p1Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, p1Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.p1Data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // p2 buffer
        p2Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, p2Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.p2Data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        
        // normal1 buffer
        normal1Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normal1Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normal1Data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        // normal2 buffer
        normal2Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normal2Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.normal2Data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);
        
        // phase1 buffer
        phase1Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, phase1Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.phase1Data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0);
        
        // phase2 buffer
        phase2Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, phase2Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.phase2Data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 1, gl.FLOAT, false, 0, 0);
        
        // offset buffer
        offsetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.offsetData, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 2, gl.FLOAT, false, 0, 0);
        
        // Get uniform locations
        uniforms = {
            uModel: gl.getUniformLocation(program, 'u_model'),
            uView: gl.getUniformLocation(program, 'u_view'),
            uProjection: gl.getUniformLocation(program, 'u_projection'),
            uTime: gl.getUniformLocation(program, 'u_time'),
            uHeartCenter: gl.getUniformLocation(program, 'u_heartCenter'),
            uConnectionColor: gl.getUniformLocation(program, 'u_connectionColor'),
            uConnectionOpacity: gl.getUniformLocation(program, 'u_connectionOpacity'),
            uConnectionPulse: gl.getUniformLocation(program, 'u_connectionPulse'),
            uLineWidth: gl.getUniformLocation(program, 'u_lineWidth'),
            uResolution: gl.getUniformLocation(program, 'u_resolution')
        };
        
        console.log(`Connection renderer initialized with ${connections.length} lines`);
    }
    
    /**
     * Render connections
     * @param {number} opacityMultiplier - Opacity multiplier (0.0 to 1.0) for fade effects
     */
    function render(modelMatrix, viewMatrix, projectionMatrix, time, opacityMultiplier = 1.0) {
        if (!config.connectionsEnabled || vertexCount === 0 || !program) return;
        
        // Save current GL state
        const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM);
        
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        
        // Set uniforms - apply opacity multiplier for fade effect
        gl.uniformMatrix4fv(uniforms.uModel, false, modelMatrix);
        gl.uniformMatrix4fv(uniforms.uView, false, viewMatrix);
        gl.uniformMatrix4fv(uniforms.uProjection, false, projectionMatrix);
        gl.uniform1f(uniforms.uTime, time * config.heartRate);
        gl.uniform3f(uniforms.uHeartCenter, 0, 0, 0);
        gl.uniform3fv(uniforms.uConnectionColor, config.connectionColor);
        gl.uniform1f(uniforms.uConnectionOpacity, config.connectionOpacity * opacityMultiplier);
        gl.uniform1i(uniforms.uConnectionPulse, config.connectionPulse ? 1 : 0);
        gl.uniform1f(uniforms.uLineWidth, config.connectionLineWidth);
        gl.uniform2f(uniforms.uResolution, gl.canvas.width, gl.canvas.height);
        
        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Disable depth writing for transparent lines (but keep depth testing)
        gl.depthMask(false);
        gl.enable(gl.DEPTH_TEST);
        
        // Draw triangles
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        
        // Restore GL state for particles
        gl.depthMask(true);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    
    /**
     * Update configuration
     */
    function updateConfig(newConfig) {
        // Check if we need to rebuild connections
        const needsRebuild = 
            config.maxNeighbors !== newConfig.maxNeighbors ||
            config.connectionDistance !== newConfig.connectionDistance ||
            config.geodesicThreshold !== newConfig.geodesicThreshold;
        
        // Update config reference
        Object.assign(config, newConfig);
        
        // Rebuild if needed
        if (needsRebuild && program) {
            console.log('Connection parameters changed, rebuilding...');
            const connections = calculateConnections();
            const geometry = buildLineGeometry(connections);
            
            // Update buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, p1Buffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.p1Data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, p2Buffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.p2Data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, normal1Buffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.normal1Data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, normal2Buffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.normal2Data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, phase1Buffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.phase1Data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, phase2Buffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.phase2Data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, geometry.offsetData, gl.STATIC_DRAW);
        }
    }
    
    return {
        init,
        render,
        updateConfig
    };
}

