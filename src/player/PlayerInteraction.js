/**
 * PlayerInteraction.js
 * ----------------------------------
 * Raycasting untuk interaksi dengan objek lingkungan (pintu, item, dll).
 */

import * as THREE from 'three';

export class PlayerInteraction {
    constructor(camera, scene, eventBus) {
        this.camera = camera;
        this.scene = scene;
        this.eventBus = eventBus;
        
        this.raycaster = new THREE.Raycaster();
        this.interactDistance = 3;
        this.interactableObjects = [];
        
        // Setup interaction input
        document.addEventListener('keypress', (event) => {
            if (event.code === 'KeyE') {
                this.interact();
            }
        });
    }

    update() {
        // Update raycaster from camera center
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Check for interactable objects in range
        const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);
        
        if (intersects.length > 0 && intersects[0].distance <= this.interactDistance) {
            // TODO: Show interaction prompt UI
            // console.log('Press E to interact');
        }
    }

    interact() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);
        
        if (intersects.length > 0 && intersects[0].distance <= this.interactDistance) {
            const object = intersects[0].object;
            
            // Check if object has interact method
            if (object.userData && object.userData.onInteract) {
                object.userData.onInteract(this.eventBus);
            }
            
            this.eventBus.publish('player:interact', { object });
        }
    }

    addInteractable(object) {
        this.interactableObjects.push(object);
    }

    removeInteractable(object) {
        const index = this.interactableObjects.indexOf(object);
        if (index > -1) {
            this.interactableObjects.splice(index, 1);
        }
    }
}
