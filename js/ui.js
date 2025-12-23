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

        // Infinite Notation Configuration
        this.baseSuffixes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d"];

        this.defineUpgrades();
        this.initEvents();
        this.renderUpgrades();
        this.updateGold(0);
        this.renderArtifacts();

        console.log("God-Tier UI Initialized (Infinite Edition)");
    },

    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        const exp = Math.floor(Math.log10(num) / 3);
        const suffix = this.getSuffix(exp);
        const shortVal = num / Math.pow(10, exp * 3);
        return shortVal.toFixed(2) + suffix;
    },

    getSuffix(exp) {
        if (exp < this.baseSuffixes.length) return this.baseSuffixes[exp];

        // Multi-letter suffixes: aa, ab, ..., zz, aaa...
        let e = exp - this.baseSuffixes.length;
        let suffix = "";
        const letters = "abcdefghijklmnopqrstuvwxyz";

        while (e >= 0) {
            suffix = letters[e % 26] + suffix;
            e = Math.floor(e / 26) - 1;
        }
        return suffix;
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

        // Add event listeners for upgrade items to show/hide tooltip
        this.itemsContainer.addEventListener('mouseover', (e) => {
            const item = e.target.closest('.upgrade-item');
            if (item) {
                const upgradeId = item.dataset.upgradeId; // Assuming you add data-upgrade-id to items
                const upg = this.upgrades.find(u => u.id === upgradeId);
                if (upg && this.tooltip) {
                    document.getElementById('tooltip-name').innerText = upg.name;
                    document.getElementById('tooltip-desc').innerText = upg.desc;
                    document.getElementById('tooltip-level').innerText = `LVL ${upg.level}`;
                    document.getElementById('tooltip-cost').innerText = `${this.formatNumber(upg.cost)} G`;
                    this.tooltip.classList.remove('hidden');
                    // Position tooltip (example, adjust as needed)
                    this.tooltip.style.left = `${e.pageX + 10}px`;
                    this.tooltip.style.top = `${e.pageY + 10}px`;
                }
            }
        });

        this.itemsContainer.addEventListener('mouseout', () => {
            if (this.tooltip) {
                this.tooltip.classList.add('hidden');
            }
        });
    },

    renderUpgrades() {
        this.itemsContainer.innerHTML = '';
        this.upgrades.forEach(upg => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.dataset.upgradeId = upg.id; // Add data attribute for tooltip
            if (this.gold < upg.cost) item.style.opacity = '0.6';

            const canAfford = this.gold >= upg.cost;

            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="artifact-icon artifact-${upg.iconType}" style="--a-color: ${this.getCategoryColor(upg.category, upg.level)}"></span>
                    <div class="upgrade-info">
                        <h3>${upg.name}</h3>
                        <span class="upgrade-category">${upg.category}</span>
                    </div>
                </div>
                <p class="upgrade-desc">${upg.desc}</p>
                <div class="upgrade-footer">
                    <div class="upgrade-stats">
                        <span class="stat-row">LEVEL ${upg.level}</span>
                    </div>
                    <button class="buy-btn" ${canAfford ? '' : 'disabled'}>
                        ${this.formatNumber(upg.cost)} G
                    </button>
                </div>
            `;

            item.onclick = () => this.buyUpgrade(upg.id);
            this.itemsContainer.appendChild(item);
        });
    },

    getCategoryColor(cat, level) {
        const hue = (level * 15) % 360;
        return `hsl(${hue}, 80%, 70%)`; // Hundreds of variants by color
    },

    // Rollover tooltips removed as per full-detail panel request

    updateGold(amount) {
        this.gold += amount;
        if (this.goldDisplay) this.goldDisplay.innerText = this.formatNumber(this.gold);

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
            console.log(`Bought ${upg.name}. New Level: ${upg.level}. Cost: ${this.formatNumber(upg.cost)}`);
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
        const baseValue = 10 + (this.getUpgradeLevel('orb_2') * 100);
        const mult = 1 + (dist * 1.5) * (1 + (this.getUpgradeLevel('force_3') * 0.5));
        const added = baseValue * mult;
        this.updateGold(added);

        // Determine Tier (1-26)
        const tier = Math.min(26, Math.max(1, Math.floor(Math.log10(added))));
        return { amount: added, tier: tier, formatted: this.formatNumber(added) };
    },

    handleCollision() {
        // Called from Physics.js
        this.updateGold(0.1 * (1 + this.getUpgradeLevel('orb_3')));
    }
};

window.UI = UI;
