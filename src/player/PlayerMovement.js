/**
 * PlayerMovement.js
 * ----------------------------------
 * Menangani input WASD, sprint, jump, dan fisika dasar player.
 */

import * as THREE from 'three';
import { PLAYER_SPEED, SPRINT_MULTIPLIER, JUMP_FORCE, GRAVITY } from '../utils/Constants.js';

export class PlayerMovement {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Movement state
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isSprinting = false;
        
        // Physics
        this.prevTime = performance.now();
        
        // Input listeners
        this.setupInputListeners();
    }

    setupInputListeners() {
        // Keyboard input
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
            case 'Space':
                if (this.canJump) {
                    this.velocity.y += JUMP_FORCE;
                    this.canJump = false;
                }
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.isSprinting = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.isSprinting = false;
                break;
        }
    }

    update(deltaTime, stamina) {
        const time = performance.now();
        const delta = (time - this.prevTime) / 1000;
        this.prevTime = time;
        
        // Apply gravity
        this.velocity.y -= GRAVITY * delta;
        
        // Calculate movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Calculate speed
        let speed = PLAYER_SPEED;
        if (this.isSprinting && stamina.currentStamina > 0 && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)) {
            speed *= SPRINT_MULTIPLIER;
        }
        
        // Apply movement
        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * speed * delta * 10;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * speed * delta * 10;
        }
        
        // Apply friction
        this.velocity.x *= 0.85;
        this.velocity.z *= 0.85;
        
        // Move camera
        this.camera.translateX(this.velocity.x * delta);
        this.camera.translateZ(this.velocity.z * delta);
        this.camera.position.y += this.velocity.y * delta;
        
        // Ground check (simplified - in real game use raycasting)
        if (this.camera.position.y < 1.6) {
            this.velocity.y = 0;
            this.camera.position.y = 1.6;
            this.canJump = true;
        }
    }
}
