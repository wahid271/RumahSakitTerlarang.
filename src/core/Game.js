/**
 * Game.js
 * ----------------------------------
 * Kelas utama untuk menginisialisasi dan menjalankan game loop.
 */

import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Player } from '../player/Player.js';
import { EventBus } from './EventBus.js';

export class Game {
    constructor() {
        // Initialize core systems
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 0, 50);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        this.clock = new THREE.Clock();
        this.eventBus = new EventBus();
        this.sceneManager = new SceneManager(this.scene);
        this.player = null;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add basic lighting for testing
        this.setupLighting();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    start() {
        // Initialize player
        this.player = new Player(this.scene, this.renderer.domElement, this.eventBus);
        
        // Add test floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Add some test objects (pillars)
        for (let i = 0; i < 10; i++) {
            const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3);
            const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.random() * 20 - 10,
                1.5,
                Math.random() * 20 - 10
            );
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
        }
        
        // Start game loop
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Render scene
        this.renderer.render(this.scene, this.player ? this.player.camera : null);
    }

    onWindowResize() {
        if (this.player && this.player.camera) {
            this.player.camera.aspect = window.innerWidth / window.innerHeight;
            this.player.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
