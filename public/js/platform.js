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
    document.getElementById('authButtons').style.display = 'none';
    
    // Show user info
    const userInfo = document.getElementById('userInfo');
    userInfo.style.display = 'flex';
    
    // Update user display
    document.getElementById('username').textContent = userData.username;
    document.getElementById('userLevel').textContent = `Level ${userData.level || 1}`;
    
    // Set avatar
    const avatarImg = document.getElementById('userAvatar');
    if (userData.avatar) {
        avatarImg.src = userData.avatar;
        avatarImg.style.display = 'block';
    } else {
        avatarImg.style.display = 'none';
    }
}

function updateUIForLoggedOutUser() {
    // Show auth buttons
    document.getElementById('authButtons').style.display = 'flex';
    
    // Hide user info
    document.getElementById('userInfo').style.display = 'none';
    
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
        }
    } catch (error) {
        console.error('Logout error:', error);
        updateUIForLoggedOutUser();
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
    
    // Set avatar
    const profileAvatar = document.getElementById('profileAvatar');
    if (userData.avatar) {
        profileAvatar.src = userData.avatar;
    } else {
        profileAvatar.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjIwIiB5PSIyNiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+RpDwvdGV4dD48L3N2Zz4=";
    }
    
    // Update game-specific progress
    updateGameProgress(userData);
}

function updateGameProgress(userData) {
    // MasterCredits progress
    if (userData.masterCreditsData) {
        const mcData = userData.masterCreditsData;
        document.getElementById('mcLevel').textContent = `Level ${mcData.level || 1}`;
        document.getElementById('mcBalance').textContent = `Balance: ${mcData.balance || 0} MC`;
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
        document.getElementById('captchaImage').src = data.captcha;
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
    showProfile,
    showNotification
};