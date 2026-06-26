/**
 * Sundel Bolong Enemy
 * Hantu dengan lubang di punggung
 */

import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy.js';

export class SundelBolong extends BaseEnemy {
    constructor(scene, position, config = {}, eventBus) {
        super(scene, position, {
            name: 'Sundel Bolong',
            maxHP: 130,
            speed: 3,
            damage: 22,
            detectionRange: 11,
            attackRange: 1.7,
            attackCooldown: 1100,
            height: 1.7,
            color: 0xdddddd,
            ...config
        });
        
        this.eventBus = eventBus;
        this.showingBack = false;
    }

    createMesh(position) {
        const group = new THREE.Group();
        
        // Body (white dress)
        const bodyGeometry = new THREE.CylinderGeometry(0.45, 0.6, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdddddd,
            transparent: true,
            opacity: 0.85
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.95;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffeedd });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.9;
        group.add(head);
        
        // Long black hair
        const hairGeometry = new THREE.CylinderGeometry(0.32, 0.35, 1.0, 8);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 2.0, -0.15);
        group.add(hair);
        
        // Hole in back (visible when turned)
        const holeGeometry = new THREE.CircleGeometry(0.25, 16);
        const holeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.set(0, 1.0, -0.45);
        hole.rotation.y = Math.PI;
        group.add(hole);
        
        this.mesh = group;
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    updateChase(deltaTime) {
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        direction.y = 0;
        const distance = direction.length();
        
        // Sometimes turn back to show the hole (scare tactic)
        if (Math.random() > 0.98) {
            this.showingBack = !this.showingBack;
        }
        
        if (distance <= this.attackRange) {
            this.changeState(this.states.ATTACK);
        } else {
            direction.normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
            
            if (this.showingBack) {
                // Turn away from player
                this.mesh.lookAt(
                    this.mesh.position.x - direction.x,
                    this.mesh.position.y,
                    this.mesh.position.z - direction.z
                );
            } else {
                this.mesh.lookAt(this.playerPosition.x, this.mesh.position.y, this.playerPosition.z);
            }
        }
    }

    attack() {
        this.eventBus.publish('enemy:attack', {
            enemy: this,
            damage: this.damage
        });
    }
}
