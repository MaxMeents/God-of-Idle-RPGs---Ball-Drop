/**
 * Renderer.js - PixiJS WebGL Logic (Celestial Edition)
 */

const Renderer = {
    app: null,
    container: null,
    sprites: new Map(), // body.id -> sprite
    filters: {},

    async init() {
        const container = document.getElementById('game-container');

        this.app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundAlpha: 1,
            backgroundColor: 0x050a15,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        container.insertBefore(this.app.view, container.firstChild);

        // Layers
        this.bgLayer = new PIXI.Container();
        this.gameLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container(); // In-game UI popups

        this.app.stage.addChild(this.bgLayer);
        this.app.stage.addChild(this.gameLayer);
        this.app.stage.addChild(this.uiLayer);

        // Initialize Background System
        this.setupBackground();

        // Post-processing
        this.setupFilters();

        console.log("Renderer Initialized: Celestial Mode");
    },

    setupBackground() {
        // 1. Divine Grid (Golden/White)
        this.grid = new PIXI.Graphics();
        this.bgLayer.addChild(this.grid);
        this.gridTime = 0;

        // 2. Celestial Nebulae (Deep depth)
        this.nebulae = [];
        const colors = [0x00f2ff, 0xffffff, 0x0044ff];
        for (let i = 0; i < 5; i++) {
            const nebula = new PIXI.Graphics();
            nebula.beginFill(colors[i % 3], 0.1);
            nebula.drawEllipse(0, 0, 500 + Math.random() * 300, 300 + Math.random() * 200);
            nebula.endFill();
            nebula.filters = [new PIXI.filters.BlurFilter(150)];
            nebula.position.set(Math.random() * this.app.screen.width, Math.random() * this.app.screen.height);
            nebula.blendMode = PIXI.BLEND_MODES.ADD;
            this.bgLayer.addChild(nebula);
            this.nebulae.push({
                sprite: nebula,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3
            });
        }

        // 3. Scanlines (Subtle light rays instead)
        this.rays = new PIXI.Graphics();
        this.app.stage.addChild(this.rays);

        // 4. Energy Pulses
        this.pulses = [];
    },

    setupFilters() {
        // Intense Heavenly Bloom
        const Bloom = PIXI.filters.AdvancedBloomFilter || PIXI.filters.BloomFilter;

        if (Bloom) {
            this.filters.bloom = new Bloom({
                threshold: 0.3,
                bloomScale: 2.0,
                brightness: 1.2,
                blur: 10,
                quality: 5
            });
        }

        const activeFilters = [];
        if (this.filters.bloom) activeFilters.push(this.filters.bloom);
        this.gameLayer.filters = activeFilters;
    },

    createCircleSprite(body, radius, color = 0xffffff) {
        const container = new PIXI.Container();

        // Divine Glow
        const glow = new PIXI.Graphics();
        glow.beginFill(color, 0.7);
        glow.drawCircle(0, 0, radius * 4);
        glow.endFill();
        glow.blendMode = PIXI.BLEND_MODES.ADD;

        // Radiant Core
        const core = new PIXI.Graphics();
        core.beginFill(0xffffff, 1.0);
        core.drawCircle(0, 0, radius);
        core.endFill();

        // Golden Ring
        const ring = new PIXI.Graphics();
        ring.lineStyle(2, 0xffd700, 0.8);
        ring.drawCircle(0, 0, radius + 1);

        container.addChild(glow);
        container.addChild(ring);
        container.addChild(core);

        container.position.copyFrom(body.position);

        this.gameLayer.addChild(container);
        this.sprites.set(body.id, container);
        return container;
    },

    createRectSprite(body, width, height, color = 0xffffff) {
        const graphics = new PIXI.Graphics();

        // Golden Glowing divider
        graphics.beginFill(0xffd700, 0.3);
        graphics.drawRect(-width / 2 - 4, -height / 2 - 2, width + 8, height + 4);
        graphics.endFill();

        graphics.beginFill(0xffffff, 0.9);
        graphics.drawRect(-width / 2, -height / 2, width, height);
        graphics.endFill();

        graphics.position.copyFrom(body.position);
        graphics.rotation = body.angle;

        this.gameLayer.addChild(graphics);
        this.sprites.set(body.id, graphics);
        return graphics;
    },

    update(bodies) {
        this.updateBackground();

        bodies.forEach(body => {
            const sprite = this.sprites.get(body.id);
            if (sprite) {
                sprite.position.copyFrom(body.position);
                sprite.rotation = body.angle;
            }
        });
    },

    updateBackground() {
        const { width, height } = this.app.screen;
        this.gridTime += 0.005;

        // Divine Grid (Golden)
        this.grid.clear();
        this.grid.lineStyle(1, 0xffd700, 0.15);

        const spacing = 80;
        const offset = (this.gridTime * 40) % spacing;

        for (let x = -spacing; x < width + spacing; x += spacing) {
            this.grid.moveTo(x, 0);
            this.grid.lineTo(x, height);
        }
        for (let y = -spacing; y < height + spacing; y += spacing) {
            const py = y + offset;
            this.grid.moveTo(0, py);
            this.grid.lineTo(width, py);
        }

        // Heavenly Light Rays
        this.rays.clear();
        this.rays.lineStyle(1, 0xffffff, 0.05);
        for (let i = 0; i < 10; i++) {
            const rx = (width / 10) * i + Math.sin(this.gridTime + i) * 50;
            this.rays.moveTo(rx, 0);
            this.rays.lineTo(rx - 200, height);
        }

        // Nebulae
        this.nebulae.forEach(n => {
            n.sprite.x += n.vx;
            n.sprite.y += n.vy;
            if (n.sprite.x < -600) n.sprite.x = width + 600;
            if (n.sprite.x > width + 600) n.sprite.x = -600;
        });

        // Divine Pulses
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const p = this.pulses[i];
            p.radius += p.speed;
            p.alpha -= 0.015;
            p.graphics.clear();
            p.graphics.lineStyle(6, p.color, p.alpha);
            p.graphics.drawCircle(p.x, p.y, p.radius);
            if (p.alpha <= 0) {
                this.bgLayer.removeChild(p.graphics);
                p.graphics.destroy();
                this.pulses.splice(i, 1);
            }
        }
    },

    createPulse(x, y, color = 0xffffff) {
        const graphics = new PIXI.Graphics();
        graphics.blendMode = PIXI.BLEND_MODES.ADD;
        this.bgLayer.addChild(graphics);
        this.pulses.push({
            x, y, color,
            radius: 5, alpha: 1.0, speed: 7,
            graphics
        });
    },

    removeSprite(bodyId) {
        const sprite = this.sprites.get(bodyId);
        if (sprite) {
            this.gameLayer.removeChild(sprite);
            sprite.destroy({ children: true });
            this.sprites.delete(bodyId);
        }
    }
};

window.Renderer = Renderer;
