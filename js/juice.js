/**
 * Juice.js - VFX and Satisfaction Systems (PixiJS Edition)
 */

const Juice = {
    shakeIntensity: 0,
    aberrationIntensity: 0,
    hitstopFrames: 0,
    particles: [],
    popups: [],
    popupPool: [], // Pool for BitmapText objects

    init() {
        console.log("True Hyper Juice System Initialized");
    },

    screenShake(intensity = 15) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    },

    hitstop(frames = 5) {
        this.hitstopFrames = frames;
        Physics.engine.timing.timeScale = 0.05; // Significant slowdown
    },

    triggerAberration(intensity = 10) {
        this.aberrationIntensity = intensity;
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

    createScorePopup(x, y, text, tier = 1) {
        if (this.popups.length > 500) return; // Support massive amount of popups

        let popup;
        if (this.popupPool.length > 0) {
            popup = this.popupPool.pop();
            popup.text = text;
            popup.visible = true;
        } else {
            popup = new PIXI.BitmapText(text, { fontName: "DivineFont", fontSize: 32 });
            Renderer.uiLayer.addChild(popup);
        }

        popup.anchor.set(0.5);
        popup.position.set(x, y);

        // Map 26 Tiers to Extreme Visuals
        const tierColors = [
            0xffffff, 0x00f2ff, 0x00ff88, 0xffd700, 0xff00ff, 0xff4400,
            0x0088ff, 0xff0066, 0x88ff00, 0x00ffff, 0xffffff, 0xffd700,
            0xffffff, 0xffd700, 0xff00ff, 0xffffff, 0x00f2ff, 0xffffff,
            0xff0000, 0xffffff, 0xffffff, 0xffd700, 0x00f2ff, 0xff00ff,
            0x00f2ff, 0xffffff
        ];

        popup.tint = tierColors[tier - 1] || 0xffffff;
        const baseScale = 0.4 + (tier * 0.1);
        popup.scale.set(baseScale);
        popup.rotation = (Math.random() - 0.5) * (tier * 0.1);
        popup.alpha = 1;

        const popupObj = {
            sprite: popup,
            vy: -1.0 - (tier * 0.3), // Fly faster for higher tiers
            vx: (Math.random() - 0.5) * (tier * 1.0),
            life: 1.0,
            decay: 0.015 + (tier * 0.005),
            tier: tier
        };

        this.popups.push(popupObj);
    },

    update() {
        // Hitstop logic
        if (this.hitstopFrames > 0) {
            this.hitstopFrames--;
            if (this.hitstopFrames <= 0) {
                Physics.engine.timing.timeScale = 1.0;
            }
        }

        // Chromatic Aberration (Apply to Filter in Renderer)
        if (this.aberrationIntensity > 0) {
            if (Renderer.filters.aberration) {
                Renderer.filters.aberration.red.x = (Math.random() - 0.5) * this.aberrationIntensity;
                Renderer.filters.aberration.red.y = (Math.random() - 0.5) * this.aberrationIntensity;
                Renderer.filters.aberration.blue.x = (Math.random() - 0.5) * -this.aberrationIntensity;
            }
            this.aberrationIntensity *= 0.85;
            if (this.aberrationIntensity < 0.1) this.aberrationIntensity = 0;
        }

        // Violent Screen Shake
        if (this.shakeIntensity > 0) {
            const sx = (Math.random() - 0.5) * this.shakeIntensity;
            const sy = (Math.random() - 0.5) * this.shakeIntensity;
            Renderer.app.stage.position.set(sx, sy);
            this.shakeIntensity *= 0.92; // Slower decay for more impact
            if (this.shakeIntensity < 0.5) {
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

        // Popups (Pooled Update)
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const p = this.popups[i];
            p.sprite.y += p.vy;
            p.sprite.x += p.vx || 0;
            p.life -= p.decay;
            p.sprite.alpha = p.life;
            p.sprite.scale.set(p.sprite.scale.x * 1.01); // Subtle grow

            if (p.life <= 0) {
                p.sprite.visible = false;
                this.popupPool.push(p.sprite);
                this.popups.splice(i, 1);
            }
        }
    }
};

window.Juice = Juice;
