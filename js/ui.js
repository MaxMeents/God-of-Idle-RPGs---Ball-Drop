/**
 * UI.js - Massive Upgrade Overhaul & Divine Currency Pool
 */

const UI = {
    gold: 0,
    artifacts: Array(21).fill(0), // Count for each artifact type
    upgrades: [],

    init() {
        this.goldDisplay = document.getElementById('gold-amount');
        this.upgradePanel = document.getElementById('upgrade-panel');
        this.itemsContainer = document.getElementById('upgrade-items-container');
        this.tooltip = document.getElementById('juice-tooltip');
        this.artifactSlots = document.getElementById('artifact-slots');

        this.defineUpgrades();
        this.initEvents();
        this.renderUpgrades();
        this.updateGold(0);
        this.renderArtifacts();

        console.log("God-Tier UI Initialized");
    },

    defineUpgrades() {
        const categories = [
            { name: "Orb Mastery", prefix: "orb", icon: 4 },
            { name: "Divine Geometry", prefix: "geo", icon: 1 },
            { name: "Cosmic Forces", prefix: "force", icon: 13 },
            { name: "Chrono Manipulation", prefix: "time", icon: 17 },
            { name: "Aetheric Flux", prefix: "aether", icon: 2 }
        ];

        // 50 Distinct Upgrades
        for (let i = 1; i <= 50; i++) {
            const cat = categories[(i - 1) % categories.length];
            this.upgrades.push({
                id: `${cat.prefix}_${i}`,
                name: `${cat.name} IX-${i}`,
                desc: this.getUpgradeDesc(i, cat.prefix),
                cost: Math.floor(10 * Math.pow(1.8, (i / 2))),
                level: 0,
                category: cat.name,
                iconType: (i % 20) + 1
            });
        }
    },

    getUpgradeDesc(index, prefix) {
        const effects = [
            "Increases ball density by 5%.",
            "Enhances collision ripple radius.",
            "Increases gold multiplier by 0.1x.",
            "Slows down time during critical impacts.",
            "Creates phantom orbs on every 10th bounce.",
            "Magnetic attraction for divine gold.",
            "Reduces gravity by 2% per level.",
            "Adds a shimmering trail to all orbs.",
            "Explosive impact on slot entry.",
            "Doubles reward for central slots."
        ];
        return effects[index % effects.length];
    },

    initEvents() {
        document.getElementById('drop-ball-btn').addEventListener('click', () => {
            Physics.spawnBallTriangle(Math.min(100, 100 + (this.getUpgradeLevel('orb_1') * 10)));
        });

        document.getElementById('menu-toggle-btn').addEventListener('click', () => {
            this.upgradePanel.classList.toggle('hidden');
        });

        document.getElementById('close-panel').addEventListener('click', () => {
            this.upgradePanel.classList.add('hidden');
        });
    },

    renderUpgrades() {
        this.itemsContainer.innerHTML = '';
        this.upgrades.forEach(upg => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';

            const icon = document.createElement('span');
            icon.className = `artifact-icon artifact-${upg.iconType}`;
            icon.style.setProperty('--a-color', this.getCategoryColor(upg.category, upg.level));

            item.innerHTML = `
                <div class="upgrade-info">
                    <h3>${upg.name} (LV. ${upg.level})</h3>
                </div>
            `;
            item.prepend(icon);

            // Hyper Juice Hover
            item.onmouseenter = (e) => this.showTooltip(upg, e);
            item.onmouseleave = () => this.hideTooltip();
            item.onclick = () => this.buyUpgrade(upg.id);

            this.itemsContainer.appendChild(item);
        });
    },

    getCategoryColor(cat, level) {
        const hue = (level * 15) % 360;
        return `hsl(${hue}, 80%, 70%)`; // Hundreds of variants by color
    },

    showTooltip(upg, e) {
        const rect = e.target.getBoundingClientRect();
        this.tooltip.classList.remove('hidden');
        this.tooltip.style.top = `${rect.top}px`;

        document.getElementById('tooltip-name').innerText = upg.name;
        document.getElementById('tooltip-desc').innerText = upg.desc;
        document.getElementById('tooltip-level').innerText = `LVL ${upg.level}`;
        document.getElementById('tooltip-cost').innerText = `${upg.cost} G`;

        // Connector logic handled by CSS absolute positioning
    },

    hideTooltip() {
        this.tooltip.classList.add('hidden');
    },

    updateGold(amount) {
        this.gold += amount;
        if (this.goldDisplay) this.goldDisplay.innerText = Math.floor(this.gold).toLocaleString();

        // Check for new artifacts every 1000 gold
        if (amount > 0 && Math.random() > 0.95) {
            this.gainArtifact();
        }
    },

    gainArtifact() {
        const type = Math.floor(Math.random() * 20) + 1;
        this.artifacts[type]++;
        this.renderArtifacts();
        Juice.createScorePopup(window.innerWidth / 2, 100, "NEW ARTIFACT!");
    },

    renderArtifacts() {
        this.artifactSlots.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            if (this.artifacts[i] > 0) {
                const art = document.createElement('div');
                art.className = `artifact-icon artifact-${i}`;
                art.style.setProperty('--a-color', `hsl(${i * 18}, 100%, 70%)`);
                art.title = `Count: ${this.artifacts[i]}`;
                this.artifactSlots.appendChild(art);
            }
        }
    },

    buyUpgrade(id) {
        const upg = this.upgrades.find(u => u.id === id);
        if (this.gold >= upg.cost) {
            this.updateGold(-upg.cost);
            upg.level++;
            upg.cost = Math.floor(upg.cost * 2.2);
            this.renderUpgrades();

            // Trigger specific gameplay effects (simplified hook)
            this.applyUpgradeEffect(upg);
        }
    },

    applyUpgradeEffect(upg) {
        // God-Tier Specialized Effects
        if (upg.id.includes('time')) {
            // Accelerate the physics runner based on level
            const scale = 1 + (upg.level * 0.1);
            Physics.engine.timing.timeScale = scale;
            Renderer.gridTime *= scale;
            console.log(`Time Dilation: ${scale.toFixed(1)}x`);
        }

        if (upg.id.includes('geo')) {
            // Increase pin restitution for more "divine" bounciness
            Physics.pins.forEach(p => {
                p.restitution = Math.min(0.95, 0.6 + (upg.level * 0.05));
            });
        }

        if (upg.id.includes('force')) {
            // Adjust gravity (Celestial Weightlessness)
            Physics.world.gravity.y = Math.max(0.2, 1.0 - (upg.level * 0.05));
            console.log(`Celestial Gravity: ${Physics.world.gravity.y.toFixed(2)}`);
        }

        // Visual "Juice" flare on buy
        Juice.screenShake(5);
        Renderer.createPulse(window.innerWidth / 2, window.innerHeight / 2, 0xffd700);
    },

    getUpgradeLevel(id) {
        const upg = this.upgrades.find(u => u.id === id);
        return upg ? upg.level : 0;
    },

    handleScore(slotIndex) {
        const dist = Math.abs(slotIndex - 9); // middle of 18
        const baseValue = 10 + (this.getUpgradeLevel('orb_2') * 20);
        const mult = 1 + (dist * 0.8) * (1 + (this.getUpgradeLevel('force_3') * 0.2));
        const added = baseValue * mult;
        this.updateGold(added);
        return added;
    },

    handleCollision() {
        // Called from Physics.js
        this.updateGold(0.1 * (1 + this.getUpgradeLevel('orb_3')));
    }
};

window.UI = UI;
