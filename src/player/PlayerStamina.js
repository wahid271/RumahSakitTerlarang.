/**
 * PlayerStamina.js
 * ----------------------------------
 * Mengelola stamina untuk sprint dan aksi lainnya.
 */

import { MAX_STAMINA, STAMINA_REGEN_RATE, STAMINA_DRAIN_RATE } from '../utils/Constants.js';

export class PlayerStamina {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.maxStamina = MAX_STAMINA;
        this.currentStamina = MAX_STAMINA;
    }

    update(deltaTime, isSprinting) {
        if (isSprinting) {
            this.consume(STAMINA_DRAIN_RATE * deltaTime);
        } else {
            this.regenerate(STAMINA_REGEN_RATE * deltaTime);
        }
    }

    consume(amount) {
        if (amount <= 0) return;
        
        this.currentStamina = Math.max(0, this.currentStamina - amount);
        this.eventBus.publish('stamina:changed', { currentStamina: this.currentStamina });
    }

    regenerate(amount) {
        if (amount <= 0) return;
        
        this.currentStamina = Math.min(this.maxStamina, this.currentStamina + amount);
        this.eventBus.publish('stamina:changed', { currentStamina: this.currentStamina });
    }

    getStaminaPercentage() {
        return (this.currentStamina / this.maxStamina) * 100;
    }

    hasStamina() {
        return this.currentStamina > 0;
    }
}
