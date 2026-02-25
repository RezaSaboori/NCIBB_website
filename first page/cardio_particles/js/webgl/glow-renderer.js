import { createProgram } from './utils.js';

/**
 * Background Glow Renderer
 * Renders a radial gradient glow that follows the heart's 3D position
 */
export function createGlowRenderer(gl, config) {
    let program, uniforms, vao;
    
    /**
     * Initialize glow renderer
     */
    async function init() {
        console.log('Initializing glow renderer...');
        
        // Create shader program
        const cacheBuster = `?v=${Date.now()}`;
        program = await createProgram(
            gl,
            `../shaders/background-glow.vert${cacheBuster}`,
            `../shaders/background-glow.frag${cacheBuster}`
        );
        
        // Create VAO for fullscreen quad
        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
        // Create a simple fullscreen quad (two triangles)
        const quadVertices = new Float32Array([
            -1.0, -1.0,  // Bottom-left
             1.0, -1.0,  // Bottom-right
            -1.0,  1.0,  // Top-left
            -1.0,  1.0,  // Top-left
             1.0, -1.0,  // Bottom-right
             1.0,  1.0   // Top-right
        ]);
        
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        
        // Get uniform locations
        uniforms = {
            uHeartScreenPos: gl.getUniformLocation(program, 'u_heartScreenPos'),
            uIntensity: gl.getUniformLocation(program, 'u_intensity'),
            uRadius: gl.getUniformLocation(program, 'u_radius'),
            uFalloff: gl.getUniformLocation(program, 'u_falloff'),
            uColor: gl.getUniformLocation(program, 'u_color'),
            uResolution: gl.getUniformLocation(program, 'u_resolution')
        };
        
        console.log('Glow renderer initialized');
    }
    
    /**
     * Project 3D heart center to screen space and calculate apparent size
     */
    function projectToScreen(heartCenter, heartSize, modelMatrix, viewMatrix, projectionMatrix) {
        // Transform heart center through MVP matrices
        const pos = [heartCenter[0], heartCenter[1], heartCenter[2], 1.0];
        
        // Apply model matrix
        const modelPos = multiplyMatrixVector(modelMatrix, pos);
        
        // Apply view matrix
        const viewPos = multiplyMatrixVector(viewMatrix, modelPos);
        
        // Get depth (distance from camera)
        const depth = -viewPos[2];
        
        // Apply projection matrix
        const clipPos = multiplyMatrixVector(projectionMatrix, viewPos);
        
        // Perspective divide
        const ndcX = clipPos[0] / clipPos[3];
        const ndcY = clipPos[1] / clipPos[3];
        
        // Convert from NDC (-1 to 1) to screen space (0 to 1)
        const screenX = (ndcX + 1.0) * 0.5;
        const screenY = (ndcY + 1.0) * 0.5;
        
        // Calculate screen-space size based on perspective
        // Project a point offset from center by heartSize to get scale
        const offsetPos = [heartCenter[0] + heartSize, heartCenter[1], heartCenter[2], 1.0];
        const offsetModelPos = multiplyMatrixVector(modelMatrix, offsetPos);
        const offsetViewPos = multiplyMatrixVector(viewMatrix, offsetModelPos);
        const offsetClipPos = multiplyMatrixVector(projectionMatrix, offsetViewPos);
        const offsetNdcX = offsetClipPos[0] / offsetClipPos[3];
        const offsetScreenX = (offsetNdcX + 1.0) * 0.5;
        
        // Screen-space size is the difference
        const screenSize = Math.abs(offsetScreenX - screenX);
        
        return [screenX, screenY, screenSize, depth];
    }
    
    /**
     * Multiply 4x4 matrix by 4D vector (column-major order)
     */
    function multiplyMatrixVector(matrix, vector) {
        const result = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            result[i] = 
                matrix[0 + i] * vector[0] +
                matrix[4 + i] * vector[1] +
                matrix[8 + i] * vector[2] +
                matrix[12 + i] * vector[3];
        }
        return result;
    }
    
    /**
     * Render glow effect
     */
    function render(modelMatrix, viewMatrix, projectionMatrix, heartCenter, heartSize) {
        if (!config.glowEnabled || !program) return;
        
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        
        // Project heart center to screen space and get apparent size
        const [screenX, screenY, screenSize, depth] = projectToScreen(heartCenter, heartSize, modelMatrix, viewMatrix, projectionMatrix);
        
        // Scale radius based on heart's apparent size on screen
        // Base radius multiplied by screen size and config radius
        const scaledRadius = screenSize * config.glowRadius * 3.0;
        
        // Debug logging (only on first few frames)
        if (render.frameCount === undefined) render.frameCount = 0;
        if (render.frameCount < 3) {
            console.log('Glow render:', {
                screenPos: [screenX, screenY],
                screenSize,
                depth,
                baseRadius: config.glowRadius,
                scaledRadius,
                intensity: config.glowIntensity,
                falloff: config.glowFalloff
            });
            render.frameCount++;
        }
        
        // Set uniforms
        gl.uniform2f(uniforms.uHeartScreenPos, screenX, screenY);
        gl.uniform1f(uniforms.uIntensity, config.glowIntensity);
        gl.uniform1f(uniforms.uRadius, scaledRadius);
        gl.uniform1f(uniforms.uFalloff, config.glowFalloff);
        gl.uniform3fv(uniforms.uColor, config.glowColor);
        gl.uniform2f(uniforms.uResolution, gl.canvas.width, gl.canvas.height);
        
        // Set up blending for additive glow
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Disable depth test for fullscreen effect
        gl.disable(gl.DEPTH_TEST);
        
        // Draw fullscreen quad
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Re-enable depth test for subsequent rendering
        gl.enable(gl.DEPTH_TEST);
    }
    
    /**
     * Update configuration
     */
    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
    }
    
    return {
        init,
        render,
        updateConfig
    };
}

