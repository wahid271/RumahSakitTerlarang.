/**
 * DamageSystem.js
 * ----------------------------------
 * Menghitung dan mengaplikasikan damage ke enemy.
 */

export class DamageSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.damageModifiers = {
            headshot: 2.0,
            body: 1.0,
            limb: 0.7
        };
    }

    calculateDamage(weapon, hitInfo) {
        let damage = weapon.damage;
        
        // Check for headshot (if hit point is high)
        if (hitInfo.enemy && hitInfo.hitPoint) {
            const enemyHeight = hitInfo.enemy.height || 1.8;
            const headHeight = enemyHeight * 0.85;
            
            if (hitInfo.hitPoint.y > headHeight) {
                damage *= this.damageModifiers.headshot;
                this.eventBus.publish('combat:headshot', { enemy: hitInfo.enemy });
            }
        }
        
        // Random variance (±10%)
        const variance = 0.9 + Math.random() * 0.2;
        damage *= variance;
        
        return Math.floor(damage);
    }

    applyDamage(enemy, damage, knockbackForce) {
        if (!enemy) return;
        
        // Apply damage to enemy
        enemy.takeDamage(damage);
        
        // Apply knockback
        if (knockbackForce && enemy.mesh) {
            this.applyKnockback(enemy, knockbackForce);
        }
        
        // Publish damage event
        this.eventBus.publish('enemy:damaged', {
            enemy: enemy,
            damage: damage
        });
    }

    applyKnockback(enemy, force) {
        if (!enemy.mesh) return;
        
        // Calculate knockback direction (away from player)
        const knockbackDirection = new THREE.Vector3();
        knockbackDirection.subVectors(enemy.mesh.position, enemy.playerPosition || new THREE.Vector3(0, 0, 0));
        knockbackDirection.normalize();
        knockbackDirection.y = 0.3; // Slight upward
        
        // Apply knockback velocity
        if (enemy.applyKnockback) {
            enemy.applyKnockback(knockbackDirection.multiplyScalar(force));
        }
    }

    // Critical hit chance
    checkCriticalHit(critChance = 0.1) {
        return Math.random() < critChance;
    }
}
