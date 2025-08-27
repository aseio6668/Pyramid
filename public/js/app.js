class MasterCreditsApp {
    constructor() {
        this.currentUser = null;
        this.socket = null;
        this.chatVisible = false;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.initSocket();
        this.refreshCaptcha();
    }

    checkAuthState() {
        fetch('/api/user', {
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Not authenticated');
        })
        .then(user => {
            this.currentUser = user;
            this.showMainInterface();
            this.updateUserDisplay();
        })
        .catch(() => {
            this.showAuthInterface();
        });
    }

    setupEventListeners() {
        document.getElementById('avatarUpload').addEventListener('change', this.handleAvatarUpload.bind(this));
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    initSocket() {
        this.socket = io();
        
        this.socket.on('chat-message', (data) => {
            this.displayChatMessage(data);
        });
        
        this.socket.on('chat-error', (error) => {
            this.showNotification(error, 'error');
        });
        
        this.socket.on('connect', () => {
            if (this.currentUser) {
                this.socket.emit('join-chat', {
                    userId: this.currentUser.id,
                    username: this.currentUser.username,
                    level: this.currentUser.level
                });
            }
        });
    }

    showAuthInterface() {
        document.getElementById('auth-section').classList.add('active');
        document.getElementById('home-section').classList.remove('active');
        document.getElementById('games-section').classList.remove('active');
        document.getElementById('profile-section').classList.remove('active');
        document.getElementById('userInfo').style.display = 'none';
    }

    showMainInterface() {
        document.getElementById('auth-section').classList.remove('active');
        document.getElementById('home-section').classList.add('active');
        document.getElementById('userInfo').style.display = 'flex';
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        document.getElementById('username').textContent = this.currentUser.username;
        document.getElementById('userLevel').textContent = `Level ${this.currentUser.level}`;
        // Update main balance (used by games)
        const mainBalance = document.getElementById('mcBalance');
        if (mainBalance) {
            mainBalance.textContent = `MC: ${this.formatMC(this.currentUser.mcBalance)}`;
        }
        
        // Update all section currency displays
        this.updateSectionCurrencyDisplays();
        
        // Update Pyramid Panel
        this.updatePyramidPanel();
        
        // Set avatar or use default
        const avatarPath = this.currentUser.avatarPath || this.getDefaultAvatar();
        document.getElementById('userAvatar').src = avatarPath;

        document.getElementById('profileUsername').textContent = this.currentUser.username;
        document.getElementById('profileLevel').textContent = this.currentUser.level;
        document.getElementById('profileBalance').textContent = `MC: ${this.formatMC(this.currentUser.mcBalance)}`;
        document.getElementById('skillPoints').textContent = this.currentUser.skillPoints || 0;

        document.getElementById('profileAvatar').src = avatarPath;

        this.updateExperienceBar();
        
        // Update talent tree if it exists
        if (window.talentTree) {
            window.talentTree.availablePoints = this.currentUser.skillPoints || 0;
            window.talentTree.updateSkillPointsDisplay();
        }
        
        // Show free funds button if balance is under 1000 MC
        this.updateFreeFundsButton();
    }

    updateSectionCurrencyDisplays() {
        const sectionIds = ['homeMcBalance', 'gamesMcBalance', 'profileMcBalance', 'talentsMcBalance'];
        let displayText = 'Login to view balance';
        
        if (this.currentUser && typeof this.currentUser.mcBalance !== 'undefined') {
            displayText = `MC: ${this.formatMC(this.currentUser.mcBalance)}`;
        }
            
        sectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = displayText;
                element.style.opacity = (this.currentUser && typeof this.currentUser.mcBalance !== 'undefined') ? '1' : '0.6';
            }
        });

        // Update header balance
        const headerBalance = document.getElementById('headerMcBalance');
        if (headerBalance) {
            headerBalance.textContent = displayText;
        }

        // Update game balance with different format
        const gameBalance = document.getElementById('gameMcBalance');
        if (gameBalance) {
            if (this.currentUser && typeof this.currentUser.mcBalance !== 'undefined') {
                gameBalance.textContent = `Balance: ${this.formatMC(this.currentUser.mcBalance)} MC`;
            } else {
                gameBalance.textContent = 'Balance: -- MC';
            }
        }
    }

    updatePyramidPanel() {
        if (this.currentUser) {
            // Show user profile section, hide auth section
            const userProfile = document.getElementById('userProfile');
            const authSection = document.getElementById('authSection');
            
            if (userProfile && authSection) {
                userProfile.style.display = 'flex';
                authSection.style.display = 'none';
                
                // Update profile username
                const profileUsername = document.getElementById('profileUsername');
                if (profileUsername) {
                    profileUsername.textContent = this.currentUser.username;
                }
                
                // Update profile avatar
                const profileAvatarIcon = document.getElementById('profileAvatarIcon');
                if (profileAvatarIcon) {
                    profileAvatarIcon.src = this.currentUser.avatarPath || this.getDefaultAvatar();
                }
            }
        } else {
            // Show auth section, hide user profile
            const userProfile = document.getElementById('userProfile');
            const authSection = document.getElementById('authSection');
            
            if (userProfile && authSection) {
                userProfile.style.display = 'none';
                authSection.style.display = 'flex';
            }
        }
    }

    getDefaultAvatar() {
        const svgData = `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="75" r="70" fill="#4169E1" stroke="#FFD700" stroke-width="5"/>
            <circle cx="60" cy="60" r="8" fill="#FFD700"/>
            <circle cx="90" cy="60" r="8" fill="#FFD700"/>
            <path d="M 55 95 Q 75 115 95 95" stroke="#FFD700" stroke-width="3" fill="none"/>
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svgData)}`;
    }

    updateExperienceBar() {
        const expNeeded = this.currentUser.level * 1000;
        const expProgress = this.currentUser.experience % expNeeded;
        const progressPercent = (expProgress / expNeeded) * 100;

        document.getElementById('expProgress').style.width = `${progressPercent}%`;
        document.getElementById('expText').textContent = `${expProgress} / ${expNeeded}`;
    }

    formatMC(amount) {
        return parseFloat(amount).toFixed(4);
    }
    
    updateFreeFundsButton() {
        const freeFundsContainer = document.getElementById('freeFundsContainer');
        if (!freeFundsContainer) return;
        
        if (this.currentUser && this.currentUser.mcBalance < 1000) {
            freeFundsContainer.style.display = 'block';
        } else {
            freeFundsContainer.style.display = 'none';
        }
    }
    
    async claimFreeFunds() {
        if (!this.currentUser || this.currentUser.mcBalance >= 1000) {
            this.showNotification('You can only claim free funds when you have less than 1000 MC', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/claim-free-funds', {
                method: 'POST',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentUser.mcBalance = result.newBalance;
                this.updateUserDisplay();
                this.showNotification(`Claimed ${this.formatMC(10000)} MC free funds!`, 'success');
            } else {
                this.showNotification(result.message || 'Failed to claim free funds', 'error');
            }
        } catch (error) {
            this.showNotification('Network error while claiming free funds', 'error');
        }
    }

    async refreshCaptcha() {
        try {
            const response = await fetch('/api/captcha');
            const data = await response.json();
            document.getElementById('captchaImage').src = data.image;
        } catch (error) {
            console.error('Failed to load captcha:', error);
        }
    }

    async register(event) {
        event.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const captcha = document.getElementById('captchaInput').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password, captcha })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.showNotification('Registration successful!', 'success');
                this.checkAuthState();
            } else {
                this.showNotification(result.error, 'error');
                this.refreshCaptcha();
            }
        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async login(event) {
        event.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (response.ok) {
                if (result.isAdmin) {
                    window.location.href = '/admin';
                } else {
                    this.showNotification('Login successful!', 'success');
                    this.checkAuthState();
                }
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async logout() {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            this.currentUser = null;
            this.showAuthInterface();
            this.showNotification('Logged out successfully!', 'success');
        } catch (error) {
            this.showNotification('Logout failed.', 'error');
        }
    }

    async requestHandout() {
        try {
            const response = await fetch('/api/handout', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (response.ok) {
                this.currentUser.mcBalance = result.newBalance;
                this.updateUserDisplay();
                this.showNotification(`Received ${this.formatMC(result.amount)} MC!`, 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to get handout.', 'error');
        }
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('Avatar file must be under 2MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        fetch('/api/upload-avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.currentUser.avatarPath = result.avatarPath;
                this.updateUserDisplay();
                this.showNotification('Avatar updated!', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        })
        .catch(() => {
            this.showNotification('Failed to upload avatar', 'error');
        });
    }

    showSection(sectionName) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');
    }

    showAuthTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
        
        if (tabName === 'register') {
            this.refreshCaptcha();
        }
    }

    toggleChat() {
        this.chatVisible = !this.chatVisible;
        const chatContainer = document.getElementById('chat-container');
        
        if (this.chatVisible) {
            chatContainer.classList.remove('hidden');
        } else {
            chatContainer.classList.add('hidden');
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || !this.socket) return;

        this.socket.emit('chat-message', { message });
        input.value = '';
    }

    displayChatMessage(data) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const timestamp = new Date(data.timestamp).toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="chat-header-info">
                <span class="chat-username">[Lv.${data.level}] ${data.username}</span>
                <span class="chat-time">${timestamp}</span>
            </div>
            <div class="chat-text">${this.escapeHtml(data.message)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showAvatarGallery() {
        const gallery = document.getElementById('avatarGallery');
        gallery.innerHTML = '';
        
        // Create sample avatars with different colors and styles
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#AED6F1', '#F7DC6F', '#BB8FCE'];
        const expressions = [
            { eyes: [15, 15, 25, 25], mouth: 'M 12 28 Q 20 35 28 28' }, // happy
            { eyes: [15, 15, 25, 25], mouth: 'M 12 32 Q 20 28 28 32' }, // sad
            { eyes: [13, 15, 27, 15], mouth: 'M 15 30 L 25 30' }, // wink
            { eyes: [15, 15, 25, 25], mouth: 'M 18 28 Q 20 32 22 28' }, // surprised
        ];
        
        for (let i = 0; i < 20; i++) {
            const img = document.createElement('img');
            const color = colors[i % colors.length];
            const expr = expressions[i % expressions.length];
            
            const svgData = `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="35" fill="${color}" stroke="#FFD700" stroke-width="3"/>
                <circle cx="${expr.eyes[0]}" cy="${expr.eyes[1]}" r="3" fill="#FFD700"/>
                <circle cx="${expr.eyes[2]}" cy="${expr.eyes[3]}" r="3" fill="#FFD700"/>
                <path d="${expr.mouth}" stroke="#FFD700" stroke-width="2" fill="none"/>
            </svg>`;
            
            img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
            img.className = 'avatar-option';
            img.onclick = () => this.selectAvatar(img.src);
            img.title = `Avatar ${i + 1}`;
            gallery.appendChild(img);
        }
        
        document.getElementById('avatar-gallery-modal').classList.remove('hidden');
    }

    selectAvatar(avatarPath) {
        fetch('/api/select-avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ avatarPath })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.currentUser.avatarPath = avatarPath;
                this.updateUserDisplay();
                this.closeAvatarGallery();
                this.showNotification('Avatar updated!', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        })
        .catch(() => {
            this.showNotification('Failed to update avatar', 'error');
        });
    }

    closeAvatarGallery() {
        document.getElementById('avatar-gallery-modal').classList.add('hidden');
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const app = new MasterCreditsApp();

// Expose app instance for platform integration
window.app = app;

// Add method for platform integration
window.app.checkAuthState = function() {
    return app.checkAuthState();
};

window.showSection = app.showSection.bind(app);
window.showAuthTab = app.showAuthTab.bind(app);
window.login = app.login.bind(app);
window.register = app.register.bind(app);
window.logout = app.logout.bind(app);
window.requestHandout = app.requestHandout.bind(app);
window.toggleChat = app.toggleChat.bind(app);
window.sendMessage = app.sendMessage.bind(app);
window.refreshCaptcha = app.refreshCaptcha.bind(app);
window.showAvatarGallery = app.showAvatarGallery.bind(app);
window.closeAvatarGallery = app.closeAvatarGallery.bind(app);

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .chat-header-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        margin-bottom: 0.3rem;
        opacity: 0.8;
    }
    
    .chat-username {
        color: var(--gold-color);
        font-weight: 600;
    }
    
    .chat-text {
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);