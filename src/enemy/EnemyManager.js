/**
 * EnemyManager.js
 * ----------------------------------
 * Mengelola spawning, update, dan despawning semua musuh.
 */

import { Pocong } from './Pocong.js';
import { Kuntilanak } from './Kuntilanak.js';
import { Genderuwo } from './Genderuwo.js';
import { Tuyul } from './Tuyul.js';
import { WeweGombel } from './WeweGombel.js';
import { SundelBolong } from './SundelBolong.js';

export class EnemyManager {
    constructor(scene, eventBus) {
        this.scene = scene;
        this.eventBus = eventBus;
        this.enemies = [];
        this.enemyTypes = {
            pocong: Pocong,
            kuntilanak: Kuntilanak,
            genderuwo: Genderuwo,
            tuyul: Tuyul,
            weweGombel: WeweGombel,
            sundelBolong: SundelBolong
        };
    }

    spawnEnemy(type, position, config = {}) {
        const EnemyClass = this.enemyTypes[type];
        if (!EnemyClass) {
            console.error(`Unknown enemy type: ${type}`);
            return null;
        }
        
        const enemy = new EnemyClass(this.scene, position, config, this.eventBus);
        this.enemies.push(enemy);
        
        this.eventBus.publish('enemy:spawned', { enemy });
        
        return enemy;
    }

    spawnWave(enemyConfigs) {
        enemyConfigs.forEach(config => {
            this.spawnEnemy(config.type, config.position, config);
        });
    }

    updateAll(deltaTime, playerPosition) {
        this.enemies = this.enemies.filter(enemy => !enemy.isDead());
        
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, playerPosition);
        });
    }

    getEnemiesInRadius(position, radius) {
        return this.enemies.filter(enemy => {
            return enemy.mesh.position.distanceTo(position) <= radius;
        });
    }

    getNearestEnemy(position) {
        if (this.enemies.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const distance = enemy.mesh.position.distanceTo(position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }

    clearAll() {
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy.mesh);
        });
        this.enemies = [];
    }

    getEnemyCount() {
        return this.enemies.length;
    }
}
