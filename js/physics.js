/**
 * Physics.js - Matter.js World Setup
 */

const Physics = {
    engine: null,
    render: null,
    world: null,
    pins: [],
    slots: [],
    balls: [],

    init() {
        const { Engine, Render, World, Bodies, Composite } = Matter;

        this.engine = Engine.create();
        this.world = this.engine.world;

        const canvas = document.getElementById('game-canvas');
        const container = document.getElementById('game-container');

        this.render = Render.create({
            canvas: canvas,
            engine: this.engine,
            options: {
                width: container.clientWidth,
                height: container.clientHeight,
                wireframes: false,
                background: 'transparent'
            }
        });

        this.setupArena();

        Render.run(this.render);
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
        const width = this.render.options.width;
        const height = this.render.options.height;

        // Walls
        const wallThickness = 50;
        const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });

        Composite.add(this.world, [leftWall, rightWall]);

        // Pins (Galton Board style)
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

                const pin = Bodies.circle(px, py, 4, {
                    isStatic: true,
                    render: { fillStyle: '#ffffff' },
                    label: 'pin'
                });
                this.pins.push(pin);
                Composite.add(this.world, pin);
            }
        }

        // Slots
        const slotCount = 13;
        const slotWidth = width / slotCount;
        const slotY = height - 40;

        for (let i = 0; i < slotCount; i++) {
            const sx = i * slotWidth + slotWidth / 2;
            // Visible slot dividers
            const divider = Bodies.rectangle(i * slotWidth, height - 25, 4, 50, {
                isStatic: true,
                render: { fillStyle: '#7000ff' }
            });
            Composite.add(this.world, divider);

            // Sensors for scoring
            const sensor = Bodies.rectangle(sx, height - 10, slotWidth - 10, 20, {
                isSensor: true,
                isStatic: true,
                render: { visible: false },
                label: `slot_${i}`
            });
            this.slots.push(sensor);
            Composite.add(this.world, sensor);
        }
    },

    spawnBall() {
        const { Bodies, Composite } = Matter;
        const width = this.render.options.width;
        const x = width / 2 + (Math.random() - 0.5) * 50;

        const ball = Bodies.circle(x, -20, 10, {
            restitution: 0.5,
            friction: 0.1,
            render: {
                fillStyle: '#00f2ff',
                strokeStyle: '#ffffff',
                lineWidth: 2
            },
            label: 'ball'
        });

        this.balls.push(ball);
        Composite.add(this.world, ball);
    },

    handleCollision(pair) {
        const { bodyA, bodyB } = pair;

        // Ball hits pin
        if ((bodyA.label === 'ball' && bodyB.label === 'pin') ||
            (bodyA.label === 'pin' && bodyB.label === 'ball')) {
            const ball = bodyA.label === 'ball' ? bodyA : bodyB;
            Juice.screenShake(0.5);
            Juice.createCollisionParticles(ball.position.x, ball.position.y, '#ffffff');

            // UI gold bonus for pin hit if upgraded
            const pinUpg = UI.upgrades.find(u => u.id === 'pin_mult');
            if (pinUpg.level > 0) {
                UI.updateGold(pinUpg.level * 0.1);
            }
        }

        // Ball hits slot sensor
        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const slot = bodyA.label.startsWith('slot_') ? bodyA : (bodyB.label.startsWith('slot_') ? bodyB : null);

        if (ball && slot) {
            const slotIndex = parseInt(slot.label.split('_')[1]);
            const goldEarned = UI.handleScore(slotIndex);

            Juice.createCollisionParticles(ball.position.x, ball.position.y, '#ffd700');
            Juice.createScorePopup(ball.position.x, ball.position.y, `+${goldEarned.toFixed(1)}`);
            Juice.screenShake(3);

            // Remove ball from world and array
            Matter.Composite.remove(this.world, ball);
            this.balls = this.balls.filter(b => b !== ball);
        }
    }
};

window.Physics = Physics;
