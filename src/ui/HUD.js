/**
 * HUD.js
 * ----------------------------------
 * Menampilkan Health, Stamina, Crosshair, dan Objective di layar.
 * Tema: Minimalis horror dengan warna merah dan putih pudar.
 */

export class HUD {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentHP = 100;
        this.currentStamina = 100;
        this.objective = 'Cari jalan keluar dari Lobby';
        
        this.createHUD();
        this.setupEventListeners();
    }
    
createHUD() {
    // Container utama HUD
    this.hudContainer = document.createElement('div');
    this.hudContainer.className = 'hud-container';
    this.hudContainer.innerHTML = `
        <!-- Crosshair -->
        <div class="crosshair"></div>
        
        <!-- Health Bar -->
        <div class="health-container">
            <div class="hud-label">HP</div>
            <div class="bar-container">
                <div class="bar-fill health-fill" id="health-fill"></div>
            </div>
            <div class="bar-value" id="health-value">100</div>
        </div>
        
        <!-- Stamina Bar -->
        <div class="stamina-container">
            <div class="hud-label">STAMINA</div>
            <div class="bar-container">
                <div class="bar-fill stamina-fill" id="stamina-fill"></div>
            </div>
            <div class="bar-value" id="stamina-value">100</div>
        </div>
        
        <!-- Objective -->
        <div class="objective-container">
            <div class="objective-label">📋 OBJECTIVE</div>
            <div class="objective-text" id="objective-text">${this.objective}</div>
        </div>
        
        <!-- Interaction Prompt -->
        <div class="interaction-prompt" id="interaction-prompt" style="display: none;">
            [E] Interact
        </div>
    `;
    
    document.body.appendChild(this.hudContainer);
}
   

    setupEventListeners() {
        this.eventBus.subscribe('player:damaged', (data) => {
            this.updateHealth(data.currentHP);
        });
        
        this.eventBus.subscribe('player:healed', (data) => {
            this.updateHealth(data.currentHP);
        });
        
        this.eventBus.subscribe('stamina:changed', (data) => {
            this.updateStamina(data.currentStamina);
        });
    }

    updateHealth(hp) {
        this.currentHP = hp;
        const fill = document.getElementById('health-fill');
        const value = document.getElementById('health-value');
        
        if (fill) fill.style.width = `${hp}%`;
        if (value) value.textContent = Math.floor(hp);
        
        // Efek layar merah saat HP rendah
        if (hp < 30) {
            this.hudContainer.classList.add('low-health');
        } else {
            this.hudContainer.classList.remove('low-health');
        }
    }

    updateStamina(stamina) {
        this.currentStamina = stamina;
        const fill = document.getElementById('stamina-fill');
        const value = document.getElementById('stamina-value');
        
        if (fill) fill.style.width = `${stamina}%`;
        if (value) value.textContent = Math.floor(stamina);
    }

    setObjective(text) {
        this.objective = text;
        const objText = document.getElementById('objective-text');
        if (objText) objText.textContent = text;
    }

    showInteractionPrompt(show) {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.style.display = show ? 'block' : 'none';
        }
    }

    hide() {
        if (this.hudContainer) {
            this.hudContainer.style.display = 'none';
        }
    }

    show() {
        if (this.hudContainer) {
            this.hudContainer.style.display = 'block';
        }
    }

    destroy() {
        if (this.hudContainer && this.hudContainer.parentNode) {
            this.hudContainer.parentNode.removeChild(this.hudContainer);
        }
    }
}
