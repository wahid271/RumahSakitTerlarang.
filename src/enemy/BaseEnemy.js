/**
 * BaseEnemy.js
 * ----------------------------------
 * Kelas dasar untuk semua musuh dengan state machine AI.
 */

import * as THREE from 'three';

export class BaseEnemy {
    constructor(scene, position, config) {
        this.scene = scene;
        this.config = config;
        
        // Stats
        this.maxHP = config.maxHP || 100;
        this.currentHP = this.maxHP;
        this.speed = config.speed || 2;
        this.damage = config.damage || 10;
        this.detectionRange = config.detectionRange || 8;
        this.attackRange = config.attackRange || 1.5;
        this.height = config.height || 1.8;
        
        // State machine
        this.states = {
            IDLE: 'idle',
            PATROL: 'patrol',
            CHASE: 'chase',
            ATTACK: 'attack',
            RETURN: 'return'
        };
        this.currentState = this.states.IDLE;
        this.previousState = null;
        
        // Position & movement
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.playerPosition = new THREE.Vector3();
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.patrolWaitTime = 0;
        
        // AI timers
        this.attackCooldown = 0;
        this.detectionTimer = 0;
        
        // Create mesh (override in child classes)
        this.createMesh(position);
    }

    createMesh(position) {
        // Default: simple box
        const geometry = new THREE.BoxGeometry(0.6, this.height, 0.6);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.config.color || 0x888888 
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    update(deltaTime, playerPosition) {
        this.playerPosition.copy(playerPosition);
        
        // Update timers
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime * 1000;
        }
        
        // State machine
        switch (this.currentState) {
            case this.states.IDLE:
                this.updateIdle(deltaTime);
                break;
            case this.states.PATROL:
                this.updatePatrol(deltaTime);
                break;
            case this.states.CHASE:
                this.updateChase(deltaTime);
                break;
            case this.states.ATTACK:
                this.updateAttack(deltaTime);
                break;
            case this.states.RETURN:
                this.updateReturn(deltaTime);
                break;
        }
        
        // Check if player is in range
        this.checkPlayerDetection();
    }

    updateIdle(deltaTime) {
        this.detectionTimer += deltaTime;
        
        // Randomly switch to patrol
        if (this.detectionTimer > 3 && Math.random() > 0.7) {
            this.changeState(this.states.PATROL);
        }
    }

    updatePatrol(deltaTime) {
        if (this.patrolPoints.length === 0) {
            this.changeState(this.states.IDLE);
            return;
        }
        
        const targetPoint = this.patrolPoints[this.currentPatrolIndex];
        const direction = new THREE.Vector3().subVectors(targetPoint, this.mesh.position);
        direction.y = 0;
        const distance = direction.length();
        
        if (distance < 0.5) {
            // Wait at patrol point
            this.patrolWaitTime += deltaTime;
            if (this.patrolWaitTime > 2) {
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
                this.patrolWaitTime = 0;
            }
        } else {
            // Move to patrol point
            direction.normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed * 0.5 * deltaTime));
            this.mesh.lookAt(targetPoint.x, this.mesh.position.y, targetPoint.z);
        }
    }

    updateChase(deltaTime) {
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        direction.y = 0;
        const distance = direction.length();
        
        if (distance <= this.attackRange) {
            this.changeState(this.states.ATTACK);
        } else {
            // Chase player
            direction.normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
            this.mesh.lookAt(this.playerPosition.x, this.mesh.position.y, this.playerPosition.z);
        }
    }

    updateAttack(deltaTime) {
        if (this.attackCooldown <= 0) {
            // Attack player
            this.attack();
            this.attackCooldown = this.config.attackCooldown || 1500;
        }
        
        // Check if player is still in range
        const distance = this.mesh.position.distanceTo(this.playerPosition);
        if (distance > this.attackRange * 1.5) {
            this.changeState(this.states.CHASE);
        }
    }

    updateReturn(deltaTime) {
        const spawnPoint = this.mesh.position.clone();
        const direction = new THREE.Vector3().subVectors(spawnPoint, this.mesh.position);
        const distance = direction.length();
        
        if (distance < 1) {
            this.changeState(this.states.IDLE);
        } else {
            direction.normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed * deltaTime));
        }
    }

    checkPlayerDetection() {
        const distance = this.mesh.position.distanceTo(this.playerPosition);
        
        if (distance <= this.detectionRange) {
            // Check line of sight
            if (this.hasLineOfSight()) {
                if (this.currentState !== this.states.ATTACK) {
                    this.changeState(this.states.CHASE);
                }
            }
        } else if (this.currentState === this.states.CHASE && distance > this.detectionRange * 1.5) {
            this.changeState(this.states.RETURN);
        }
    }

    hasLineOfSight() {
        // Simple raycast check (can be enhanced with obstacle detection)
        const direction = new THREE.Vector3().subVectors(this.playerPosition, this.mesh.position);
        const distance = direction.length();
        direction.normalize();
        
        // For now, assume clear line of sight if in range
        return true;
    }

    changeState(newState) {
        if (this.currentState === newState) return;
        
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // State entry actions
        this.onStateEnter(newState);
    }

    onStateEnter(state) {
        // Override in child classes
    }

    attack() {
        // Override in child classes
        console.log(`${this.config.name} attacks!`);
    }

    takeDamage(amount) {
        this.currentHP -= amount;
        
        // Flash red
        if (this.mesh) {
            const originalColor = this.mesh.material.color.getHex();
            this.mesh.material.color.setHex(0xff0000);
            setTimeout(() => {
                if (this.mesh) {
                    this.mesh.material.color.setHex(originalColor);
                }
            }, 100);
        }
        
        if (this.currentHP <= 0) {
            this.die();
        }
    }

    die() {
        this.eventBus.publish('enemy:died', { enemy: this });
        this.scene.remove(this.mesh);
    }

    setPatrolPoints(points) {
        this.patrolPoints = points;
        if (this.currentState === this.states.IDLE) {
            this.changeState(this.states.PATROL);
        }
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    isDead() {
        return this.currentHP <= 0;
    }
}
