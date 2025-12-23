/**
 * Physics.js - Celestial Divine Pachinko (Massive Pin Density)
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
        this.world.gravity.y = 1.0; // Divine gravity

        this.setupArena();

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, this.engine);

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

        const wallThickness = 100;
        const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        Composite.add(this.world, [leftWall, rightWall]);

        // DIVINE PIN FIELD: 10x Density
        // Old was 12 rows, let's go for much more and tighter spacing
        const rows = 35;
        const pinRadius = 2.5; // Smaller pins for higher density
        const pinSpacingX = width / 40; // Tight X
        const pinSpacingY = height / 50; // Tight Y
        const startY = height * 0.15;

        for (let r = 0; r < rows; r++) {
            const isEven = r % 2 === 0;
            const pinsInRow = 30 + (isEven ? 1 : 0);
            const rowWidth = pinsInRow * pinSpacingX;
            const startX = (width - rowWidth) / 2 + pinSpacingX / 2;

            for (let c = 0; c < pinsInRow; c++) {
                const px = startX + c * pinSpacingX;
                const py = startY + r * pinSpacingY;

                // Keep some padding from walls to avoid clogging
                if (px < 20 || px > width - 20) continue;

                const color = Math.random() > 0.5 ? 0x00f2ff : 0xffffff;
                const pin = Bodies.circle(px, py, pinRadius, {
                    isStatic: true,
                    label: 'pin',
                    restitution: 0.8
                });
                this.pins.push(pin);
                Composite.add(this.world, pin);
                Renderer.createCircleSprite(pin, pinRadius, color);
            }
        }

        // Divine Slots
        const slotCount = 15;
        const slotWidth = width / slotCount;
        for (let i = 0; i < slotCount; i++) {
            const sx = i * slotWidth + slotWidth / 2;
            const divider = Bodies.rectangle(i * slotWidth, height - 25, 6, 150, {
                isStatic: true,
                label: 'divider'
            });
            Composite.add(this.world, divider);
            Renderer.createRectSprite(divider, 6, 150, 0xffd700);

            const sensor = Bodies.rectangle(sx, height - 10, slotWidth - 5, 30, {
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
        const width = document.getElementById('game-container').clientWidth;
        const x = width / 2 + (Math.random() - 0.5) * 60;

        const ball = Bodies.circle(x, -50, 7, {
            restitution: 0.7,
            friction: 0.001,
            label: 'ball'
        });

        this.balls.push(ball);
        Composite.add(this.world, ball);
        Renderer.createCircleSprite(ball, 7, 0xffffff); // Divine White Orbs
    },

    handleCollision(pair) {
        const { bodyA, bodyB } = pair;

        if ((bodyA.label === 'ball' && bodyB.label === 'pin') ||
            (bodyA.label === 'pin' && bodyB.label === 'ball')) {
            const ball = bodyA.label === 'ball' ? bodyA : bodyB;
            Juice.screenShake(0.3);
            Juice.createCollisionParticles(ball.position.x, ball.position.y, 0xffffff);
            Renderer.createPulse(ball.position.x, ball.position.y, 0x00f2ff);

            const pinUpg = UI.upgrades.find(u => u.id === 'pin_mult');
            if (pinUpg.level > 0) UI.updateGold(pinUpg.level * 0.1);
        }

        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('slot_') ? bodyA : (bodyB.label.startsWith('slot_') ? bodyB : null);

        if (ball && slot) {
            const slotIndex = parseInt(slot.label.split('_')[1]);
            const goldEarned = UI.handleScore(slotIndex);

            Juice.createCollisionParticles(ball.position.x, ball.position.y, 0xffd700);
            Juice.createScorePopup(ball.position.x, ball.position.y, `+${goldEarned.toFixed(1)}`);
            Juice.screenShake(4);
            Renderer.createPulse(ball.position.x, ball.position.y, 0xffffff);

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
