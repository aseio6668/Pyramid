class TalentTree {
    constructor() {
        this.talents = {};
        this.availablePoints = 0;
        this.init();
    }

    init() {
        this.loadTalents();
        this.setupEventListeners();
    }

    async loadTalents() {
        try {
            const response = await fetch('/api/talents', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (response.ok) {
                this.talents = data.talents;
                this.updateTalentDisplay();
                this.updateTierStates();
            } else {
                console.error('Failed to load talents:', data.error);
            }
        } catch (error) {
            console.error('Failed to load talents:', error);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.talent-node').forEach(node => {
            const talentId = node.dataset.talent;
            
            node.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.shiftKey) {
                    this.decrementTalent(talentId);
                } else {
                    this.incrementTalent(talentId);
                }
            });

            node.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.decrementTalent(talentId);
            });
        });

        const resetBtn = document.getElementById('resetTalentsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAllTalents());
        }
    }

    async incrementTalent(talentId) {
        const currentPoints = this.talents[talentId] || 0;
        if (currentPoints >= 5) {
            this.showNotification('Talent already at maximum rank (5/5)', 'error');
            return;
        }

        if (this.availablePoints <= 0) {
            this.showNotification('No available skill points', 'error');
            return;
        }

        await this.allocateTalent(talentId, currentPoints + 1);
    }

    async decrementTalent(talentId) {
        const currentPoints = this.talents[talentId] || 0;
        if (currentPoints <= 0) {
            this.showNotification('Talent already at minimum rank (0/5)', 'error');
            return;
        }

        await this.allocateTalent(talentId, currentPoints - 1);
    }

    async allocateTalent(talentId, points) {
        try {
            const response = await fetch('/api/talents/allocate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ talentId, points })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.talents[talentId] = points;
                this.availablePoints = result.newSkillPoints;
                this.updateTalentDisplay();
                this.updateTierStates();
                this.updateSkillPointsDisplay();
                
                const action = points > (this.talents[talentId] || 0) ? 'added to' : 'removed from';
                this.showNotification(`Point ${action} ${this.getTalentName(talentId)}`, 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to update talent', 'error');
        }
    }

    async resetAllTalents() {
        if (!confirm('Are you sure you want to reset all talents? This will refund all spent skill points.')) {
            return;
        }

        try {
            const response = await fetch('/api/talents/reset', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (response.ok) {
                this.talents = {};
                this.availablePoints += result.pointsRefunded;
                this.updateTalentDisplay();
                this.updateTierStates();
                this.updateSkillPointsDisplay();
                this.showNotification(`${result.pointsRefunded} skill points refunded`, 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to reset talents', 'error');
        }
    }

    updateTalentDisplay() {
        document.querySelectorAll('.talent-node').forEach(node => {
            const talentId = node.dataset.talent;
            const points = this.talents[talentId] || 0;
            const maxPoints = 5;
            
            const pointsDisplay = node.querySelector('.talent-points');
            if (pointsDisplay) {
                pointsDisplay.textContent = `${points}/${maxPoints}`;
            }

            // Update visual state
            node.classList.remove('talent-empty', 'talent-partial', 'talent-maxed');
            if (points === 0) {
                node.classList.add('talent-empty');
            } else if (points === maxPoints) {
                node.classList.add('talent-maxed');
            } else {
                node.classList.add('talent-partial');
            }

            // Update rank indicators
            const rankDots = node.querySelectorAll('.rank-dot');
            rankDots.forEach((dot, index) => {
                dot.classList.toggle('filled', index < points);
            });
        });
    }

    updateTierStates() {
        const tier1Points = this.getTierPoints(1);
        const tier2Points = this.getTierPoints(2);
        
        // Update tier 2 state
        const tier2 = document.querySelector('.talent-tier[data-tier="2"]');
        if (tier2) {
            if (tier1Points < 5) {
                tier2.classList.add('tier-locked');
                tier2.classList.remove('tier-unlocked');
            } else {
                tier2.classList.remove('tier-locked');
                tier2.classList.add('tier-unlocked');
            }
        }
        
        // Update tier 3 state
        const tier3 = document.querySelector('.talent-tier[data-tier="3"]');
        if (tier3) {
            if (tier2Points < 5) {
                tier3.classList.add('tier-locked');
                tier3.classList.remove('tier-unlocked');
            } else {
                tier3.classList.remove('tier-locked');
                tier3.classList.add('tier-unlocked');
            }
        }
        
        // Update individual talent states
        document.querySelectorAll('.talent-node').forEach(node => {
            const talentId = node.dataset.talent;
            const tier = parseInt(node.closest('.talent-tier').dataset.tier);
            
            let isLocked = false;
            
            if (tier === 2 && tier1Points < 5) {
                isLocked = true;
            } else if (tier === 3) {
                if (tier2Points < 5) {
                    isLocked = true;
                } else if (talentId === 'font-style-mastery' && (this.talents['lore-mastery'] || 0) < 5) {
                    isLocked = true;
                }
            }
            
            node.classList.toggle('talent-locked', isLocked);
        });
    }

    getTierPoints(tier) {
        const tierTalents = {
            1: ['pet-emojis', 'lore-mastery', 'lucky-charm'],
            2: ['avatar-borders', 'chat-colors'],
            3: ['font-style-mastery']
        };
        
        return tierTalents[tier].reduce((sum, talentId) => sum + (this.talents[talentId] || 0), 0);
    }

    getTalentName(talentId) {
        const names = {
            'pet-emojis': 'Pet Emojis',
            'lore-mastery': 'Lore Mastery',
            'lucky-charm': 'Lucky Charm',
            'avatar-borders': 'Avatar Borders',
            'chat-colors': 'Chat Colors',
            'font-style-mastery': 'Font Style Mastery'
        };
        return names[talentId] || talentId;
    }

    updateSkillPointsDisplay() {
        const availablePointsDisplay = document.getElementById('availablePoints');
        if (availablePointsDisplay) {
            availablePointsDisplay.textContent = this.availablePoints;
        }
        
        // Also update profile skill points
        const skillPointsDisplay = document.getElementById('skillPoints');
        if (skillPointsDisplay) {
            skillPointsDisplay.textContent = this.availablePoints;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(45deg, #00ff00, #32cd32)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
                break;
            default:
                notification.style.background = 'linear-gradient(45deg, #0f4c75, #1a1a2e)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize talent tree when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.talentTree = new TalentTree();
});

// Export for use in app.js
window.TalentTree = TalentTree;