/**
 * Game.js
 * ----------------------------------
 * Kelas utama untuk menginisialisasi dan menjalankan game loop.
 */

import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { Player } from '../player/Player.js';
import { EventBus } from './EventBus.js';
import { Lobby } from '../levels/Lobby.js';
import { HUD } from '../ui/HUD.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';

export class Game {
    constructor() {
        // Initialize core systems
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.FogExp2(0x050505, 0.08);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        this.clock = new THREE.Clock();
        this.eventBus = new EventBus();
        this.sceneManager = new SceneManager(this.scene);
        this.player = null;
        this.currentLevel = null;
        this.hud = null;
        this.loadingScreen = null;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Create instruction overlay
        this.createClickToStart();
    }

    createClickToStart() {
        this.clickOverlay = document.createElement('div');
        this.clickOverlay.className = 'click-to-start';
        this.clickOverlay.innerHTML = `
            <h2>RUMAH SAKIT TERLARANG</h2>
            <p>Klik untuk mulai bermain</p>
            <p style="margin-top: 15px; font-size: 0.8em;">
                WASD - Bergerak | SHIFT - Sprint | SPACE - Lompat | E - Interaksi
            </p>
        `;
        
        this.clickOverlay.addEventListener('click', () => {
            if (this.player && this.player.camera) {
                this.player.camera.controls.lock();
            }
            this.clickOverlay.style.display = 'none';
        });
        
        document.body.appendChild(this.clickOverlay);
    }

    async start() {
        try {
            // Tampilkan loading screen
            this.loadingScreen = new LoadingScreen();
            this.loadingScreen.updateProgress(10, 'Memuat sistem...');
            
            await this.delay(300);
            
            // Initialize player
            this.loadingScreen.updateProgress(30, 'Mempersiapkan player...');
            this.player = new Player(this.scene, this.renderer.domElement, this.eventBus);
            
            await this.delay(300);
            
            // Load level
            this.loadingScreen.updateProgress(60, 'Membangun Lobby...');
            try {
                this.currentLevel = new Lobby(this.scene);
                this.currentLevel.load();
            } catch (levelError) {
                console.error('Error loading level:', levelError);
                // Continue without level
            }
            
            await this.delay(300);
            
            // Initialize HUD
            this.loadingScreen.updateProgress(80, 'Menyiapkan UI...');
            try {
                this.hud = new HUD(this.eventBus);
                this.hud.updateHealth(100);
                this.hud.updateStamina(100);
            } catch (hudError) {
                console.error('Error loading HUD:', hudError);
            }
            
            await this.delay(300);
            
            this.loadingScreen.updateProgress(100, 'Selesai!');
            
            await this.delay(500);
            
            // Hide loading screen
            if (this.loadingScreen) {
                this.loadingScreen.hide();
            }
            
            // Start game loop
            this.animate();
            
            console.log('Game started successfully!');
        } catch (error) {
            console.error('Fatal error in Game.start():', error);
            // Force hide loading screen on error
            if (this.loadingScreen) {
                this.loadingScreen.hide();
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update level
        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }
        
        // Render scene
        this.renderer.render(this.scene, this.player ? this.player.camera.camera : null);
    }

    onWindowResize() {
        if (this.player && this.player.camera) {
            this.player.camera.camera.aspect = window.innerWidth / window.innerHeight;
            this.player.camera.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
