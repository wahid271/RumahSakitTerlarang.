/**
 * Lobby.js
 * ----------------------------------
 * Setup dan logika untuk area Lobby rumah sakit.
 * Membuat ruangan 3D dengan dinding, lantai, langit-langit, dan pencahayaan horror.
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
    // Ambient light lebih terang sedikit
    const ambientLight = new THREE.AmbientLight(0x2a2a3e, 0.3);
    this.scene.add(ambientLight);

    // Lampu utama lobby (berkedip) - lebih terang
    const mainLight = new THREE.PointLight(0xffaa44, 2.0, 20);
    mainLight.position.set(0, this.roomHeight - 0.5, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    this.scene.add(mainLight);
    this.flickeringLights.push(mainLight);

    // Lampu sudut kiri depan - lebih terang
    const cornerLight1 = new THREE.PointLight(0x4466aa, 1.0, 15);
    cornerLight1.position.set(-8, 3, -8);
    this.scene.add(cornerLight1);

    // Lampu sudut kanan belakang - lebih terang
    const cornerLight2 = new THREE.PointLight(0x4466aa, 1.0, 15);
    cornerLight2.position.set(8, 3, 8);
    this.scene.add(cornerLight2);

    // Lampu emergency merah - lebih terang
    const emergencyLight = new THREE.PointLight(0xff0000, 1.2, 12);
    emergencyLight.position.set(-8, 3.5, 8);
    this.scene.add(emergencyLight);
    this.flickeringLights.push(emergencyLight);

    // Buat fisik lampu (bola lampu)
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

        // Kabel lampu
        const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
        const cableMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const cable = new THREE.Mesh(cableGeometry, cableMaterial);
        cable.position.set(x, y + 0.25, z);
        this.scene.add(cable);
        this.objects.push(cable);
    }

    createDecorations() {
        // Kursi roda tua di sudut
        this.createWheelchair(-6, 0, -6);

        // Meja resepsionis
        this.createReceptionDesk(0, 0, -8);

        // Papan pengumuman
        this.createNoticeBoard(0, 2, -9.7);

        // Beberapa kotak/kardus berantakan
        this.createBoxes(6, 0, 6);
    }

    createWheelchair(x, y, z) {
        const group = new THREE.Group();

        // Kursi
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.6;
        group.add(seat);

        // Sandaran
        const backGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 1, -0.35);
        group.add(back);

        // Roda besar
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

        // Meja utama
        const deskGeometry = new THREE.BoxGeometry(4, 1.2, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.y = 0.6;
        desk.castShadow = true;
        desk.receiveShadow = true;
        group.add(desk);

        // Komputer monitor tua
        const monitorGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.1);
        const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(-1, 1.5, -0.3);
        group.add(monitor);

        // Layar monitor (menyala redup)
        const screenGeometry = new THREE.PlaneGeometry(0.5, 0.4);
        const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x003300 });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(-1, 1.5, -0.24);
        group.add(screen);

        // Lampu monitor
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

        // Kertas pengumuman
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

    update(deltaTime) {
        // Efek lampu berkedip
        this.flickeringLights.forEach((light, index) => {
            if (Math.random() > 0.95) {
                light.intensity = Math.random() * 0.5 + 0.5;
            } else {
                // Smooth return to normal
                const targetIntensity = index === 0 ? 1.5 : 0.8;
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
