/**
 * Game.js - Updated dengan Enemy Manager & Combat
 */

import * as THREE from 'three';
import { Player } from '../player/Player.js';
import { EventBus } from './EventBus.js';
import { Lobby } from '../levels/Lobby.js';
import { HUD } from '../ui/HUD.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { EnemyManager } from '../enemy/EnemyManager.js';
import { HitDetection } from '../combat/HitDetection.js';
import { DamageSystem } from '../combat/DamageSystem.js';

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
        this.player = null;
        this.currentLevel = null;
        this.hud = null;
        this.loadingScreen = null;
        
        // Combat & Enemy systems
        this.enemyManager = null;
        this.hitDetection = null;
        this.damageSystem = null;
        
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
                WASD - Bergerak | SHIFT - Sprint | SPACE - Lompat<br>
                E - Interaksi | KLIK - Serang | 1-4 - Ganti Senjata
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
            this.loadingScreen = new LoadingScreen();
            this.loadingScreen.updateProgress(10, 'Memuat sistem...');
            
            await this.delay(300);
            
            // Initialize player
            this.loadingScreen.updateProgress(30, 'Mempersiapkan player...');
            this.player = new Player(this.scene, this.renderer.domElement, this.eventBus);
            
            await this.delay(300);
            
            // Initialize combat systems
            this.loadingScreen.updateProgress(50, 'Menyiapkan combat system...');
            this.hitDetection = new HitDetection(this.player.camera.camera, this.scene);
            this.damageSystem = new DamageSystem(this.eventBus);
            
            await this.delay(300);
            
            // Initialize enemy manager
            this.loadingScreen.updateProgress(60, 'Membangun Lobby...');
            this.currentLevel = new Lobby(this.scene);
            this.currentLevel.load();
            
            this.enemyManager = new EnemyManager(this.scene, this.eventBus);
            this.spawnTestEnemies();
            
            await this.delay(300);
            
            // Initialize HUD
            this.loadingScreen.updateProgress(80, 'Menyiapkan UI...');
            this.hud = new HUD(this.eventBus);
            this.hud.updateHealth(100);
            this.hud.updateStamina(100);
            
            await this.delay(300);
            
            // Setup combat event listeners
            this.setupCombatListeners();
            
            this.loadingScreen.updateProgress(100, 'Selesai!');
            
            await this.delay(500);
            
            if (this.loadingScreen) {
                this.loadingScreen.hide();
            }
            
            this.animate();
            
            console.log('Game started successfully!');
        } catch (error) {
            console.error('Fatal error in Game.start():', error);
            if (this.loadingScreen) {
                this.loadingScreen.hide();
            }
        }
    }

    spawnTestEnemies() {
        // Spawn some test enemies in the lobby
        const enemyConfigs = [
            { type: 'pocong', position: new THREE.Vector3(-5, 0, -8) },
            { type: 'tuyul', position: new THREE.Vector3(6, 0, 5) },
            { type: 'kuntilanak', position: new THREE.Vector3(-7, 0, 7) },
        ];
        
        this.enemyManager.spawnWave(enemyConfigs);
    }

    setupCombatListeners() {
        // Handle player attack
        this.eventBus.subscribe('player:performAttack', (data) => {
            if (!this.enemyManager) return;
            
            const weapon = data.weapon;
            
            // Check for hits
            const hits = this.hitDetection.checkConeHit(this.enemyManager, weapon, Math.PI / 3);
            
            hits.forEach(hit => {
                const damage = this.damageSystem.calculateDamage(weapon, {
                    enemy: hit.enemy,
                    hitPoint: hit.enemy.mesh.position.clone()
                });
                
                this.damageSystem.applyDamage(
                    hit.enemy,
                    damage,
                    weapon.knockback
                );
                
                console.log(`Hit ${hit.enemy.config.name} for ${damage} damage!`);
            });
            
            if (hits.length > 0) {
                this.eventBus.publish('combat:hitConfirmed', { hits });
            }
        });
        
        // Handle enemy attacks on player
        this.eventBus.subscribe('enemy:attack', (data) => {
            const distance = this.player.getPosition().distanceTo(data.enemy.getPosition());
            
            if (distance <= data.enemy.attackRange) {
                this.player.health.takeDamage(data.damage);
                this.hud.updateHealth(this.player.health.currentHP);
            }
        });
        
        // Enemy died
        this.eventBus.subscribe('enemy:died', (data) => {
            console.log(`${data.enemy.config.name} died!`);
            this.hud.setObjective(`Musuh tersisa: ${this.enemyManager.getEnemyCount()}`);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.enemyManager);
        }
        
        // Update enemies
        if (this.enemyManager && this.player) {
            this.enemyManager.updateAll(deltaTime, this.player.getPosition());
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
