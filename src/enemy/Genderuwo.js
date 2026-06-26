/**
 * Genderuwo Enemy
 * Makhluk besar dan kuat
 */

import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class Genderuwo extends BaseEnemy {
    constructor(scene, position, config = {}, eventBus) {
        super(scene, position, {
            name: 'Genderuwo',
            maxHP: 200,
            speed: 2,
            damage: 30,
            detectionRange: 8,
            attackRange: 2.0,
            attackCooldown: 1500,
            height: 2.5,
            color: 0x4a3728,
            ...config
        });
        
        this.eventBus = eventBus;
    }

    createMesh(position) {
        const group = new THREE.Group();
        
        // Body (large muscular body)
        const bodyGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a3728,
            roughness: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.75;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2718 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.7;
        group.add(head);
        
        // Red eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 2.75, 0.3);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 2.75, 0.3);
        group.add(rightEye);
        
        // Arms (large)
        const armGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-0.9, 1.8, 0);
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(0.9, 1.8, 0);
        group.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.5);
        
        const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        leftLeg.position.set(-0.4, 0.6, 0);
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        rightLeg.position.set(0.4, 0.6, 0);
        group.add(rightLeg);
        
        this.mesh = group;
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    attack() {
        // Powerful smash attack
        this.eventBus.publish('enemy:attack', {
            enemy: this,
            damage: this.damage,
            type: 'smash'
        });
    }
}
