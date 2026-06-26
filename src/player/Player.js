/**
 * Player.js - Updated
 */

import { PlayerMovement } from './PlayerMovement.js';
import { PlayerCamera } from './PlayerCamera.js';
import { PlayerHealth } from './PlayerHealth.js';
import { PlayerStamina } from './PlayerStamina.js';
import { PlayerInteraction } from './PlayerInteraction.js';
import { WeaponSystem } from '../combat/WeaponSystem.js';

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
        
        // Combat system
        this.weaponSystem = new WeaponSystem(this.camera.camera, eventBus);
        
        // Player state
        this.isDead = false;
        
        // Setup input for combat
        this.setupCombatInput();
        
        // Subscribe to events
        this.setupEventListeners();
        
        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === domElement) {
                console.log('Game started - Pointer locked');
            }
        });
    }

    setupCombatInput() {
        // Left click to attack
        this.domElement.addEventListener('mousedown', (event) => {
            if (event.button === 0 && document.pointerLockElement === this.domElement) {
                this.weaponSystem.attack();
            }
        });
        
        // Number keys to switch weapons
        document.addEventListener('keydown', (event) => {
            if (!document.pointerLockElement === this.domElement) return;
            
            switch(event.key) {
                case '1':
                    this.weaponSystem.equipWeapon('stick');
                    break;
                case '2':
                    this.weaponSystem.equipWeapon('pipe');
                    break;
                case '3':
                    this.weaponSystem.equipWeapon('bat');
                    break;
                case '4':
                    this.weaponSystem.equipWeapon('hammer');
                    break;
                case 'Tab':
                    event.preventDefault();
                    this.weaponSystem.switchToNextWeapon();
                    break;
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
        
        // Combat events
        this.eventBus.subscribe('combat:hitCheck', (data) => {
            this.onHitCheck(data.weapon);
        });
    }

    onHitCheck(weapon) {
        // This will be called from Game.js with enemyManager
        this.eventBus.publish('player:performAttack', { weapon });
    }

    update(deltaTime, enemyManager) {
        if (this.isDead) return;
        
        if (document.pointerLockElement !== this.domElement) {
            return;
        }
        
        // Update all components
        this.movement.update(deltaTime, this.stamina);
        this.stamina.update(deltaTime, this.movement.isSprinting);
        this.interaction.update();
        this.weaponSystem.update(deltaTime);
    }

    onDeath() {
        this.isDead = true;
        console.log('Player died!');
        this.eventBus.publish('player:death', {});
    }

    getPosition() {
        return this.camera.camera.position.clone();
    }

    getRotation() {
        return this.camera.camera.rotation.clone();
    }
}
