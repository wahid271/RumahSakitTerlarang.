/**
 * Pocong Enemy
 * Hantu pocong yang melompat-lompat
 */

import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Pocong extends BaseEnemy {
    constructor(scene, position, config = {}, eventBus) {
        super(scene, position, {
            name: 'Pocong',
            maxHP: 80,
            speed: 3,
            damage: 15,
            detectionRange: 10,
            attackRange: 1.5,
            attackCooldown: 1000,
            height: 1.6,
            color: 0xeeeeee,
            ...config
        });
        
        this.eventBus = eventBus;
        this.jumpVelocity = 0;
        this.isJumping = false;
    }

    createMesh(position) {
        const group = new THREE.Group();
        
        // Body (pocong wrapped in shroud)
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee,
            roughness: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        group.add(body);
        
        // Face (dark area)
        const faceGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const faceMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111 
        });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 1.3, 0.2);
        group.add(face);
        
        // Rope binding
        const ropeGeometry = new THREE.TorusGeometry(0.42, 0.05, 4, 16);
        const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        
        const rope1 = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope1.rotation.x = Math.PI / 2;
        rope1.position.y = 0.5;
        group.add(rope1);
        
        const rope2 = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope2.rotation.x = Math.PI / 2;
        rope2.position.y = 1.1;
        group.add(rope2);
        
        this.mesh = group;
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    updateChase(deltaTime) {
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        direction.y = 0;
        const distance = direction.length();
        
        if (distance <= this.attackRange) {
            this.changeState(this.states.ATTACK);
        } else {
            // Pocong hops instead of walking
            this.jumpVelocity += -20 * deltaTime;
            this.mesh.position.y += this.jumpVelocity * deltaTime;
            
            if (this.mesh.position.y <= 0) {
                this.mesh.position.y = 0;
                this.jumpVelocity = 4 + Math.random() * 2;
            }
            
            direction.normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
            this.mesh.lookAt(this.playerPosition.x, this.mesh.position.y, this.playerPosition.z);
        }
    }

    attack() {
        this.eventBus.publish('enemy:attack', {
            enemy: this,
            damage: this.damage
        });
    }

    onStateEnter(state) {
        if (state === this.states.CHASE) {
            // Play spooky sound
            this.eventBus.publish('audio:play', { sound: 'pocong_scream' });
        }
    }
}
