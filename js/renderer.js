/**
 * Renderer.js - Optimized PixiJS Logic (Celestial Edition - 10k+ Support)
 */

const Renderer = {
    app: null,
    container: null,
    sprites: new Map(), // body.id -> sprite
    filters: {},
    textures: {},

    async init() {
        const container = document.getElementById('game-container');

        this.app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundAlpha: 1,
            backgroundColor: 0x050a15,
            antialias: false, // Turn off anti-alias for performance at 10k
            resolution: 1, // Fixed resolution for speed
            autoDensity: true,
            powerPreference: 'high-performance'
        });

        container.insertBefore(this.app.view, container.firstChild);

        // Cache Textures
        this.generateTextures();

        // Layers
        this.bgLayer = new PIXI.Container();
        this.gameLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();

        this.app.stage.addChild(this.bgLayer);
        this.app.stage.addChild(this.gameLayer);
        this.app.stage.addChild(this.uiLayer);

        this.setupBackground();
        this.setupFilters();

        console.log("Renderer Optimized for 10,000+ Orbs");
    },

    generateTextures() {
        // Pre-render the Divine Orb
        const pinGfx = new PIXI.Graphics();
        pinGfx.beginFill(0xffffff, 0.7);
        pinGfx.drawCircle(0, 0, 10); // Base radius for scaling
        pinGfx.endFill();
        pinGfx.lineStyle(2, 0xffd700, 0.8);
        pinGfx.drawCircle(0, 0, 11);
        this.textures.pin = this.app.renderer.generateTexture(pinGfx);

        const ballGfx = new PIXI.Graphics();
        ballGfx.beginFill(0xffffff, 1);
        ballGfx.drawCircle(0, 0, 10);
        ballGfx.endFill();
        this.textures.ball = this.app.renderer.generateTexture(ballGfx);
    },

    setupBackground() {
        this.grid = new PIXI.Graphics();
        this.bgLayer.addChild(this.grid);
        this.gridTime = 0;

        this.nebulae = [];
        const colors = [0x00f2ff, 0xffffff, 0x0044ff];
        for (let i = 0; i < 3; i++) { // Fewer nebulae for performance
            const nebula = new PIXI.Graphics();
            nebula.beginFill(colors[i % 3], 0.1);
            nebula.drawEllipse(0, 0, 500, 300);
            nebula.endFill();
            nebula.filters = [new PIXI.filters.BlurFilter(100)];
            nebula.position.set(Math.random() * this.app.screen.width, Math.random() * this.app.screen.height);
            this.bgLayer.addChild(nebula);
            this.nebulae.push({
                sprite: nebula,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2
            });
        }

        this.rays = new PIXI.Graphics();
        this.app.stage.addChild(this.rays);
        this.pulses = [];
    },

    setupFilters() {
        // Optimized Bloom
        const Bloom = PIXI.filters.AdvancedBloomFilter || PIXI.filters.BloomFilter;
        if (Bloom) {
            this.filters.bloom = new Bloom({
                threshold: 0.5,
                bloomScale: 1.5,
                brightness: 1.0,
                blur: 4,
                quality: 3
            });
            this.gameLayer.filters = [this.filters.bloom];
        }
    },

    createCircleSprite(body, radius, color = 0xffffff, isBall = false) {
        // Use optimized Sprite from pre-rendered texture
        const sprite = new PIXI.Sprite(isBall ? this.textures.ball : this.textures.pin);
        sprite.anchor.set(0.5);
        sprite.width = radius * 2.5;
        sprite.height = radius * 2.5;
        sprite.tint = color;

        if (isBall) {
            sprite.blendMode = PIXI.BLEND_MODES.ADD;
        }

        sprite.position.copyFrom(body.position);
        this.gameLayer.addChild(sprite);
        this.sprites.set(body.id, sprite);
        return sprite;
    },

    createRectSprite(body, width, height, color = 0xffffff) {
        const graphics = new PIXI.Graphics();
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

        // Optimized batch update
        const count = bodies.length;
        for (let i = 0; i < count; i++) {
            const body = bodies[i];
            const sprite = this.sprites.get(body.id);
            if (sprite) {
                sprite.x = body.position.x;
                sprite.y = body.position.y;
                sprite.rotation = body.angle;
            }
        }
    },

    updateBackground() {
        const { width, height } = this.app.screen;
        this.gridTime += 0.005;

        this.grid.clear();
        this.grid.lineStyle(1, 0xffd700, 0.1);
        const spacing = 100;
        const offset = (this.gridTime * 30) % spacing;
        for (let x = 0; x < width + spacing; x += spacing) {
            this.grid.moveTo(x, 0); this.grid.lineTo(x, height);
        }
        for (let y = 0; y < height + spacing; y += spacing) {
            const py = y + offset;
            this.grid.moveTo(0, py); this.grid.lineTo(width, py);
        }

        this.nebulae.forEach(n => {
            n.sprite.x += n.vx;
            n.sprite.y += n.vy;
            if (n.sprite.x < -600) n.sprite.x = width + 600;
            if (n.sprite.x > width + 600) n.sprite.x = -600;
        });

        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const p = this.pulses[i];
            p.radius += p.speed;
            p.alpha -= 0.03;
            p.graphics.clear();
            p.graphics.lineStyle(4, p.color, p.alpha);
            p.graphics.drawCircle(p.x, p.y, p.radius);
            if (p.alpha <= 0) {
                this.bgLayer.removeChild(p.graphics);
                p.graphics.destroy();
                this.pulses.splice(i, 1);
            }
        }
    },

    createPulse(x, y, color = 0xffffff) {
        if (this.pulses.length > 10) return; // Throttle background pulses at high density
        const graphics = new PIXI.Graphics();
        graphics.blendMode = PIXI.BLEND_MODES.ADD;
        this.bgLayer.addChild(graphics);
        this.pulses.push({ x, y, color, radius: 5, alpha: 1.0, speed: 6, graphics });
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
