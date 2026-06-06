import * as THREE from 'three';

export class WavyOrbitCurve extends THREE.Curve {
    constructor(radius, amp, freq, phase) {
        super();
        this.radius = radius;
        this.amplitude = amp;
        this.frequency = freq;
        this.phase = phase;
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const angle = t * Math.PI * 2;
        const x = Math.cos(angle) * this.radius;
        const z = Math.sin(angle) * this.radius;
        const y = Math.sin(angle * this.frequency + this.phase) * this.amplitude;
        return optionalTarget.set(x, y, z);
    }
}

