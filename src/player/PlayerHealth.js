/**
 * PlayerHealth.js
 * ----------------------------------
 * Mengelola HP player, menerima damage, dan kondisi death.
 */

import { MAX_HEALTH } from '../utils/Constants.js';

export class PlayerHealth {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.maxHP = MAX_HEALTH;
        this.currentHP = MAX_HEALTH;
    }

    takeDamage(amount) {
        if (amount <= 0) return;
        
        this.currentHP = Math.max(0, this.currentHP - amount);
        this.eventBus.publish('player:damaged', { amount, currentHP: this.currentHP });
    }

    heal(amount) {
        if (amount <= 0) return;
        
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
        this.eventBus.publish('player:healed', { amount, currentHP: this.currentHP });
    }

    isDead() {
        return this.currentHP <= 0;
    }

    getHealthPercentage() {
        return (this.currentHP / this.maxHP) * 100;
    }
}
