/**
 * Juice.js - VFX and Satisfaction Systems
 */

const Juice = {
    shakeIntensity: 0,
    particles: [],
    popups: [],
    ctx: null,

    init() {
        console.log("Juice System Initialized");
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            this.ctx = canvas.getContext('2d');
        }
    },

    screenShake(intensity = 5) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    },

    createCollisionParticles(x, y, color) {
        const count = 8 + Math.random() * 8;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 4,
                color: color || '#00f2ff'
            });
        }
    },

    createScorePopup(x, y, text) {
        this.popups.push({
            x, y,
            vy: -2,
            life: 1.0,
            text: text,
            color: '#ffd700'
        });
    },

    update() {
        // Screen Shake
        if (this.shakeIntensity > 0) {
            const container = document.getElementById('game-container');
            if (container) {
                const sx = (Math.random() - 0.5) * this.shakeIntensity;
                const sy = (Math.random() - 0.5) * this.shakeIntensity;
                container.style.transform = `translate(${sx}px, ${sy}px)`;
                this.shakeIntensity *= 0.9;
                if (this.shakeIntensity < 0.1) {
                    this.shakeIntensity = 0;
                    container.style.transform = '';
                }
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Popups
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const p = this.popups[i];
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                this.popups.splice(i, 1);
            }
        }
    },

    draw() {
        if (!this.ctx) return;

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Popups
        this.ctx.font = 'bold 24px "Orbitron"';
        this.ctx.textAlign = 'center';
        this.popups.forEach(p => {
            if (p.life > 0) {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.fillText(p.text, p.x, p.y);
            }
        });

        this.ctx.globalAlpha = 1.0;
    }
};

window.Juice = Juice;
