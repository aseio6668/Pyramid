// AseioTech Pyramid Platform - Simple MC Balance Storage
let mcBalance = 100000.0000;
let autoRefreshTimer = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePlatform();
});

function initializePlatform() {
    // Load MC balance from localStorage
    const savedBalance = localStorage.getItem('pyramid_mc_balance');
    if (savedBalance) {
        mcBalance = parseFloat(savedBalance);
    }
    
    updateBalanceDisplay();
    startAutoRefreshMonitoring();
}

function saveBalance() {
    localStorage.setItem('pyramid_mc_balance', mcBalance.toString());
}

function updateBalanceDisplay() {
    // Update balance displays
    const balanceElements = [
        document.getElementById('profileBalance'),
        document.getElementById('mcBalanceDisplay')
    ];
    
    balanceElements.forEach(element => {
        if (element) {
            element.textContent = `MC: ${formatMC(mcBalance)}`;
            
            // Add low balance warning
            if (mcBalance < 10000) {
                element.textContent += ' ⚠️';
                element.style.color = '#ff6b6b';
                element.title = 'Low balance warning: Under 10,000 MC';
            } else {
                element.style.color = '';
                element.title = '';
            }
        }
    });
}

function formatMC(amount) {
    return parseFloat(amount).toFixed(4);
}

function startAutoRefreshMonitoring() {
    // Check balance every 5 seconds and auto-refresh if low
    autoRefreshTimer = setInterval(() => {
        if (mcBalance < 10000) {
            autoRefreshBalance();
        }
    }, 5000);
}

function autoRefreshBalance() {
    const refreshAmount = 100000;
    mcBalance += refreshAmount;
    saveBalance();
    updateBalanceDisplay();
    showNotification(`🎁 Refresh Gift! +${formatMC(refreshAmount)} MC (Balance was low)`, 'success');
}

function manualRefreshGift() {
    if (mcBalance < 10000) {
        autoRefreshBalance();
    } else {
        showNotification('Refresh Gift is only available when balance is under 10,000 MC', 'info');
    }
}

function updateMCBalance(newBalance) {
    mcBalance = newBalance;
    saveBalance();
    updateBalanceDisplay();
}

function getCurrentBalance() {
    return mcBalance;
}

// Notification system
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.platform-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `platform-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Export for use by games
window.PlatformAPI = {
    getCurrentBalance,
    updateMCBalance,
    autoRefreshBalance,
    formatMC,
    showNotification
};

// Global functions for HTML onclick
window.manualRefreshGift = manualRefreshGift;
window.changeGuestName = () => showNotification('Name changing disabled in simplified mode', 'info');