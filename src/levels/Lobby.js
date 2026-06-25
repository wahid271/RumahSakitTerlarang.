/**
 * Lobby.js
 * ----------------------------------
 * Setup dan logika untuk area Lobby rumah sakit.
 */

import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class Lobby {
    constructor(scene) {
        this.scene = scene;
        this.roomWidth = 20;
        this.roomDepth = 20;
        this.roomHeight = 4;
        this.wallThickness = 0.3;
        
        this.objects = [];
        this.flickeringLights = [];
    }

    load() {
        this.createRoom();
        this.createLighting();
        this.createDecorations();
    }

    createRoom() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(this.roomWidth, this.roomDepth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: TextureGenerator.createFloorTexture(),
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.objects.push(floor);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(this.roomWidth, this.roomDepth);
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            map: TextureGenerator.createCeilingTexture(),
            roughness: 0.9
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = this.roomHeight;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
        this.objects.push(ceiling);

        // Walls
        const wallTexture = TextureGenerator.createWallTexture();
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            roughness: 0.9,
            metalness: 0.1
        });

        // Front wall
        const frontWall = this.createWall(
            this.roomWidth, this.roomHeight,
            0, this.roomHeight / 2, -this.roomDepth / 2
        );
        frontWall.material = wallMaterial;
        this.scene.add(frontWall);
        this.objects.push(frontWall);

        // Back wall
        const backWall = this.createWall(
            this.roomWidth, this.roomHeight,
            0, this.roomHeight / 2, this.roomDepth / 2
        );
        backWall.material = wallMaterial;
        backWall.rotation.y = Math.PI;
        this.scene.add(backWall);
        this.objects.push(backWall);

        // Left wall
        const leftWall = this.createWall(
            this.roomDepth, this.roomHeight,
            -this.roomWidth / 2, this.roomHeight / 2, 0
        );
        leftWall.material = wallMaterial;
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);
        this.objects.push(leftWall);

        // Right wall
        const rightWall = this.createWall(
            this.roomDepth, this.roomHeight,
            this.roomWidth / 2, this.roomHeight / 2, 0
        );
        rightWall.material = wallMaterial;
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
        this.objects.push(rightWall);
    }

    createWall(width, height, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, this.wallThickness);
        const material = new THREE.MeshStandardMaterial({ color: 0xd4d0c4 });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        return wall;
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x2a2a3e, 0.3);
        this.scene.add(ambientLight);

        // Main light (flickering)
        const mainLight = new THREE.PointLight(0xffaa44, 2.0, 20);
        mainLight.position.set(0, this.roomHeight - 0.5, 0);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);
        this.flickeringLights.push(mainLight);

        // Corner lights
        const cornerLight1 = new THREE.PointLight(0x4466aa, 1.0, 15);
        cornerLight1.position.set(-8, 3, -8);
        this.scene.add(cornerLight1);

        const cornerLight2 = new THREE.PointLight(0x4466aa, 1.0, 15);
        cornerLight2.position.set(8, 3, 8);
        this.scene.add(cornerLight2);

        // Emergency light
        const emergencyLight = new THREE.PointLight(0xff0000, 1.2, 12);
        emergencyLight.position.set(-8, 3.5, 8);
        this.scene.add(emergencyLight);
        this.flickeringLights.push(emergencyLight);

        // Light bulbs
        this.createLightBulb(0, this.roomHeight - 0.5, 0, 0xffaa44);
        this.createLightBulb(-8, 3.5, -8, 0x4466aa);
        this.createLightBulb(8, 3.5, 8, 0x4466aa);
        this.createLightBulb(-8, 3.5, 8, 0xff0000);
    }

    createLightBulb(x, y, z, color) {
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const bulb = new THREE.Mesh(geometry, material);
        bulb.position.set(x, y, z);
        this.scene.add(bulb);
        this.objects.push(bulb);

        // Cable
        const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
        const cableMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const cable = new THREE.Mesh(cableGeometry, cableMaterial);
        cable.position.set(x, y + 0.25, z);
        this.scene.add(cable);
        this.objects.push(cable);
    }

    createDecorations() {
        // Wheelchair
        this.createWheelchair(-5, 0, -5);

        // Reception desk
        this.createReceptionDesk(0, 0, -6);

        // Notice board
        this.createNoticeBoard(0, 2, -9.7);

        // Boxes
        this.createBoxes(5, 0, 5);
        
        // Chair
        this.createChair(2, 0, -6);
    }

    createWheelchair(x, y, z) {
        const group = new THREE.Group();

        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.6;
        group.add(seat);

        // Backrest
        const backGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 1, -0.35);
        group.add(back);

        // Wheels
        const wheelGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel1.position.set(-0.45, 0.4, 0);
        wheel1.rotation.y = Math.PI / 2;
        group.add(wheel1);

        const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel2.position.set(0.45, 0.4, 0);
        wheel2.rotation.y = Math.PI / 2;
        group.add(wheel2);

        group.position.set(x, y, z);
        group.castShadow = true;
        this.scene.add(group);
        this.objects.push(group);
    }

    createReceptionDesk(x, y, z) {
        const group = new THREE.Group();

        // Desk
        const deskGeometry = new THREE.BoxGeometry(4, 1.2, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.y = 0.6;
        desk.castShadow = true;
        desk.receiveShadow = true;
        group.add(desk);

        // Monitor
        const monitorGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.1);
        const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(-1, 1.5, -0.3);
        group.add(monitor);

        // Screen
        const screenGeometry = new THREE.PlaneGeometry(0.5, 0.4);
        const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x003300 });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(-1, 1.5, -0.24);
        group.add(screen);

        // Screen light
        const screenLight = new THREE.PointLight(0x00ff00, 0.3, 2);
        screenLight.position.set(-1, 1.5, 0);
        group.add(screenLight);

        group.position.set(x, y, z);
        this.scene.add(group);
        this.objects.push(group);
    }

    createNoticeBoard(x, y, z) {
        const boardGeometry = new THREE.BoxGeometry(3, 2, 0.1);
        const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(x, y, z);
        board.castShadow = true;
        this.scene.add(board);
        this.objects.push(board);

        // Papers
        const paperGeometry = new THREE.PlaneGeometry(0.5, 0.7);
        const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xddddaa });
        for (let i = 0; i < 6; i++) {
            const paper = new THREE.Mesh(paperGeometry, paperMaterial);
            paper.position.set(
                x - 1 + (i % 3) * 0.7,
                y + 0.3 - Math.floor(i / 3) * 0.9,
                z + 0.06
            );
            paper.rotation.z = (Math.random() - 0.5) * 0.2;
            this.scene.add(paper);
            this.objects.push(paper);
        }
    }

    createBoxes(x, y, z) {
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x6b5344 });
        for (let i = 0; i < 4; i++) {
            const size = Math.random() * 0.5 + 0.3;
            const boxGeometry = new THREE.BoxGeometry(size, size, size);
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(
                x + (Math.random() - 0.5) * 2,
                size / 2,
                z + (Math.random() - 0.5) * 2
            );
            box.rotation.y = Math.random() * Math.PI;
            box.castShadow = true;
            box.receiveShadow = true;
            this.scene.add(box);
            this.objects.push(box);
        }
    }

    createChair(x, y, z) {
        const group = new THREE.Group();

        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.5;
        group.add(seat);

        // Backrest
        const backGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 0.8, -0.2);
        group.add(back);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const positions = [
            [-0.2, 0.25, -0.2],
            [0.2, 0.25, -0.2],
            [-0.2, 0.25, 0.2],
            [0.2, 0.25, 0.2]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            group.add(leg);
        });

        group.position.set(x, y, z);
        group.castShadow = true;
        this.scene.add(group);
        this.objects.push(group);
    }

    update(deltaTime) {
        // Flickering lights effect
        this.flickeringLights.forEach((light, index) => {
            if (Math.random() > 0.95) {
                light.intensity = Math.random() * 0.5 + 0.5;
            } else {
                const targetIntensity = index === 0 ? 2.0 : 1.2;
                light.intensity += (targetIntensity - light.intensity) * 0.1;
            }
        });
    }

    unload() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.objects = [];
        this.flickeringLights = [];
    }
}
