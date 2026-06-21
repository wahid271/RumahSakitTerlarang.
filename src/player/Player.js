/**
 * Player.js
 * ----------------------------------
 * Entitas utama player. Menggabungkan semua komponen player.
 */

import { PlayerMovement } from './PlayerMovement.js';
import { PlayerCamera } from './PlayerCamera.js';
import { PlayerHealth } from './PlayerHealth.js';
import { PlayerStamina } from './PlayerStamina.js';
import { PlayerInteraction } from './PlayerInteraction.js';

export class Player {
    constructor(scene, domElement, eventBus) {
        this.scene = scene;
        this.domElement = domElement;
        this.eventBus = eventBus;
        
        // Initialize components
        this.camera = new PlayerCamera(domElement);
        this.movement = new PlayerMovement(this.camera.camera, domElement);
        this.health = new PlayerHealth(eventBus);
        this.stamina = new PlayerStamina(eventBus);
        this.interaction = new PlayerInteraction(this.camera.camera, scene, eventBus);
        
        // Player state
        this.isDead = false;
        
        // Subscribe to events
        this.setupEventListeners();
        
        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === domElement) {
                console.log('Game started - Pointer locked');
            } else {
                console.log('Game paused - Pointer unlocked');
            }
        });
    }

    setupEventListeners() {
        this.eventBus.subscribe('player:damaged', (data) => {
            console.log(`Player took ${data.amount} damage. HP: ${this.health.currentHP}`);
            if (this.health.isDead()) {
                this.onDeath();
            }
        });
        
        this.eventBus.subscribe('player:healed', (data) => {
            console.log(`Player healed ${data.amount}. HP: ${this.health.currentHP}`);
        });
    }

    update(deltaTime) {
        if (this.isDead) return;
        
        // Only update if pointer is locked
        if (document.pointerLockElement !== this.domElement) {
            return;
        }
        
        // Update all components
        this.movement.update(deltaTime, this.stamina);
        this.stamina.update(deltaTime, this.movement.isSprinting);
        this.interaction.update();
    }

    onDeath() {
        this.isDead = true;
        console.log('Player died!');
        this.eventBus.publish('player:death', {});
        // TODO: Trigger game over screen
    }

    getPosition() {
        return this.camera.camera.position.clone();
    }

    getRotation() {
        return this.camera.camera.rotation.clone();
    }
}
