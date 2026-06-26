/**
 * HitDetection.js
 * ----------------------------------
 * Raycasting untuk mendeteksi hit pada enemy.
 */

import * as THREE from 'three';

export class HitDetection {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.hitDistance = 3;
    }

    checkHit(enemyManager, weapon) {
        const range = weapon.range || 2.5;
        
        // Get camera direction
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        // Create ray from camera
        this.raycaster.set(
            this.camera.position,
            direction
        );
        
        // Get all enemy meshes
        const enemyMeshes = [];
        if (enemyManager && enemyManager.enemies) {
            enemyManager.enemies.forEach(enemy => {
                if (enemy.mesh) {
                    enemyMeshes.push(enemy.mesh);
                    // Also add child meshes
                    enemy.mesh.traverse((child) => {
                        if (child.isMesh) {
                            enemyMeshes.push(child);
                        }
                    });
                }
            });
        }
        
        // Check intersections
        const intersects = this.raycaster.intersectObjects(enemyMeshes, true);
        
        if (intersects.length > 0 && intersects[0].distance <= range) {
            // Find which enemy was hit
            const hitObject = intersects[0].object;
            const hitPoint = intersects[0].point;
            
            // Find parent enemy
            let hitEnemy = null;
            if (enemyManager && enemyManager.enemies) {
                hitEnemy = enemyManager.enemies.find(enemy => {
                    return enemy.mesh === hitObject || 
                           (enemy.mesh && hitObject.parent === enemy.mesh);
                });
            }
            
            if (hitEnemy) {
                return {
                    success: true,
                    enemy: hitEnemy,
                    hitPoint: hitPoint,
                    distance: intersects[0].distance
                };
            }
        }
        
        return { success: false };
    }

    // Cone-based hit detection (wider swing arc)
    checkConeHit(enemyManager, weapon, coneAngle = Math.PI / 4) {
        const range = weapon.range || 2.5;
        const hits = [];
        
        if (!enemyManager || !enemyManager.enemies) return hits;
        
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        
        enemyManager.enemies.forEach(enemy => {
            if (!enemy.mesh) return;
            
            const enemyPosition = enemy.mesh.position.clone();
            enemyPosition.y += 1; // Aim at center of enemy
            
            const toEnemy = new THREE.Vector3().subVectors(enemyPosition, this.camera.position);
            const distance = toEnemy.length();
            
            if (distance <= range) {
                toEnemy.normalize();
                const angle = cameraDirection.angleTo(toEnemy);
                
                if (angle < coneAngle / 2) {
                    hits.push({
                        enemy: enemy,
                        distance: distance,
                        angle: angle
                    });
                }
            }
        });
        
        // Sort by distance (closest first)
        hits.sort((a, b) => a.distance - b.distance);
        
        return hits;
    }
}
