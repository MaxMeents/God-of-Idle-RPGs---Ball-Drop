/**
 * Physics.js - Matter.js World Setup (without internal renderer)
 */

const Physics = {
    engine: null,
    world: null,
    pins: [],
    slots: [],
    balls: [],

    init() {
        const { Engine, World, Bodies, Composite } = Matter;

        this.engine = Engine.create();
        this.world = this.engine.world;

        this.setupArena();

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, this.engine);

        // Listen for collisions
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                this.handleCollision(pair);
            });
        });
    },

    setupArena() {
        const { Bodies, Composite } = Matter;
        const container = document.getElementById('game-container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Walls
        const wallThickness = 50;
        const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });

        Composite.add(this.world, [leftWall, rightWall]);

        // Pins
        const rows = 12;
        const pinSpacingX = width / 14;
        const pinSpacingY = height / 20;
        const startY = height * 0.2;

        for (let r = 0; r < rows; r++) {
            const rowWidth = (r + 1) * pinSpacingX;
            const startX = (width - rowWidth) / 2 + pinSpacingX / 2;

            for (let c = 0; c <= r; c++) {
                const px = startX + c * pinSpacingX;
                const py = startY + r * pinSpacingY;

                const color = (r + c) % 2 === 0 ? 0x00f2ff : 0xff007a;
                const pin = Bodies.circle(px, py, 4, {
                    isStatic: true,
                    label: 'pin'
                });
                this.pins.push(pin);
                Composite.add(this.world, pin);

                // Create Pixi Sprite with neon color
                Renderer.createCircleSprite(pin, 4, color);
            }
        }

        // Slots
        const slotCount = 13;
        const slotWidth = width / slotCount;

        for (let i = 0; i < slotCount; i++) {
            const sx = i * slotWidth + slotWidth / 2;
            const divider = Bodies.rectangle(i * slotWidth, height - 25, 4, 100, {
                isStatic: true,
                label: 'divider'
            });
            Composite.add(this.world, divider);
            Renderer.createRectSprite(divider, 4, 100, 0x7000ff);

            const sensor = Bodies.rectangle(sx, height - 10, slotWidth - 10, 20, {
                isSensor: true,
                isStatic: true,
                label: `slot_${i}`
            });
            this.slots.push(sensor);
            Composite.add(this.world, sensor);
        }
    },

    spawnBall() {
        const { Bodies, Composite } = Matter;
        const container = document.getElementById('game-container');
        const width = container.clientWidth;
        const x = width / 2 + (Math.random() - 0.5) * 40;

        const ball = Bodies.circle(x, -20, 10, {
            restitution: 0.6,
            friction: 0.05,
            label: 'ball'
        });

        this.balls.push(ball);
        Composite.add(this.world, ball);

        // Create Pixi Sprite
        Renderer.createCircleSprite(ball, 10, 0x00f2ff);
    },

    handleCollision(pair) {
        const { bodyA, bodyB } = pair;

        if ((bodyA.label === 'ball' && bodyB.label === 'pin') ||
            (bodyA.label === 'pin' && bodyB.label === 'ball')) {
            const ball = bodyA.label === 'ball' ? bodyA : bodyB;
            Juice.screenShake(0.5);
            Juice.createCollisionParticles(ball.position.x, ball.position.y, 0xffffff);

            const pinUpg = UI.upgrades.find(u => u.id === 'pin_mult');
            if (pinUpg.level > 0) {
                UI.updateGold(pinUpg.level * 0.1);
            }
        }

        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('slot_') ? bodyA : (bodyB.label.startsWith('slot_') ? bodyB : null);

        if (ball && slot) {
            const slotIndex = parseInt(slot.label.split('_')[1]);
            const goldEarned = UI.handleScore(slotIndex);

            Juice.createCollisionParticles(ball.position.x, ball.position.y, 0xffd700);
            Juice.createScorePopup(ball.position.x, ball.position.y, `+${goldEarned.toFixed(1)}`);
            Juice.screenShake(3);

            // Cleanup
            this.removeBall(ball);
        }
    },

    removeBall(ball) {
        Matter.Composite.remove(this.world, ball);
        this.balls = this.balls.filter(b => b !== ball);
        Renderer.removeSprite(ball.id);
    }
};

window.Physics = Physics;
