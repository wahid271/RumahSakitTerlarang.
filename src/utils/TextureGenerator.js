/**
 * TextureGenerator.js
 * ----------------------------------
 * Membuat texture procedural menggunakan Canvas API
 * agar tidak perlu file eksternal untuk development.
 */

export class TextureGenerator {
    /**
     * Membuat texture lantai keramik rumah sakit
     */
    static createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color - lantai keramik tua
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 512, 512);

        // Grid tiles
        const tileSize = 64;
        for (let x = 0; x < 512; x += tileSize) {
            for (let y = 0; y < 512; y += tileSize) {
                // Variasi warna tile
                const variation = Math.random() * 20 - 10;
                const r = 42 + variation;
                const g = 42 + variation;
                const b = 42 + variation;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

                // Noda/kotoran acak
                if (Math.random() > 0.85) {
                    ctx.fillStyle = `rgba(20, 15, 10, ${Math.random() * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(
                        x + tileSize / 2,
                        y + tileSize / 2,
                        Math.random() * 15 + 5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }

        // Garis grout (nat antar tile)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        for (let x = 0; x <= 512; x += tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }
        for (let y = 0; y <= 512; y += tileSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        // Noda darah samar
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(80, 20, 20, ${Math.random() * 0.3 + 0.1})`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * 512,
                Math.random() * 512,
                Math.random() * 30 + 20,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }

    /**
     * Membuat texture dinding rumah sakit
     */
    static createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base wall color - cat rumah sakit tua
        ctx.fillStyle = '#d4d0c4';
        ctx.fillRect(0, 0, 512, 512);

        // Noise texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const gray = Math.random() * 30 + 180;
            ctx.fillStyle = `rgba(${gray}, ${gray - 10}, ${gray - 20}, 0.3)`;
            ctx.fillRect(x, y, 2, 2);
        }

        // Garis horizontal (panel dinding)
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 200);
        ctx.lineTo(512, 200);
        ctx.stroke();

        // Noda air/lumut
        for (let i = 0; i < 5; i++) {
            const gradient = ctx.createRadialGradient(
                Math.random() * 512,
                Math.random() * 512,
                0,
                Math.random() * 512,
                Math.random() * 512,
                50
            );
            gradient.addColorStop(0, 'rgba(50, 60, 40, 0.4)');
            gradient.addColorStop(1, 'rgba(50, 60, 40, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
        }

        // Retakan cat
        ctx.strokeStyle = 'rgba(80, 70, 60, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            let x = Math.random() * 512;
            let y = Math.random() * 512;
            ctx.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 40;
                y += Math.random() * 30;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    /**
     * Membuat texture langit-langit
     */
    static createCeilingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#b8b4a8';
        ctx.fillRect(0, 0, 512, 512);

        // Panel langit-langit
        const panelSize = 128;
        for (let x = 0; x < 512; x += panelSize) {
            for (let y = 0; y < 512; y += panelSize) {
                ctx.fillStyle = `rgba(150, 148, 140, ${Math.random() * 0.3 + 0.5})`;
                ctx.fillRect(x + 2, y + 2, panelSize - 4, panelSize - 4);
                
                // Frame panel
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, panelSize - 4, panelSize - 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }
}

// Import THREE untuk CanvasTexture
import * as THREE from 'three';
