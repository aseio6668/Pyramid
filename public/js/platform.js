// AseioTech Pyramid Platform JavaScript
let currentUser = null;
let authModal = null;
let profileModal = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePlatform();
});

function initializePlatform() {
    authModal = document.getElementById('auth-modal');
    profileModal = document.getElementById('profile-modal');
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load captcha for registration
    refreshCaptcha();
}

function setupEventListeners() {
    // Auth form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Modal close events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal') && !e.target.classList.contains('hidden')) {
            closeAuthModal();
            closeProfile();
        }
    });
    
    // Games dropdown functionality
    const gamesBtn = document.querySelector('.games-btn');
    const gamesMenu = document.querySelector('.games-menu');
    
    if (gamesBtn && gamesMenu) {
        gamesBtn.addEventListener('click', function() {
            gamesMenu.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!gamesBtn.contains(e.target) && !gamesMenu.contains(e.target)) {
                gamesMenu.classList.remove('active');
            }
        });
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            updateUIForLoggedInUser(userData);
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(userData) {
    // Hide auth buttons
    document.getElementById('authSection').style.display = 'none';
    
    // Show user info
    const userInfo = document.getElementById('userProfile');
    userInfo.style.display = 'flex';
    
    // Update user display
    document.getElementById('profileUsername').textContent = userData.username;
    
    // Set avatar - use pyramid theme default
    const avatarImg = document.getElementById('profileAvatarIcon');
    const defaultAvatar = "data:image/svg+xml;base64," + btoa(`
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="15" fill="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f4c75 100%)"/>
            <polygon points="15,8 21,21 9,21" fill="#ffd700" stroke="#ffaa00" stroke-width="1"/>
        </svg>
    `);
    
    avatarImg.src = defaultAvatar;
    avatarImg.alt = "Pyramid User";
    avatarImg.style.display = 'block';
}

function updateUIForLoggedOutUser() {
    // Show auth buttons
    document.getElementById('authSection').style.display = 'flex';
    
    // Hide user info
    document.getElementById('userProfile').style.display = 'none';
    
    currentUser = null;
}

// Authentication functions
function showLogin() {
    switchAuthTab('login');
    authModal.classList.remove('hidden');
}

function showRegister() {
    switchAuthTab('register');
    refreshCaptcha();
    authModal.classList.remove('hidden');
}

function closeAuthModal() {
    authModal.classList.add('hidden');
    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        authTitle.textContent = 'Login to Platform';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        authTitle.textContent = 'Create Platform Account';
        refreshCaptcha();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
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
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data;
            updateUIForLoggedInUser(data);
            closeAuthModal();
            showNotification('Welcome to AseioTech Pyramid!', 'success');
            
            // Notify MasterCredits app if it exists
            if (window.app && window.app.checkAuthState) {
                window.app.checkAuthState();
            }
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const email = document.getElementById('backupEmail').value;
    const captcha = document.getElementById('captchaInput').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                username, 
                password, 
                email: email || null, 
                captcha 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data;
            updateUIForLoggedInUser(data);
            closeAuthModal();
            showNotification('Account created! Welcome to AseioTech Pyramid!', 'success');
            
            // Notify MasterCredits app if it exists
            if (window.app && window.app.checkAuthState) {
                window.app.checkAuthState();
            }
        } else {
            showNotification(data.error || 'Registration failed', 'error');
            if (data.error && data.error.includes('captcha')) {
                refreshCaptcha();
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
        refreshCaptcha();
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            updateUIForLoggedOutUser();
            showNotification('Logged out successfully', 'success');
            
            // Notify MasterCredits app if it exists
            if (window.app && window.app.checkAuthState) {
                window.app.checkAuthState();
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
        updateUIForLoggedOutUser();
        
        // Notify MasterCredits app if it exists
        if (window.app && window.app.checkAuthState) {
            window.app.checkAuthState();
        }
    }
}

// Profile functions
function showProfile() {
    if (!currentUser) {
        showLogin();
        return;
    }
    
    loadProfileData();
    profileModal.classList.remove('hidden');
}

function closeProfile() {
    profileModal.classList.add('hidden');
}

async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            updateProfileDisplay(userData);
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

function updateProfileDisplay(userData) {
    // Update basic profile info
    document.getElementById('profileUsername').textContent = userData.username;
    document.getElementById('profileLevel').textContent = `Platform Level ${userData.level || 1}`;
    document.getElementById('profileJoined').textContent = `Joined: ${new Date(userData.createdAt).toLocaleDateString()}`;
    
    // Set avatar with error handling - use pyramid theme
    const profileAvatar = document.getElementById('profileAvatar');
    const defaultAvatar = "data:image/svg+xml;base64," + btoa(`
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f4c75 100%)"/>
            <polygon points="20,10 28,28 12,28" fill="#ffd700" stroke="#ffaa00" stroke-width="1"/>
            <text x="20" y="35" font-family="Arial" font-size="8" fill="#ffd700" text-anchor="middle">🔺</text>
        </svg>
    `);
    
    // Always use default avatar for Pyramid platform since no avatar system exists
    profileAvatar.src = defaultAvatar;
    profileAvatar.alt = "Pyramid User";
    
    // Update game-specific progress
    updateGameProgress(userData);
}

function updateGameProgress(userData) {
    // MasterCredits progress
    if (userData.masterCreditsData) {
        const mcData = userData.masterCreditsData;
        document.getElementById('mcLevel').textContent = `Level ${mcData.level || 1}`;
        
        // Format balance nicely
        const balance = parseFloat(mcData.balance || 0).toFixed(4);
        document.getElementById('mcBalance').textContent = `Balance: ${balance} MC`;
        document.getElementById('mcSkillPoints').textContent = `Skill Points: ${mcData.skillPoints || 0}`;
    } else {
        document.getElementById('mcLevel').textContent = 'Level --';
        document.getElementById('mcBalance').textContent = 'Balance: -- MC';
        document.getElementById('mcSkillPoints').textContent = 'Skill Points: --';
    }
    
    // Pyramid Runner progress (placeholder for now)
    document.getElementById('prHighScore').textContent = 'High Score: --';
    document.getElementById('prLevelsCompleted').textContent = 'Levels: --';
}

// Captcha functions
async function refreshCaptcha() {
    try {
        const response = await fetch('/api/captcha');
        const data = await response.json();
        document.getElementById('captchaImage').src = data.image;
    } catch (error) {
        console.error('Captcha refresh failed:', error);
    }
}

// Settings placeholder
function showSettings() {
    showNotification('Settings coming soon!', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.platform-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `platform-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Allow manual dismissal
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Export for use by games
window.PlatformAPI = {
    getCurrentUser: () => currentUser,
    checkAuthStatus,
    showLogin,
    showRegister,
    showProfile,
    logout,
    showNotification
};