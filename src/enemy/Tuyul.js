/**
 * Tuyul Enemy
 * Makhluk kecil yang cepat dan licik
 */

import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Tuyul extends BaseEnemy {
    constructor(scene, position, config = {}, eventBus) {
        super(scene, position, {
            name: 'Tuyul',
            maxHP: 50,
            speed: 5,
            damage: 10,
            detectionRange: 6,
            attackRange: 1.2,
            attackCooldown: 800,
            height: 0.8,
            color: 0x2d5016,
            ...config
        });
        
        this.eventBus = eventBus;
    }

    createMesh(position) {
        const group = new THREE.Group();
        
        // Body (small green creature)
        const bodyGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d5016,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        group.add(body);
        
        // Head (bald)
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x3d6026 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.9;
        group.add(head);
        
        // Big eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.95, 0.25);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.95, 0.25);
        group.add(rightEye);
        
        this.mesh = group;
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    updateChase(deltaTime) {
        // Tuyul is fast but erratic
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        direction.y = 0;
        const distance = direction.length();
        
        if (distance <= this.attackRange) {
            this.changeState(this.states.ATTACK);
        } else {
            // Add some randomness to movement
            direction.normalize();
            const randomAngle = (Math.random() - 0.5) * 0.5;
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), randomAngle);
            
            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
            this.mesh.lookAt(this.playerPosition.x, this.mesh.position.y, this.playerPosition.z);
        }
    }

    attack() {
        // Quick bite attack
        this.eventBus.publish('enemy:attack', {
            enemy: this,
            damage: this.damage,
            type: 'bite'
        });
    }
}
