/**
 * PlayerCamera.js
 * ----------------------------------
 * Mengelola kamera first-person dan Pointer Lock Controls.
 */

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class PlayerCamera {
    constructor(domElement) {
        this.domElement = domElement;
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 5);
        
        // Setup pointer lock controls
        this.controls = new PointerLockControls(this.camera, domElement);
        
        // Click to lock pointer
        this.domElement.addEventListener('click', () => {
            this.controls.lock();
        });
        
        // Handle lock/unlock events
        this.controls.addEventListener('lock', () => {
            console.log('Pointer locked');
        });
        
        this.controls.addEventListener('unlock', () => {
            console.log('Pointer unlocked');
        });
    }

    update() {
        // Camera is updated automatically by PointerLockControls
    }

    getCamera() {
        return this.camera;
    }
}
