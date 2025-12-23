/**
 * Juice.js - VFX and Satisfaction Systems (PixiJS Edition)
 */

const Juice = {
    shakeIntensity: 0,
    particles: [],
    popups: [],

    init() {
        console.log("Juice System Initialized (PixiJS)");
    },

    screenShake(intensity = 5) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    },

    createCollisionParticles(x, y, color = 0xffffff) {
        if (this.particles.length > 300) return; // Cap particles at 300
        const count = 10;
        for (let i = 0; i < count; i++) {
            const p = new PIXI.Graphics();
            const pColor = Math.random() > 0.5 ? 0xffffff : 0x00f2ff;
            p.beginFill(pColor);
            p.drawCircle(0, 0, 1 + Math.random() * 2);
            p.endFill();

            p.x = x;
            p.y = y;

            const particle = {
                sprite: p,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                decay: 0.05 + Math.random() * 0.05
            };

            Renderer.gameLayer.addChild(p);
            this.particles.push(particle);
        }
    },

    createScorePopup(x, y, text) {
        if (this.popups.length > 50) return; // Cap popups at 50
        const style = new PIXI.TextStyle({
            fontFamily: 'Orbitron',
            fontSize: 20,
            fontWeight: 'bold',
            fill: ['#ffffff', '#00f2ff'],
            stroke: '#050a15',
            strokeThickness: 4,
        });

        const popup = new PIXI.Text(text, style);
        popup.anchor.set(0.5);
        popup.position.set(x, y);

        const popupObj = {
            sprite: popup,
            vy: -2,
            life: 1.0
        };

        Renderer.uiLayer.addChild(popup);
        this.popups.push(popupObj);
    },

    update() {
        // Screen Shake (Apply to the whole stage container)
        if (this.shakeIntensity > 0) {
            const sx = (Math.random() - 0.5) * this.shakeIntensity;
            const sy = (Math.random() - 0.5) * this.shakeIntensity;
            Renderer.app.stage.position.set(sx, sy);
            this.shakeIntensity *= 0.9;
            if (this.shakeIntensity < 0.1) {
                this.shakeIntensity = 0;
                Renderer.app.stage.position.set(0, 0);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            p.sprite.scale.set(p.life);

            if (p.life <= 0) {
                Renderer.gameLayer.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }

        // Popups
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const p = this.popups[i];
            p.sprite.y += p.vy;
            p.life -= 0.02;
            p.sprite.alpha = p.life;
            p.sprite.scale.set(1 + (1 - p.life) * 0.5); // Grow slightly

            if (p.life <= 0) {
                Renderer.uiLayer.removeChild(p.sprite);
                p.sprite.destroy();
                this.popups.splice(i, 1);
            }
        }
    }
};

window.Juice = Juice;
