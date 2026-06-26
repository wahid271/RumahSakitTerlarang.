/**
 * WeaponSystem.js
 * ----------------------------------
 * Mengelola senjata melee yang bisa digunakan player.
 */

import * as THREE from 'three';
import { MeleeAttack } from './MeleeAttack.js';

export class WeaponSystem {
    constructor(camera, eventBus) {
        this.camera = camera;
        this.eventBus = eventBus;
        this.currentWeapon = null;
        this.weapons = {};
        this.weaponGroup = new THREE.Group();
        this.camera.add(this.weaponGroup);
        
        // Position weapon in front of camera
        this.weaponGroup.position.set(0.3, -0.3, -0.5);
        
        // Initialize melee attack system
        this.meleeAttack = new MeleeAttack(this.weaponGroup, eventBus);
        
        // Create default weapons
        this.createWeapons();
    }

    createWeapons() {
        // Wooden Stick (Kayu)
        this.weapons.stick = this.createStick();
        
        // Iron Pipe (Pipa Besi)
        this.weapons.pipe = this.createPipe();
        
        // Hammer (Palu)
        this.weapons.hammer = this.createHammer();
        
        // Bat (Tongkat Baseball)
        this.weapons.bat = this.createBat();
        
        // Equip stick by default
        this.equipWeapon('stick');
    }

    createStick() {
        const group = new THREE.Group();
        
        // Stick body
        const geometry = new THREE.CylinderGeometry(0.03, 0.04, 1.2, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4a3728,
            roughness: 0.9 
        });
        const stick = new THREE.Mesh(geometry, material);
        stick.rotation.x = Math.PI / 4;
        stick.position.y = 0.3;
        group.add(stick);
        
        return {
            mesh: group,
            name: 'stick',
            damage: 15,
            range: 2.5,
            cooldown: 500, // ms
            swingSpeed: 1.2,
            knockback: 5
        };
    }

    createPipe() {
        const group = new THREE.Group();
        
        // Pipe body
        const geometry = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            metalness: 0.8,
            roughness: 0.3 
        });
        const pipe = new THREE.Mesh(geometry, material);
        pipe.rotation.x = Math.PI / 4;
        pipe.position.y = 0.3;
        group.add(pipe);
        
        return {
            mesh: group,
            name: 'pipe',
            damage: 25,
            range: 2.0,
            cooldown: 600,
            swingSpeed: 1.0,
            knockback: 7
        };
    }

    createHammer() {
        const group = new THREE.Group();
        
        // Handle
        const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.x = Math.PI / 4;
        handle.position.y = 0.2;
        group.add(handle);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.2, 0.15, 0.25);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.9,
            roughness: 0.4 
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0.5, 0);
        group.add(head);
        
        return {
            mesh: group,
            name: 'hammer',
            damage: 35,
            range: 1.8,
            cooldown: 800,
            swingSpeed: 0.8,
            knockback: 10
        };
    }

    createBat() {
        const group = new THREE.Group();
        
        // Bat body (tapered)
        const geometry = new THREE.CylinderGeometry(0.04, 0.06, 1.3, 12);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x6b4423,
            roughness: 0.7 
        });
        const bat = new THREE.Mesh(geometry, material);
        bat.rotation.x = Math.PI / 4;
        bat.position.y = 0.35;
        group.add(bat);
        
        return {
            mesh: group,
            name: 'bat',
            damage: 20,
            range: 2.8,
            cooldown: 550,
            swingSpeed: 1.3,
            knockback: 6
        };
    }

    equipWeapon(weaponName) {
        if (this.weapons[weaponName]) {
            // Hide all weapons
            Object.values(this.weapons).forEach(weapon => {
                weapon.mesh.visible = false;
            });
            
            // Show and equip selected weapon
            this.currentWeapon = this.weapons[weaponName];
            this.currentWeapon.mesh.visible = true;
            
            this.eventBus.publish('weapon:equipped', { 
                weapon: this.currentWeapon 
            });
        }
    }

    attack() {
        if (this.currentWeapon) {
            return this.meleeAttack.attack(this.currentWeapon);
        }
        return false;
    }

    update(deltaTime) {
        if (this.currentWeapon) {
            this.meleeAttack.update(deltaTime);
        }
    }

    getCurrentWeapon() {
        return this.currentWeapon;
    }

    switchToNextWeapon() {
        const weaponNames = Object.keys(this.weapons);
        const currentIndex = weaponNames.indexOf(this.currentWeapon.name);
        const nextIndex = (currentIndex + 1) % weaponNames.length;
        this.equipWeapon(weaponNames[nextIndex]);
    }

    switchToPreviousWeapon() {
        const weaponNames = Object.keys(this.weapons);
        const currentIndex = weaponNames.indexOf(this.currentWeapon.name);
        const prevIndex = (currentIndex - 1 + weaponNames.length) % weaponNames.length;
        this.equipWeapon(weaponNames[prevIndex]);
    }
}
