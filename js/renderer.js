/**
 * Renderer.js - PixiJS WebGL Logic
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
            backgroundAlpha: 0,
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

        // Post-processing
        this.setupFilters();

        console.log("PixiJS Renderer Initialized");
    },

    setupFilters() {
        console.log("Available PIXI filters:", Object.keys(PIXI.filters || {}));
        // Try to find a suitable bloom filter
        const Bloom = PIXI.filters.AdvancedBloomFilter || PIXI.filters.BloomFilter;

        if (Bloom) {
            this.filters.bloom = new Bloom({
                threshold: 0.5,
                bloomScale: 1.5,
                brightness: 1,
                blur: 8,
                quality: 5
            });
        }

        // Glow (from pixi-filters)
        if (PIXI.filters.GlowFilter) {
            this.filters.glow = new PIXI.filters.GlowFilter({
                distance: 15,
                outerStrength: 2,
                innerStrength: 0,
                color: 0x00f2ff,
                quality: 0.5
            });
        }

        const activeFilters = [];
        if (this.filters.bloom) activeFilters.push(this.filters.bloom);

        this.gameLayer.filters = activeFilters.length > 0 ? activeFilters : null;
    },

    createCircleSprite(body, radius, color = 0xffffff) {
        const container = new PIXI.Container();

        // Core glow (additive blending for neon look)
        const glow = new PIXI.Graphics();
        glow.beginFill(color, 0.4);
        glow.drawCircle(0, 0, radius * 3);
        glow.endFill();
        glow.blendMode = PIXI.BLEND_MODES.ADD;

        // Inner bright circle
        const core = new PIXI.Graphics();
        core.beginFill(0xffffff, 0.9);
        core.drawCircle(0, 0, radius);
        core.endFill();

        // Outer colored ring
        const ring = new PIXI.Graphics();
        ring.lineStyle(2, color, 1);
        ring.drawCircle(0, 0, radius + 1);

        container.addChild(glow);
        container.addChild(ring);
        container.addChild(core);

        container.position.copyFrom(body.position);

        this.gameLayer.addChild(container);
        this.sprites.set(body.id, container);
        return container;
    },

    createRectSprite(body, width, height, color = 0x7000ff) {
        const graphics = new PIXI.Graphics();

        // Glowing divider
        graphics.beginFill(color, 0.5);
        graphics.drawRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
        graphics.endFill();

        graphics.beginFill(0xffffff, 0.8);
        graphics.drawRect(-width / 2, -height / 2, width, height);
        graphics.endFill();

        graphics.position.copyFrom(body.position);
        graphics.rotation = body.angle;

        this.gameLayer.addChild(graphics);
        this.sprites.set(body.id, graphics);
        return graphics;
    },

    update(bodies) {
        bodies.forEach(body => {
            const sprite = this.sprites.get(body.id);
            if (sprite) {
                sprite.position.copyFrom(body.position);
                sprite.rotation = body.angle;
            }
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
