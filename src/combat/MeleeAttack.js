/**
 * MeleeAttack.js
 * ----------------------------------
 * Menangani animasi ayunan senjata dan cooldown.
 */

import * as THREE from 'three';

export class MeleeAttack {
    constructor(weaponGroup, eventBus) {
        this.weaponGroup = weaponGroup;
        this.eventBus = eventBus;
        
        this.isAttacking = false;
        this.attackProgress = 0;
        this.attackPhase = 0; // 0: windup, 1: swing, 2: return
        this.currentWeapon = null;
        
        this.swingAngle = Math.PI / 2;
        this.swingSpeed = 1.0;
    }

    attack(weapon) {
        if (this.isAttacking) return false;
        
        this.isAttacking = true;
        this.attackProgress = 0;
        this.attackPhase = 0;
        this.currentWeapon = weapon;
        this.swingSpeed = weapon.swingSpeed;
        
        // Publish attack start event
        this.eventBus.publish('combat:attackStart', { weapon });
        
        return true;
    }

    update(deltaTime) {
        if (!this.isAttacking) return;
        
        this.attackProgress += deltaTime * this.swingSpeed;
        
        switch (this.attackPhase) {
            case 0: // Windup
                this.windUp();
                if (this.attackProgress > 0.2) {
                    this.attackPhase = 1;
                    this.attackProgress = 0;
                    // Hit detection happens here
                    this.eventBus.publish('combat:hitCheck', { 
                        weapon: this.currentWeapon 
                    });
                }
                break;
                
            case 1: // Swing
                this.swing();
                if (this.attackProgress > 0.3) {
                    this.attackPhase = 2;
                    this.attackProgress = 0;
                }
                break;
                
            case 2: // Return
                this.returnToPosition();
                if (this.attackProgress > 0.3) {
                    this.finishAttack();
                }
                break;
        }
    }

    windUp() {
        // Pull weapon back
        const t = this.attackProgress / 0.2;
        this.weaponGroup.rotation.z = THREE.MathUtils.lerp(0, -0.5, t);
        this.weaponGroup.rotation.x = THREE.MathUtils.lerp(0, -0.3, t);
    }

    swing() {
        // Swing forward and across
        const t = this.attackProgress / 0.3;
        this.weaponGroup.rotation.z = THREE.MathUtils.lerp(-0.5, 1.0, t);
        this.weaponGroup.rotation.x = THREE.MathUtils.lerp(-0.3, 0.5, t);
    }

    returnToPosition() {
        // Return to resting position
        const t = this.attackProgress / 0.3;
        this.weaponGroup.rotation.z = THREE.MathUtils.lerp(1.0, 0, t);
        this.weaponGroup.rotation.x = THREE.MathUtils.lerp(0.5, 0, t);
    }

    finishAttack() {
        this.isAttacking = false;
        this.attackProgress = 0;
        this.attackPhase = 0;
        this.weaponGroup.rotation.set(0, 0, 0);
        this.currentWeapon = null;
        
        this.eventBus.publish('combat:attackEnd', {});
    }

    isSwinging() {
        return this.isAttacking;
    }

    getAttackProgress() {
        return this.attackProgress;
    }
}
