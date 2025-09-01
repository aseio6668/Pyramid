// MasterCredits Casino App - Simplified (No Authentication)
class MasterCreditsApp {
    constructor() {
        this.mcBalance = 100000.0000;
        this.socket = null;
        this.chatVisible = false;
        this.init();
    }

    init() {
        this.loadBalance();
        this.showMainInterface();
        this.updateUserDisplay();
        this.setupEventListeners();
        this.initSocket();
    }

    loadBalance() {
        // Sync with platform balance if available
        if (window.PlatformAPI && window.PlatformAPI.getCurrentBalance) {
            this.mcBalance = window.PlatformAPI.getCurrentBalance();
        } else {
            // Load from local storage
            const saved = localStorage.getItem('mastercredits_balance');
            if (saved) {
                this.mcBalance = parseFloat(saved);
            }
        }
    }

    saveBalance() {
        localStorage.setItem('mastercredits_balance', this.mcBalance.toString());
        // Sync with platform if available
        if (window.PlatformAPI && window.PlatformAPI.updateMCBalance) {
            window.PlatformAPI.updateMCBalance(this.mcBalance);
        }
    }

    updateBalance(newBalance) {
        this.mcBalance = newBalance;
        this.saveBalance();
        this.updateUserDisplay();
    }

    setupEventListeners() {
        // Chat functionality only
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
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
    }

    showMainInterface() {
        document.getElementById('auth-section')?.classList.remove('active');
        document.getElementById('home-section')?.classList.add('active');
        document.getElementById('userInfo').style.display = 'flex';
    }

    updateUserDisplay() {
        document.getElementById('username').textContent = 'Player';
        document.getElementById('userLevel').textContent = 'Level 1';
        
        // Update balance displays
        const balanceElements = [
            document.getElementById('mcBalance'),
            document.getElementById('headerMcBalance'),
            document.getElementById('profileMcBalance')
        ];
        
        balanceElements.forEach(element => {
            if (element) {
                element.textContent = `MC: ${this.formatMC(this.mcBalance)}`;
            }
        });
        
        this.forceBalanceUpdate();
    }

    forceBalanceUpdate() {
        // Update all balance displays
        const elements = document.querySelectorAll('[id*="balance"], [id*="Balance"]');
        elements.forEach(element => {
            if (element.textContent.includes('MC:')) {
                element.textContent = `MC: ${this.formatMC(this.mcBalance)}`;
            }
        });
    }

    formatMC(amount) {
        return parseFloat(amount).toFixed(4);
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Chat functions
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.socket.emit('chat-message', {
                username: 'Player',
                message: message
            });
            input.value = '';
        }
    }

    displayChatMessage(data) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    toggleChat() {
        this.chatVisible = !this.chatVisible;
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.style.display = this.chatVisible ? 'block' : 'none';
        }
    }
}

// Initialize app
const app = new MasterCreditsApp();

// Global functions for HTML
window.app = app;
window.showSection = (section) => {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}-section`)?.classList.add('active');
};
window.toggleChat = () => app.toggleChat();
window.requestHandout = () => {
    const handoutAmount = 10000;
    app.updateBalance(app.mcBalance + handoutAmount);
    app.showNotification(`+${app.formatMC(handoutAmount)} MC Handout!`, 'success');
};
window.logout = () => app.showNotification('No logout needed in simplified mode', 'info');