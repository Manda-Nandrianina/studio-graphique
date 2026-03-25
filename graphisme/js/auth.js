// Authentication Module - Version simplifiée pour test
const Auth = {
    currentUser: null,
    
    init: async function() {
        this.currentUser = this.getCurrentUser();
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        const toggleBtn = document.getElementById('togglePassword');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePassword());
        }
        
        if (!this.isLoginPage() && !this.checkAuth()) {
            window.location.href = 'login.html';
            return;
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        this.updateUserDisplay();
    },
    
    getCurrentUser: function() {
        const user = localStorage.getItem('studio_current_user');
        return user ? JSON.parse(user) : null;
    },
    
    setCurrentUser: function(user) {
        this.currentUser = user;
        localStorage.setItem('studio_current_user', JSON.stringify(user));
    },
    
    clearCurrentUser: function() {
        this.currentUser = null;
        localStorage.removeItem('studio_current_user');
    },
    
    isLoginPage: function() {
        return window.location.pathname.includes('login.html');
    },
    
    checkAuth: function() {
        return this.currentUser !== null;
    },
    
    togglePassword: function() {
        const passwordInput = document.getElementById('password');
        const eyeOpen = document.querySelector('#togglePassword .eye-open');
        const eyeClosed = document.querySelector('#togglePassword .eye-closed');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    },
    
    handleLogin: async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    const submitBtn = e.target.querySelector('.btn-primary');
    
    // Esory ny erreur teo aloha
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.innerHTML = '';
    }
    
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
            Connexion en cours...
        `;
    }
    
    try {
        const result = await Storage.validateUser(username, password);
        
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Se connecter
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
            `;
        }
        
        if (result.success) {
            this.setCurrentUser(result.user);
            window.location.href = 'dashboard.html';
        } else {
            // Aseho ny erreur eo ambany
            if (errorDiv) {
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>${result.error}</span>
                `;
                
                // Mihozongozona ny container
                const container = document.querySelector('.login-container');
                if (container) {
                    container.style.animation = 'shake 0.5s ease';
                    setTimeout(() => {
                        container.style.animation = '';
                    }, 500);
                }
            }
        }
    } catch (error) {
        console.error('Erreur login:', error);
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Se connecter
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
            `;
        }
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Erreur de connexion au serveur</span>
            `;
        }
    }
},
    logout: function() {
        this.clearCurrentUser();
        window.location.href = 'login.html';
    },
    
    updateUserDisplay: function() {
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = this.currentUser.name || this.currentUser.username;
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();
});

window.Auth = Auth;