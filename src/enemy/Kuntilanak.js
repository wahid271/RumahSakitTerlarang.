/**
 * Kuntilanak Enemy
 * Hantu wanita yang bisa terbang dan teleport
 */

import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Kuntilanak extends BaseEnemy {
    constructor(scene, position, config = {}, eventBus) {
        super(scene, position, {
            name: 'Kuntilanak',
            maxHP: 120,
            speed: 4,
            damage: 20,
            detectionRange: 12,
            attackRange: 1.8,
            attackCooldown: 1200,
            height: 1.7,
            color: 0xffffff,
            ...config
        });
        
        this.eventBus = eventBus;
        this.isFlying = false;
        this.teleportCooldown = 0;
        this.floatingHeight = 0;
    }

    createMesh(position) {
        const group = new THREE.Group();
        
        // Body (white dress)
        const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffeedd });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        group.add(head);
        
        // Long black hair
        const hairGeometry = new THREE.CylinderGeometry(0.28, 0.3, 0.8, 8);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.6, -0.1);
        group.add(hair);
        
        this.mesh = group;
        this.mesh.position.copy(position);
        this.mesh.position.y = 0.5; // Floating
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    update(deltaTime, playerPosition) {
        // Floating animation
        this.floatingHeight += deltaTime * 2;
        this.mesh.position.y = 0.5 + Math.sin(this.floatingHeight) * 0.2;
        
        super.update(deltaTime, playerPosition);
    }

    updateChase(deltaTime) {
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        direction.y = 0;
        const distance = direction.length();
        
        // Teleport if too far
        if (distance > 8 && this.teleportCooldown <= 0) {
            this.teleport();
            this.teleportCooldown = 5000;
        }
        
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= deltaTime * 1000;
        }
        
        if (distance <= this.attackRange) {
            this.changeState(this.states.ATTACK);
        } else {
            // Fly towards player
            direction.normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
            this.mesh.lookAt(this.playerPosition.x, this.mesh.position.y, this.playerPosition.z);
        }
    }

    teleport() {
        // Teleport closer to player
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        direction.normalize();
        const teleportDistance = 5;
        this.mesh.position.add(direction.multiplyScalar(teleportDistance));
        
        // Visual effect
        this.eventBus.publish('effect:teleport', { position: this.mesh.position });
    }

    attack() {
        // Kuntilanak's scream attack
        this.eventBus.publish('enemy:attack', {
            enemy: this,
            damage: this.damage,
            type: 'scream'
        });
    }
}
