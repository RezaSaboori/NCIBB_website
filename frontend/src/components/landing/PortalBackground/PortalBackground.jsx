import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import vertexShader from './shaders/portal.vert?raw';
import fragmentShader from './shaders/portal.frag?raw';

// CONFIG - changes here will update uniforms in real-time
// IMPORTANT: After changing CONFIG, save the file and refresh the browser to see changes
let CONFIG = {
    swirlSpeed: 0.05,
    smokeDensity: 0.5,  // Reduced so fog is more visible
    ringRadius: 0.1,
    ringThickness: 0.1,
    smokeColor: [1, 1, 1],
    fogStart: 0.1,  // Fog starts fading at this distance from center (0-1) - made earlier
    fogEnd: 0.6,    // Fog ends at this distance (should be > fogStart for normal behavior) - extended
    fogColor: [1, 1, 1],  // WHITE
    aberrationStrength: 0.005,
    distortionStrength: 0.01,
    distortionNoiseScale: 0.5
};

const NOISE_URL = 'https://gist.githubusercontent.com/atdr/1bd65e54a3f51cd9e2a28e4e9e189b01/raw/08d3409bba9206af9f6a24cdfd99b82cae5de095/rgba-noise-small.png';

const PortalBackground = ({ 
    videoUrl = '/landing/portal-video.mp4', 
    className, 
    style, 
    paused = false,
    size = 2, // Can be a number (uniform) or { width: number, height: number }
    position = { x: 0, y: 0, z: 0 } // Portal position in 3D space
}) => {
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const pausedRef = useRef(paused);

    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 2.5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.inset = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        containerRef.current.appendChild(renderer.domElement);

        // State for animation
        const mouse = new THREE.Vector2(0, 0);
        const targetMouse = new THREE.Vector2(0, 0);
        const clock = new THREE.Clock();
        let animationId;
        let videoTexture = null;
        let noiseTexture = null;
        let mesh = null;

        // Video setup
        const video = document.createElement('video');
        video.src = videoUrl;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.crossOrigin = 'anonymous';
        video.style.display = "none";
        document.body.appendChild(video); // Add to DOM like reference HTML

        const loader = new THREE.TextureLoader();

        const handleResize = () => {
            if (!renderer || !camera) return;
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };

        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (pausedRef.current) return;

            mouse.lerp(targetMouse, 0.045);
            if (mesh && mesh.material.uniforms) {
                mesh.material.uniforms.uMouse.value = mouse;
                mesh.material.uniforms.uTime.value = clock.getElapsedTime();
                // Update config uniforms each frame so changes take effect immediately
                mesh.material.uniforms.uAberration.value = CONFIG.aberrationStrength;
                mesh.material.uniforms.uDistortion.value = CONFIG.distortionStrength;
                mesh.material.uniforms.uDistortionScale.value = CONFIG.distortionNoiseScale;
                mesh.material.uniforms.uRingRadius.value = CONFIG.ringRadius;
                mesh.material.uniforms.uRingThickness.value = CONFIG.ringThickness;
                mesh.material.uniforms.uSwirlSpeed.value = CONFIG.swirlSpeed;
                mesh.material.uniforms.uSmokeDensity.value = CONFIG.smokeDensity;
                mesh.material.uniforms.uSmokeColor.value.set(...CONFIG.smokeColor);
                mesh.material.uniforms.uFogStart.value = CONFIG.fogStart;
                mesh.material.uniforms.uFogEnd.value = CONFIG.fogEnd;
                // Update fog color - ensure it updates by directly setting the vector components
                const fogColorVec = mesh.material.uniforms.uFogColor.value;
                if (fogColorVec) {
                    fogColorVec.x = CONFIG.fogColor[0];
                    fogColorVec.y = CONFIG.fogColor[1];
                    fogColorVec.z = CONFIG.fogColor[2];
                } else {
                    mesh.material.uniforms.uFogColor.value = new THREE.Vector3(...CONFIG.fogColor);
                }
                // Ensure video texture updates each frame
                if (videoTexture && video.readyState >= 2) {
                    videoTexture.needsUpdate = true;
                }
            }
            renderer.render(scene, camera);
        };

        const initPortal = () => {
            // Calculate portal size
            const portalWidth = typeof size === 'number' ? size : (size.width || 2);
            const portalHeight = typeof size === 'number' ? size : (size.height || 2);
            
            const fogColorVec = new THREE.Vector3(...CONFIG.fogColor);
            
            console.log('[PortalBackground] Initializing portal with fogColor:', CONFIG.fogColor);
            
            const geometry = new THREE.PlaneGeometry(portalWidth, portalHeight);
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: { value: videoTexture },
                    uNoise: { value: noiseTexture },
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uAberration: { value: CONFIG.aberrationStrength },
                    uDistortion: { value: CONFIG.distortionStrength },
                    uDistortionScale: { value: CONFIG.distortionNoiseScale },
                    uRingRadius: { value: CONFIG.ringRadius },
                    uRingThickness: { value: CONFIG.ringThickness },
                    uSwirlSpeed: { value: CONFIG.swirlSpeed },
                    uSmokeDensity: { value: CONFIG.smokeDensity },
                    uSmokeColor: { value: new THREE.Vector3(...CONFIG.smokeColor) },
                    uFogStart: { value: CONFIG.fogStart },
                    uFogEnd: { value: CONFIG.fogEnd },
                    uFogColor: { value: fogColorVec },
                },
                vertexShader,
                fragmentShader,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            mesh = new THREE.Mesh(geometry, material);
            
            console.log('[PortalBackground] Portal mesh created, material uniforms:', {
                fogColor: material.uniforms.uFogColor.value,
                fogStart: material.uniforms.uFogStart.value,
                fogEnd: material.uniforms.uFogEnd.value
            });
            
            // Set portal position
            mesh.position.x = position.x || 0;
            mesh.position.y = position.y || 0;
            mesh.position.z = position.z || 0;
            
            scene.add(mesh);
            
            setIsLoading(false);
            animate();
        };

        const onVideoCanPlay = () => {
            if (videoTexture) return; // Already initialized

            // Ensure video is playing before creating texture
            video.play().then(() => {
                videoTexture = new THREE.VideoTexture(video);
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.magFilter = THREE.LinearFilter;
                videoTexture.colorSpace = THREE.SRGBColorSpace;
                videoTexture.flipY = false; // Fix orientation
                videoTexture.generateMipmaps = false;
                videoTexture.needsUpdate = true;

                loader.load(NOISE_URL, (noiseTex) => {
                    noiseTexture = noiseTex;
                    noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
                    noiseTexture.minFilter = THREE.LinearFilter;
                    noiseTexture.magFilter = THREE.LinearFilter;
                    noiseTexture.needsUpdate = true;
                    initPortal();
                }, undefined, (err) => {
                    setError("Error loading noise texture");
                });
            }).catch(e => {
                setError(`Video play error: ${e.message}`);
            });
        };

        const onVideoError = (e) => {
             setError(`Error loading video: ${video.error ? video.error.message : 'Unknown error'}`);
        };

        video.addEventListener('canplay', onVideoCanPlay);
        video.addEventListener('error', onVideoError);
        
        // Start loading
        video.load();

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            
            if (renderer) {
                 renderer.dispose();
                 const domElement = renderer.domElement;
                 if (domElement && domElement.parentNode) {
                     domElement.parentNode.removeChild(domElement);
                 }
            }
            if (videoTexture) videoTexture.dispose();
            if (noiseTexture) noiseTexture.dispose();
            if (mesh) {
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
            
            video.removeEventListener('canplay', onVideoCanPlay);
            video.removeEventListener('error', onVideoError);
            video.pause();
            video.removeAttribute('src');
            video.load();
            if (video.parentNode) {
                video.parentNode.removeChild(video);
            }
        };
    }, [videoUrl, size, position.x, position.y, position.z]);

    return (
        <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#050505', maxWidth: '100%', ...style }}>
            {isLoading && !error && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    color: '#fff', letterSpacing: '2px', pointerEvents: 'none', zIndex: 10,
                    textTransform: 'uppercase', fontSize: '0.8rem', fontFamily: 'sans-serif'
                }}>
                    Initializing Portal...
                </div>
            )}
            {error && (
                 <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    color: '#ff0000', pointerEvents: 'none', zIndex: 10, textAlign: 'center', fontSize: '0.8rem', fontFamily: 'sans-serif'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default PortalBackground;

