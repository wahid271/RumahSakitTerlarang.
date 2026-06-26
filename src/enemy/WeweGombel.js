/**
 * Wewe Gombel Enemy
 * Hantu wanita yang menculik anak-anak
 */

import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class WeweGombel extends BaseEnemy {
    constructor(scene, position, config = {}, eventBus) {
        super(scene, position, {
            name: 'Wewe Gombel',
            maxHP: 150,
            speed: 3.5,
            damage: 25,
            detectionRange: 10,
            attackRange: 1.6,
            attackCooldown: 1300,
            height: 2.0,
            color: 0x2a2a2a,
            ...config
        });
        
        this.eventBus = eventBus;
    }

    createMesh(position) {
        const group = new THREE.Group();
        
        // Body (dark figure with hanging breasts - simplified)
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.6, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2;
        group.add(head);
        
        // Glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 0.5
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 2.25, 0.3);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 2.25, 0.3);
        group.add(rightEye);
        
        // Long messy hair
        const hairGeometry = new THREE.ConeGeometry(0.4, 0.8, 8);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 2.4, -0.2);
        group.add(hair);
        
        this.mesh = group;
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    attack() {
        this.eventBus.publish('enemy:attack', {
            enemy: this,
            damage: this.damage
        });
    }
}
