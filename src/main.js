/**
 * main.js
 * Entry point aplikasi
 */

import { Game } from './core/Game.js';

// Tunggu DOM ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
        game.start();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
