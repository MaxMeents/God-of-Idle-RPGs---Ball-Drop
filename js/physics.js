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

        // PERFORMANCE: Ultra-Tune Engine for 10k
        this.engine.positionIterations = 1;
        this.engine.velocityIterations = 1;
        this.engine.constraintIterations = 0;
        this.engine.enableSleeping = true;
        this.world.gravity.scale = 0.0015;

        this.COLLISION_GROUPS = {
            BALL: 0x0001,
            PIN: 0x0002,
            SLOT: 0x0004
        };

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
            Renderer.createRectSprite(divider, 4, 150, 0xffffff, true); // Mark as slot divider

            const sensor = Bodies.rectangle(sx, height - 10, slotWidth - 2, 80, { // Larger sensor
                isSensor: true, isStatic: true, label: `slot_${i}`,
                collisionFilter: { mask: this.COLLISION_GROUPS.BALL }
            });
            this.slots.push(sensor);
            Composite.add(this.world, sensor);

            // Radiant Background for Slot
            Renderer.createRectSprite({ position: { x: sx, y: height - 40 }, id: `slot_bg_${i}`, angle: 0 },
                slotWidth - 4, 100, 0x0a1525, true); // Mark as slot
        }
    },

    spawnBall() {
        this.spawnBallTriangle(2000); // Trigger massive 2,000 ball drop
    },

    spawnBallTriangle(total = 2000) {
        const { Bodies, Composite } = Matter;
        const width = document.getElementById('game-container').clientWidth;
        const centerX = width / 2;
        const ballRadius = 4.5;
        const spacing = ballRadius * 2.1;

        // Rows for ~2000 balls: n(n+1)/2 = 2000 -> n approx 63
        const rows = 63;
        let spawned = 0;

        // Cluster spawning in chunks to avoid frame stall
        const spawnChunk = () => {
            for (let i = 0; i < 200; i++) { // 200 per frame
                if (spawned >= total) return;

                const r = Math.floor(Math.sqrt(2 * spawned + 0.25) - 0.5);
                const c = spawned - (r * (r + 1) / 2);

                const rowWidth = (r + 1) * spacing;
                const x = centerX - rowWidth / 2 + c * spacing;
                const y = -100 - r * spacing;

                const ball = Bodies.circle(x, y, ballRadius, {
                    restitution: 0.4,
                    friction: 0.0001,
                    frictionAir: 0.001,
                    label: 'ball',
                    render: { visible: false },
                    collisionFilter: {
                        category: this.COLLISION_GROUPS.BALL,
                        mask: this.COLLISION_GROUPS.PIN | this.COLLISION_GROUPS.SLOT // No BALL mask!
                    }
                });

                this.balls.push(ball);
                Composite.add(this.world, ball);
                Renderer.createCircleSprite(ball, ballRadius, 0xffffff, true);
                spawned++;
            }
            if (spawned < total) requestAnimationFrame(spawnChunk);
        };
        spawnChunk();
    },

    handleCollision(pair) {
        const { bodyA, bodyB } = pair;

        if ((bodyA.label === 'ball' && bodyB.label === 'pin') ||
            (bodyA.label === 'pin' && bodyB.label === 'ball')) {
            const ball = bodyA.label === 'ball' ? bodyA : bodyB;

            // Trigger UI logic for pin hit (passive gold)
            UI.handleCollision();

            // True Hyper Juice: Subtle impact
            if (Math.random() > 0.8) {
                Juice.screenShake(2);
                Juice.triggerAberration(3);
            }

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
            const scoreData = UI.handleScore(slotIndex); // Now returns {amount, tier, formatted}

            // True Hyper Juice: Big Impact
            if (this.balls.length < 50) { // Only heavy effects at low count
                Juice.screenShake(10);
                Juice.triggerAberration(15);
                Juice.hitstop(8);
            } else {
                Juice.screenShake(1); // Subtle shake at high count
            }

            // Always show popup as requested
            Juice.createScorePopup(ball.position.x, ball.position.y, `+${scoreData.formatted}`, scoreData.tier);

            // Divine Lighting
            Renderer.illuminateSlot(slotIndex, scoreData.tier);
            if (this.balls.length < 1000) {
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
