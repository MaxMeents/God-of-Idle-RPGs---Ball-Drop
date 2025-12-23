/**
 * UI.js - Score and Upgrades
 */

const UI = {
    gold: 0,
    upgrades: [
        { id: 'ball_count', name: 'Ball Swarm', desc: 'Auto-drop speed', cost: 10, level: 0 },
        { id: 'ball_value', name: 'Heavy Gold', desc: 'Gold per ball', cost: 25, level: 0 },
        { id: 'pin_mult', name: 'Pin Rich', desc: 'Gold on pin hit', cost: 50, level: 0 }
    ],

    init() {
        this.goldDisplay = document.getElementById('gold-amount');
        this.upgradeMenu = document.getElementById('upgrade-menu');
        this.menuList = document.querySelector('.upgrade-list');

        this.initEvents();

        this.renderUpgrades();
        this.updateGold(0);

        console.log("UI System Initialized");
    },

    initEvents() {
        const dropBtn = document.getElementById('drop-ball-btn');
        if (dropBtn) {
            dropBtn.innerHTML = 'DIVINE DROP <span style="font-size: 0.6em; opacity: 0.7;">(100 ORBS)</span>';
            dropBtn.addEventListener('click', () => {
                Physics.spawnBallTriangle(100);
            });
        }

        const toggleBtn = document.getElementById('menu-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMenu();
            });
        }

        const closeBtn = document.getElementById('close-menu');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.toggleMenu();
            });
        }

        // Auto-drop interval
        setInterval(() => {
            const swarmUpg = this.upgrades.find(u => u.id === 'ball_count'); // Corrected ID to 'ball_count'
            if (swarmUpg.level > 0) {
                // At higher levels, spawn small triangles for swarm
                if (swarmUpg.level > 5) {
                    Physics.spawnBallTriangle(5 + Math.floor(swarmUpg.level / 2));
                } else {
                    for (let i = 0; i < swarmUpg.level; i++) {
                        Physics.spawnBall();
                    }
                }
            }
        }, 1000);
    },

    updateGold(amount) {
        this.gold += amount;
        if (this.goldDisplay) {
            this.goldDisplay.innerText = Math.floor(this.gold);
        }
        this.renderUpgrades(); // Update button states
    },

    handleScore(slotIndex) {
        // Simple multiplier logic based on distance from center
        const center = 6; // middle slot of 13
        const dist = Math.abs(slotIndex - center);

        const ballValueUpg = this.upgrades.find(u => u.id === 'ball_value');
        const baseValue = 1 + (ballValueUpg.level * 2);

        const mult = 1 + (dist * 0.5);
        const added = baseValue * mult;
        this.updateGold(added);
        return added;
    },

    toggleMenu() {
        if (this.upgradeMenu) {
            this.upgradeMenu.classList.toggle('hidden');
        }
    },

    renderUpgrades() {
        if (!this.menuList) return;
        this.menuList.innerHTML = '';
        this.upgrades.forEach(upg => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';

            const canAfford = this.gold >= upg.cost;

            item.innerHTML = `
                <div class="upgrade-info">
                    <h3>${upg.name} (Lv. ${upg.level})</h3>
                    <p>${upg.desc}</p>
                </div>
                <button class="buy-btn" ${canAfford ? '' : 'disabled'}>
                    ${upg.cost} G
                </button>
            `;

            const btn = item.querySelector('.buy-btn');
            btn.addEventListener('click', () => this.buyUpgrade(upg.id));

            this.menuList.appendChild(item);
        });
    },

    buyUpgrade(id) {
        const upg = this.upgrades.find(u => u.id === id);
        if (this.gold >= upg.cost) {
            this.updateGold(-upg.cost);
            upg.level++;
            upg.cost = Math.floor(upg.cost * 1.5);
            this.renderUpgrades();
        }
    }
};

window.UI = UI;
