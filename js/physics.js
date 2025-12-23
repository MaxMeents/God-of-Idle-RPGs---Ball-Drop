/**
 * Physics.js - Optimized Matter.js for 10,000+ balls
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
        this.world.gravity.y = 1.0;

        // PERFORMANCE: Tune Engine
        this.engine.positionIterations = 2; // Default 6
        this.engine.velocityIterations = 2; // Default 4
        this.engine.enableSleeping = true; // Essential for high count

        this.setupArena();

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, this.engine);

        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            // Rate limit collision effects for better performance
            if (Math.random() > 0.1) return;
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

        const wallThickness = 100;
        const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        Composite.add(this.world, [leftWall, rightWall]);

        // Massive Pin Field
        const rows = 35;
        const pinRadius = 2.0;
        const pinSpacingX = width / 45;
        const pinSpacingY = height / 55;
        const startY = height * 0.15;

        for (let r = 0; r < rows; r++) {
            const pinsInRow = 35 + (r % 2 === 0 ? 1 : 0);
            const rowWidth = pinsInRow * pinSpacingX;
            const startX = (width - rowWidth) / 2 + pinSpacingX / 2;

            for (let c = 0; c < pinsInRow; c++) {
                const px = startX + c * pinSpacingX;
                const py = startY + r * pinSpacingY;
                if (px < 20 || px > width - 20) continue;

                const pin = Bodies.circle(px, py, pinRadius, {
                    isStatic: true,
                    label: 'pin',
                    restitution: 0.6
                });
                this.pins.push(pin);
                Composite.add(this.world, pin);
                Renderer.createCircleSprite(pin, pinRadius, 0x00f2ff, false);
            }
        }

        // Slots
        const slotCount = 18;
        const slotWidth = width / slotCount;
        for (let i = 0; i < slotCount; i++) {
            const sx = i * slotWidth + slotWidth / 2;
            const divider = Bodies.rectangle(i * slotWidth, height - 25, 4, 150, { isStatic: true });
            Composite.add(this.world, divider);
            Renderer.createRectSprite(divider, 4, 150, 0xffffff);

            const sensor = Bodies.rectangle(sx, height - 10, slotWidth - 2, 30, {
                isSensor: true, isStatic: true, label: `slot_${i}`
            });
            this.slots.push(sensor);
            Composite.add(this.world, sensor);
        }
    },

    spawnBall() {
        this.spawnBallTriangle(100); // Trigger 100 balls on single click/auto
    },

    spawnBallTriangle(total = 100) {
        const { Bodies, Composite } = Matter;
        const width = document.getElementById('game-container').clientWidth;
        const centerX = width / 2;
        const ballRadius = 5.5;
        const spacing = ballRadius * 2.2;

        // Calculate number of rows for a triangle
        // n*(n+1)/2 = 100 -> n^2 + n - 200 = 0 -> n approx 13.6
        const rows = 13;
        let spawned = 0;

        for (let r = 0; r < rows; r++) {
            const ballsInRow = r + 1;
            const rowWidth = ballsInRow * spacing;
            const startX = centerX - rowWidth / 2 + spacing / 2;

            for (let c = 0; c < ballsInRow; c++) {
                if (spawned >= total) break;

                const x = startX + c * spacing;
                const y = -150 - r * spacing;

                const ball = Bodies.circle(x, y, ballRadius, {
                    restitution: 0.5,
                    friction: 0.001,
                    label: 'ball',
                    density: 0.001
                });

                this.balls.push(ball);
                Composite.add(this.world, ball);
                Renderer.createCircleSprite(ball, ballRadius, 0xffffff, true);
                spawned++;
            }
        }
    },

    handleCollision(pair) {
        const { bodyA, bodyB } = pair;

        if ((bodyA.label === 'ball' && bodyB.label === 'pin') ||
            (bodyA.label === 'pin' && bodyB.label === 'ball')) {
            const ball = bodyA.label === 'ball' ? bodyA : bodyB;

            // Trigger UI logic for pin hit (passive gold)
            UI.handleCollision();

            // Extreme Throttling of VFX for 10k balls
            if (this.balls.length < 500) {
                Juice.createCollisionParticles(ball.position.x, ball.position.y);
                Renderer.createPulse(ball.position.x, ball.position.y, 0x00f2ff);
            }
        }

        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('slot_') ? bodyA : (bodyB.label.startsWith('slot_') ? bodyB : null);

        if (ball && slot) {
            const slotIndex = parseInt(slot.label.split('_')[1]);
            const goldEarned = UI.handleScore(slotIndex);

            if (this.balls.length < 500) {
                Juice.createScorePopup(ball.position.x, ball.position.y, `+${Math.floor(goldEarned)}`);
                Renderer.createPulse(ball.position.x, ball.position.y, 0xffffff);
            }

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
