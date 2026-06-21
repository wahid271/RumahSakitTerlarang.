/**
 * Constants.js
 * ----------------------------------
 * Berisi konstanta global, enums, dan magic numbers untuk game.
 */

// Game States
export const GAME_STATES = {
    LOADING: 'LOADING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

// Player Constants
export const PLAYER_SPEED = 5.0;
export const SPRINT_MULTIPLIER = 1.8;
export const JUMP_FORCE = 10;
export const GRAVITY = 30;

// Health & Stamina
export const MAX_HEALTH = 100;
export const MAX_STAMINA = 100;
export const STAMINA_REGEN_RATE = 15; // per second
export const STAMINA_DRAIN_RATE = 20; // per second

// Interaction
export const INTERACT_DISTANCE = 3;
