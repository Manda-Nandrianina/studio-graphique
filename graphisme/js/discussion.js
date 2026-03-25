// Discussion Module - Version Firebase (async/await) avec son et notification
const Discussion = {
    currentCommandeId: null,
    currentUser: null,
    messageListener: null,
    lastMessageCount: 0, // Ho fitandremana ny isan'ny message
    lastMessageId: null, // Ho fitandremana ny ID message farany
    originalTitle: '', // Ho fitandremana ny titre originale
    
    init: async function() {
        this.currentUser = Auth.currentUser;
        this.originalTitle = document.title;
        
        await this.loadCommandsList();
        this.setupEventListeners();
        this.setupLangToggle();
        
        // Mangataka permission ho an'ny browser notification (miandry ny interaction amin'ny mobile)
        this.setupNotifications();
        
        // Manomboka ny Sound module
        if (window.Sound) {
            Sound.init();
        }
        
        // Fanampiana ho an'ny mobile audio
        this.setupMobileAudio();
    },
    
    setupNotifications: function() {
        if (!('Notification' in window)) return;
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (Notification.permission === 'default') {
            if (!isMobile) {
                // Desktop: mangataka avy hatrany
                Notification.requestPermission();
            } else {
                // Mobile: miandry ny mpampiasa mikasika aloha
                const requestNotificationOnClick = () => {
                    Notification.requestPermission();
                    document.removeEventListener('touchstart', requestNotificationOnClick);
                    document.removeEventListener('click', requestNotificationOnClick);
                };
                document.addEventListener('touchstart', requestNotificationOnClick);
                document.addEventListener('click', requestNotificationOnClick);
            }
        }
    },
    
    setupMobileAudio: function() {
        // Ho an'ny mobile dia mila mikasika ny efijery aloha vao afaka milalao son
        const enableAudioOnTouch = () => {
            if (window.Sound && window.Sound.audioContext && window.Sound.audioContext.state === 'suspended') {
                window.Sound.audioContext.resume().catch(e => console.log('Audio resume error:', e));
            }
            document.removeEventListener('touchstart', enableAudioOnTouch);
            document.removeEventListener('click', enableAudioOnTouch);
        };
        document.addEventListener('touchstart', enableAudioOnTouch);
        document.addEventListener('click', enableAudioOnTouch);
    },
    
    setupEventListeners: function() {
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        const attachBtn = document.getElementById('attachFileBtn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });
        }
        
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    },
    
    loadCommandsList: async function() {
        try {
            const commandes = await Storage.getCommandes();
            const container = document.getElementById('commandsList');
            
            if (!container) return;
            
            if (commandes.length === 0) {
                container.innerHTML = '<div class="empty-commands" data-lang="no_commands">Aucune commande</div>';
                return;
            }
            
            const sorted = commandes.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
            
            container.innerHTML = sorted.map(cmd => {
                const date = new Date(cmd.dateCreation);
                const dateStr = date.toLocaleDateString('fr-FR');
                
                let statusClass = '';
                switch(cmd.statut) {
                    case 'en-attente': statusClass = 'status-en-attente'; break;
                    case 'production': statusClass = 'status-production'; break;
                    case 'termine': statusClass = 'status-termine'; break;
                    default: statusClass = 'status-en-attente';
                }
                const statusText = (Lang.t && Lang.t(`status_${cmd.statut}`)) || cmd.statut;
                
                return `
                    <div class="command-item ${this.currentCommandeId === cmd.id ? 'active' : ''}" 
                         onclick="Discussion.selectCommande('${cmd.id}')">
                        <div class="command-number">${this.escapeHtml(cmd.numero || cmd.id)}</div>
                        <div class="command-client">${this.escapeHtml(cmd.clientName || 'Client')}</div>
                        <div class="command-service">${this.getServiceName(cmd.service)}</div>
                        <div class="command-date">${dateStr}</div>
                        <div class="command-status"><span class="status-badge ${statusClass}">${statusText}</span></div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur loadCommandsList:', error);
        }
    },
    
    getServiceName: function(service) {
        if (!service) return 'Service';
        const services = {
            'cv': (Lang.t && Lang.t('service_cv')) || 'CV',
            'invitation-mariage': (Lang.t && Lang.t('service_invitation_mariage')) || 'Invitation Mariage',
            'invitation-bapteme': (Lang.t && Lang.t('service_invitation_bapteme')) || 'Invitation Baptême',
            'invitation-anniversaire': (Lang.t && Lang.t('service_invitation_anniversaire')) || 'Invitation Anniversaire',
            'logo': (Lang.t && Lang.t('service_logo')) || 'Logo',
            'affiche': (Lang.t && Lang.t('service_affiche')) || 'Affiche'
        };
        return services[service] || service;
    },
    
    selectCommande: async function(id) {
        if (!id) return;
        
        this.currentCommandeId = id;
        
        // Reset ny counter ho an'ity commande ity
        this.lastMessageCount = 0;
        this.lastMessageId = null;
        
        // Reset ny titre
        document.title = this.originalTitle;
        
        // Stopper l'ancien listener
        if (this.messageListener) {
            Storage.off('messages');
        }
        
        const commande = await Storage.getCommandeById(id);
        
        const titleSpan = document.getElementById('selectedCommandTitle');
        if (titleSpan && commande) {
            titleSpan.innerHTML = `${this.escapeHtml(commande.numero || commande.id)} - ${this.escapeHtml(commande.clientName || 'Client')}`;
        }
        
        // Mettre en place le real-time listener
        Storage.onMessagesChanged(id, (messages) => {
            this.displayMessages(messages);
        });
        
        this.loadCommandsList();
    },
    
    displayMessages: function(messages) {
        const container = document.getElementById('messagesContainer');
        
        if (!container) return;
        
        // Jereo raha misy message vaovao
        const currentMessageCount = messages ? messages.length : 0;
        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
        const isNewMessage = currentMessageCount > this.lastMessageCount && 
                             this.lastMessageCount > 0 && 
                             lastMessage && 
                             lastMessage.id !== this.lastMessageId;
        
        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="empty-messages">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p data-lang="no_messages">Aucun message</p>
                </div>
            `;
            this.lastMessageCount = 0;
            this.lastMessageId = null;
            return;
        }
        
        // Tahiry ny toerana misy ny scroll alohan'ny hanovana
        const oldScrollHeight = container.scrollHeight;
        const oldScrollTop = container.scrollTop;
        const isScrolledToBottom = oldScrollHeight - oldScrollTop - container.clientHeight < 50;
        
        // Mamorona ny HTML ho an'ny messages
        container.innerHTML = messages.map(msg => {
            const date = new Date(msg.timestamp);
            const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const isCurrentUser = msg.expediteur === (this.currentUser?.username || this.currentUser?.name);
            
            let fileHtml = '';
            if (msg.fichier && msg.fichier.nom) {
                const isImage = msg.fichier.type && msg.fichier.type.startsWith('image/');
                const fileIcon = isImage ? `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                ` : `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                `;
                
                fileHtml = `
                    <div class="message-file" onclick="Discussion.downloadFile('${msg.id}')">
                        ${fileIcon}
                        <span>${this.escapeHtml(msg.fichier.nom)}</span>
                    </div>
                `;
            }
            
            return `
                <div class="message ${isCurrentUser ? 'message-out' : 'message-in'}">
                    <div class="message-sender">${this.escapeHtml(msg.expediteur)}</div>
                    <div class="message-text">${this.escapeHtml(msg.message || '')}</div>
                    ${fileHtml}
                    <div class="message-time">${timeStr}</div>
                </div>
            `;
        }).join('');
        
        // 🔔 MILALAO SON RAHA MISY MESSAGE VAOVAO SY TSY IZY NO NANDEFA
        if (isNewMessage && lastMessage && lastMessage.expediteur !== (this.currentUser?.username || this.currentUser?.name)) {
            // Milalao son
            if (window.Sound && Sound.playNotification) {
                Sound.playNotification();
            }
            
            // Vibration ho an'ny mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile && 'vibrate' in navigator) {
                const vibrationEnabled = localStorage.getItem('vibration_notification') !== 'false';
                if (vibrationEnabled) {
                    navigator.vibrate(200);
                }
            }
            
            // Mampiseho notification browser raha tsy ao amin'ny onglet ilay pejy
            if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
                const messagePreview = lastMessage.message ? lastMessage.message.substring(0, 50) : (lastMessage.fichier ? '📎 Fichier envoyé' : 'Nouveau message');
                
                new Notification('💬 Studio Graphique', {
                    body: `${lastMessage.expediteur}: ${messagePreview}${lastMessage.message && lastMessage.message.length > 50 ? '...' : ''}`,
                    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"%3E%3Cpath fill="%23e67e22" d="M12 2L2 7l10 5 10-5-10-5z"/%3E%3Cpath fill="%23f39c12" d="M2 17l10 5 10-5"/%3E%3C/svg%3E',
                    tag: 'new-message'
                });
            }
            
            // Mampivily ny tab raha tsy misy olona mijery
            if (document.hidden) {
                document.title = '🔔 ' + (this.originalTitle || 'Studio Graphique');
                setTimeout(() => {
                    if (!document.hidden) {
                        document.title = this.originalTitle;
                    }
                }, 5000);
            }
        }
        
        // Fanavaozana ny counter
        this.lastMessageCount = messages.length;
        if (lastMessage) {
            this.lastMessageId = lastMessage.id;
        }
        
        // Miverina any ambany raha vao nandefa message na efa teo ambany
        if (isScrolledToBottom || (messages.length > 0 && messages[messages.length - 1].expediteur === (this.currentUser?.username || this.currentUser?.name))) {
            container.scrollTop = container.scrollHeight;
        }
    },
    
    sendMessage: async function() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput ? messageInput.value.trim() : '';
        const fileInput = document.getElementById('fileInput');
        
        if (!message && (!fileInput || !fileInput.files[0])) {
            return;
        }
        
        if (!this.currentCommandeId) {
            this.showNotification('Veuillez sélectionner une commande', 'error');
            return;
        }
        
        const messageData = {
            commandeId: this.currentCommandeId,
            expediteur: this.currentUser?.username || this.currentUser?.name || 'user',
            message: message || ''
        };
        
        // Handle file if present
        if (fileInput && fileInput.files[0]) {
            const file = fileInput.files[0];
            const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
            
            if (!allowedTypes.includes(file.type)) {
                this.showNotification('Type de fichier non autorisé. Formats acceptés: PDF, PNG, JPG, GIF, SVG', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Fichier trop volumineux (max 5MB)', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                messageData.fichier = {
                    nom: file.name,
                    type: file.type,
                    data: e.target.result.split(',')[1]
                };
                await this.saveAndSendMessage(messageData);
            };
            reader.readAsDataURL(file);
        } else {
            await this.saveAndSendMessage(messageData);
        }
    },
    
    saveAndSendMessage: async function(messageData) {
        try {
            await Storage.ajouterMessage(messageData);
            
            // Clear inputs
            const messageInput = document.getElementById('messageInput');
            if (messageInput) messageInput.value = '';
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = '';
            this.hideFilePreview();
            
            this.showNotification('Message envoyé', 'success');
        } catch (error) {
            console.error('Erreur envoi message:', error);
            this.showNotification('Erreur lors de l\'envoi', 'error');
        }
    },
    
    handleFileSelect: function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const previewDiv = document.getElementById('filePreview');
        if (!previewDiv) return;
        
        const isImage = file.type.startsWith('image/');
        
        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewDiv.innerHTML = `
                    <div class="file-preview-content">
                        <img src="${e.target.result}" alt="Preview">
                        <span>${this.escapeHtml(file.name)}</span>
                        <button type="button" onclick="Discussion.removeFile()">×</button>
                    </div>
                `;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewDiv.innerHTML = `
                <div class="file-preview-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span>${this.escapeHtml(file.name)}</span>
                    <button type="button" onclick="Discussion.removeFile()">×</button>
                </div>
            `;
            previewDiv.style.display = 'block';
        }
    },
    
    removeFile: function() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        this.hideFilePreview();
    },
    
    hideFilePreview: function() {
        const previewDiv = document.getElementById('filePreview');
        if (previewDiv) {
            previewDiv.style.display = 'none';
            previewDiv.innerHTML = '';
        }
    },
    
    downloadFile: async function(messageId) {
        try {
            const messages = await Storage.getMessages();
            const message = messages.find(m => m.id === messageId);
            
            if (message && message.fichier && message.fichier.data) {
                const byteString = atob(message.fichier.data);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: message.fichier.type || 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = message.fichier.nom || 'fichier';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                this.showNotification('Fichier non disponible', 'error');
            }
        } catch (error) {
            console.error('Erreur download:', error);
            this.showNotification('Erreur lors du téléchargement', 'error');
        }
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    setupLangToggle: function() {
        const langToggle = document.getElementById('langToggle');
        const langText = document.getElementById('langText');
        
        if (langToggle) {
            langToggle.addEventListener('click', async () => {
                if (!Lang || !Lang.getCurrentLang) return;
                const newLang = Lang.getCurrentLang() === 'mg' ? 'fr' : 'mg';
                if (Lang.setLanguage) Lang.setLanguage(newLang);
                if (langText) langText.textContent = newLang === 'mg' ? 'Malagasy' : 'Français';
                await this.loadCommandsList();
                if (this.currentCommandeId) {
                    const commande = await Storage.getCommandeById(this.currentCommandeId);
                    const titleSpan = document.getElementById('selectedCommandTitle');
                    if (titleSpan && commande) {
                        titleSpan.innerHTML = `${commande.numero} - ${commande.clientName || 'Client'}`;
                    }
                }
            });
        }
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<span>${this.escapeHtml(message)}</span>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.remove) notification.remove();
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('commandsList')) {
        await Discussion.init();
    }
});

window.Discussion = Discussion;