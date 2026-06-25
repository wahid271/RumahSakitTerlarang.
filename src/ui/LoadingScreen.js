/**
 * LoadingScreen.js
 * ----------------------------------
 * Menampilkan loading screen dengan tema horror saat game dimuat.
 */

export class LoadingScreen {
    constructor() {
        this.createLoadingScreen();
    }

    createLoadingScreen() {
        this.container = document.createElement('div');
        this.container.className = 'loading-screen';
        this.container.innerHTML = `
            <div class="loading-content">
                <h1 class="loading-title">RUMAH SAKIT TERLARANG</h1>
                <p class="loading-subtitle">Jangan menoleh ke belakang...</p>
                <div class="loading-bar-container">
                    <div class="loading-bar" id="loading-bar"></div>
                </div>
                <p class="loading-text" id="loading-text">Memuat...</p>
                <p class="loading-tip" id="loading-tip">💡 Tip: Gunakan headphone untuk pengalaman terbaik</p>
            </div>
        `;
        document.body.appendChild(this.container);
    }

    updateProgress(percent, text = 'Memuat...') {
        const bar = document.getElementById('loading-bar');
        const textEl = document.getElementById('loading-text');
        
        if (bar) bar.style.width = `${percent}%`;
        if (textEl) textEl.textContent = text;
    }

    hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            this.container.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                if (this.container && this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
            }, 1000);
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'flex';
        }
    }
}
