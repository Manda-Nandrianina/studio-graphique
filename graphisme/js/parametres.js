// Paramètres Module - Version Firebase (async/await)
const Parametres = {
    autoInterval: null,
    
    init: async function() {
        await this.loadAccountInfo();
        await this.loadStudioInfo();
        this.loadLanguage();
        this.loadTheme();
        this.setupEventListeners();
        this.setupThemeListeners();
        this.setupLangToggle();
        
        // Gestion des utilisateurs (Admin ihany)
const currentUser = Auth.currentUser;
const userManagementSection = document.getElementById('userManagementSection');

if (currentUser && currentUser.role === 'admin') {
    if (userManagementSection) {
        userManagementSection.style.display = 'block';
    }
    await this.loadUsersList();
    
    const createUserBtn = document.getElementById('createUserBtn');
    if (createUserBtn) {
        createUserBtn.addEventListener('click', () => this.createUser());
    }

        } else {
            if (userManagementSection) {
                userManagementSection.style.display = 'none';
            }
        }
    },
    
    loadAccountInfo: async function() {
        try {
            const users = await Storage.getUsers();
            const currentUser = Auth.currentUser;
            
            if (currentUser) {
                const user = users.find(u => u.username === currentUser.username);
                if (user) {
                    document.getElementById('username').value = user.username;
                }
            }
        } catch (error) {
            console.error('Erreur loadAccountInfo:', error);
        }
    },
    
    loadStudioInfo: async function() {
        try {
            const settings = await Storage.getSettings();
            document.getElementById('studioName').value = settings.studioName || 'Studio Graphique';
            document.getElementById('phone').value = settings.phone || '';
            document.getElementById('address').value = settings.address || '';
        } catch (error) {
            console.error('Erreur loadStudioInfo:', error);
        }
    },
    
    loadLanguage: function() {
        const langSelect = document.getElementById('langSelect');
        if (langSelect) {
            langSelect.value = Lang.getCurrentLang();
        }
    },
    
    // ============ THEME ============
    loadTheme: function() {
        const savedTheme = localStorage.getItem('app_theme') || 'light';
        this.setTheme(savedTheme, false);
        
        const autoSettings = document.getElementById('autoThemeSettings');
        if (autoSettings) {
            autoSettings.style.display = savedTheme === 'auto' ? 'block' : 'none';
        }
        
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-theme') === savedTheme) {
                opt.classList.add('active');
            }
        });
    },
    
    setTheme: function(theme, save = true) {
        document.body.classList.remove('dark-mode', 'light-mode');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else if (theme === 'auto') {
            this.applyAutoTheme();
            if (this.autoInterval) clearInterval(this.autoInterval);
            this.autoInterval = setInterval(() => this.applyAutoTheme(), 60000);
        }
        
        if (save) {
            localStorage.setItem('app_theme', theme);
            
            const autoSettings = document.getElementById('autoThemeSettings');
            if (autoSettings) {
                autoSettings.style.display = theme === 'auto' ? 'block' : 'none';
            }
            
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.getAttribute('data-theme') === theme) {
                    opt.classList.add('active');
                }
            });
        }
    },
    
    applyAutoTheme: function() {
        const hour = new Date().getHours();
        const dayStartInput = document.getElementById('dayStartTime');
        const nightStartInput = document.getElementById('nightStartTime');
        
        const dayStart = dayStartInput ? parseInt(dayStartInput.value.split(':')[0]) || 6 : 6;
        const nightStart = nightStartInput ? parseInt(nightStartInput.value.split(':')[0]) || 18 : 18;
        
        document.body.classList.remove('dark-mode', 'light-mode');
        
        if (hour >= nightStart || hour < dayStart) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    },
    
    setupThemeListeners: function() {
        const dayStart = document.getElementById('dayStartTime');
        const nightStart = document.getElementById('nightStartTime');
        
        if (dayStart && nightStart) {
            dayStart.addEventListener('change', () => {
                if (localStorage.getItem('app_theme') === 'auto') {
                    this.applyAutoTheme();
                }
            });
            nightStart.addEventListener('change', () => {
                if (localStorage.getItem('app_theme') === 'auto') {
                    this.applyAutoTheme();
                }
            });
        }
    },
    
    // ============ EVENT LISTENERS ============
    setupEventListeners: function() {
        const accountForm = document.getElementById('accountForm');
        if (accountForm) {
            accountForm.addEventListener('submit', (e) => this.saveAccount(e));
        }
        
        const studioForm = document.getElementById('studioForm');
        if (studioForm) {
            studioForm.addEventListener('submit', (e) => this.saveStudio(e));
        }
        
        const applyLangBtn = document.getElementById('applyLangBtn');
        if (applyLangBtn) {
            applyLangBtn.addEventListener('click', () => this.changeLanguage());
        }
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('importFile').click();
            });
        }
        
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
        }
        
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetData());
        }
    },
    
    // ============ COMPTE ============
    saveAccount: async function(e) {
        e.preventDefault();
        
        try {
            const username = document.getElementById('username').value;
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!username) {
                this.showNotification('Nom d\'utilisateur requis', 'error');
                return;
            }
            
            const users = await Storage.getUsers();
            const currentUser = Auth.currentUser;
            const userIndex = users.findIndex(u => u.username === currentUser.username);
            
            if (userIndex === -1) {
                this.showNotification('Utilisateur non trouvé', 'error');
                return;
            }
            
            if (newPassword || confirmPassword || currentPassword) {
                if (!currentPassword) {
                    this.showNotification('Mot de passe actuel requis', 'error');
                    return;
                }
                
                if (users[userIndex].password !== currentPassword) {
                    this.showNotification('Mot de passe actuel incorrect', 'error');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    this.showNotification('Les mots de passe ne correspondent pas', 'error');
                    return;
                }
                
                if (newPassword.length < 4) {
                    this.showNotification('Le mot de passe doit contenir au moins 4 caractères', 'error');
                    return;
                }
                
                await Storage.updateUserPassword(currentUser.username, newPassword);
            }
            
            if (username !== users[userIndex].username) {
                const existingUser = users.find(u => u.username === username && u.id !== users[userIndex].id);
                if (existingUser) {
                    this.showNotification('Ce nom d\'utilisateur est déjà pris', 'error');
                    return;
                }
                await Storage.updateUsername(currentUser.username, username);
                
                Auth.currentUser.username = username;
                Auth.setCurrentUser(Auth.currentUser);
            }
            
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            this.showNotification('Compte mis à jour avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur saveAccount:', error);
            this.showNotification('Erreur lors de la mise à jour', 'error');
        }
    },
    
    // ============ STUDIO ============
    saveStudio: async function(e) {
        e.preventDefault();
        
        try {
            const settings = {
                studioName: document.getElementById('studioName').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value
            };
            
            await Storage.saveSettings(settings);
            this.showNotification('Informations du studio enregistrées', 'success');
        } catch (error) {
            console.error('Erreur saveStudio:', error);
            this.showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    },
    
    // ============ LANGUE ============
    changeLanguage: function() {
        const langSelect = document.getElementById('langSelect');
        const newLang = langSelect.value;
        
        Lang.setLanguage(newLang);
        
        const langText = document.getElementById('langText');
        if (langText) {
            langText.textContent = newLang === 'mg' ? 'Malagasy' : 'Français';
        }
        
        this.showNotification('Langue changée avec succès', 'success');
    },
    
    setupLangToggle: function() {
        const langToggle = document.getElementById('langToggle');
        const langText = document.getElementById('langText');
        
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLang = Lang.getCurrentLang() === 'mg' ? 'fr' : 'mg';
                Lang.setLanguage(newLang);
                langText.textContent = newLang === 'mg' ? 'Malagasy' : 'Français';
                this.loadLanguage();
            });
        }
    },
    
    // ============ SAUVEGARDE ============
    exportData: async function() {
        try {
            const data = await Storage.exporterDonnees();
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `studio_backup_${new Date().toISOString().slice(0, 19)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Données exportées avec succès', 'success');
        } catch (error) {
            console.error('Erreur exportData:', error);
            this.showNotification('Erreur lors de l\'exportation', 'error');
        }
    },
    
    importData: async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                await Storage.importerDonnees(data);
                this.showNotification('Données importées avec succès. Rafraîchissement...', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                console.error('Erreur importData:', error);
                this.showNotification('Erreur lors de l\'importation: fichier invalide', 'error');
            }
        };
        reader.readAsText(file);
        
        e.target.value = '';
    },
    
    resetData: async function() {
        if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
            try {
                await Storage.resetDonnees();
                this.showNotification('Données réinitialisées. Rafraîchissement...', 'warning');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                console.error('Erreur resetData:', error);
                this.showNotification('Erreur lors de la réinitialisation', 'error');
            }
        }
    },
    
    // ============ GESTION DES UTILISATEURS ============
    
    loadUsersList: async function() {
        try {
            const users = await Storage.getUsers();
            const currentUser = Auth.currentUser;
            
            const otherUsers = users.filter(u => u.username !== currentUser.username);
            
            const container = document.getElementById('usersList');
            if (!container) return;
            
            if (otherUsers.length === 0) {
                container.innerHTML = '<p class="text-center" style="color: var(--gray);">Aucun utilisateur</p>';
                return;
            }
            
            container.innerHTML = otherUsers.map(user => `
                <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border-bottom: 1px solid var(--border);">
                    <div>
                        <strong>${user.username}</strong>
                        <span style="font-size: 0.8rem; color: var(--gray); margin-left: 0.5rem;">${user.role === 'admin' ? 'Admin' : 'User'}</span>
                    </div>
                    <div>
                        <button class="btn-danger" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="Parametres.deleteUser('${user.id}')">Supprimer</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erreur loadUsersList:', error);
        }
    },
    
    createUser: async function() {
        const username = document.getElementById('newUsername')?.value;
        const password = document.getElementById('newPassword')?.value;
        
        if (!username || !password) {
            this.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        if (password.length < 4) {
            this.showNotification('Le mot de passe doit contenir au moins 4 caractères', 'error');
            return;
        }
        
        try {
            const users = await Storage.getUsers();
            const existing = users.find(u => u.username === username);
            
            if (existing) {
                this.showNotification('Ce nom d\'utilisateur existe déjà', 'error');
                return;
            }
            
            const newId = 'user_' + Date.now();
            const newUser = {
                id: newId,
                username: username,
                password: password,
                role: 'user',
                name: username
            };
            
            await database.ref(`users/${newId}`).set(newUser);
            
            document.getElementById('newUsername').value = '';
            document.getElementById('newPassword').value = '';
            
            this.showNotification('Compte créé avec succès!', 'success');
            await this.loadUsersList();
            
        } catch (error) {
            console.error('Erreur création:', error);
            this.showNotification('Erreur lors de la création', 'error');
        }
    },
    
    deleteUser: async function(userId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await database.ref(`users/${userId}`).remove();
                this.showNotification('Utilisateur supprimé', 'success');
                await this.loadUsersList();
            } catch (error) {
                console.error('Erreur suppression:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    },
    
    // ============ NOTIFICATION ============
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// ============ FONCTIONS GLOBALES ============
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

function setTheme(theme) {
    if (window.Parametres) {
        Parametres.setTheme(theme);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('accountForm')) {
        await Parametres.init();
    }
});

window.Parametres = Parametres;
window.togglePassword = togglePassword;
window.setTheme = setTheme;
