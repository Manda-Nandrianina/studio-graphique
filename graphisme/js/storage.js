// Storage Module with Firebase Realtime Database
const Storage = {
    // ============ COMMANDES ============
    getCommandes: async function() {
        try {
            const snapshot = await database.ref('commandes').once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } catch (error) {
            console.error('Erreur getCommandes:', error);
            return [];
        }
    },
    
    ajouterCommande: async function(commande) {
        try {
            const newRef = database.ref('commandes').push();
            const newId = newRef.key;
            const newCommande = {
                ...commande,
                id: newId,
                numero: 'CMD-' + newId.slice(-8).toUpperCase(),
                dateCreation: new Date().toISOString(),
                statut: 'en-attente'
            };
            await newRef.set(newCommande);
            return newCommande;
        } catch (error) {
            console.error('Erreur ajouterCommande:', error);
            throw error;
        }
    },
    
    getCommandeById: async function(id) {
        try {
            const snapshot = await database.ref(`commandes/${id}`).once('value');
            const data = snapshot.val();
            if (!data) return null;
            return { id, ...data };
        } catch (error) {
            console.error('Erreur getCommandeById:', error);
            return null;
        }
    },
    
    updateCommandeStatut: async function(id, statut) {
        try {
            await database.ref(`commandes/${id}/statut`).set(statut);
            return await this.getCommandeById(id);
        } catch (error) {
            console.error('Erreur updateCommandeStatut:', error);
            return null;
        }
    },
    
    updateCommande: async function(id, data) {
        try {
            await database.ref(`commandes/${id}`).update(data);
            return await this.getCommandeById(id);
        } catch (error) {
            console.error('Erreur updateCommande:', error);
            return null;
        }
    },
    
    supprimerCommande: async function(id) {
        try {
            await database.ref(`commandes/${id}`).remove();
        } catch (error) {
            console.error('Erreur supprimerCommande:', error);
        }
    },
    
    // ============ MESSAGES ============
    getMessages: async function() {
        try {
            const snapshot = await database.ref('messages').once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } catch (error) {
            console.error('Erreur getMessages:', error);
            return [];
        }
    },
    
    getMessagesByCommande: async function(commandeId) {
        try {
            const allMessages = await this.getMessages();
            const filtered = allMessages.filter(m => m.commandeId === commandeId);
            return filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } catch (error) {
            console.error('Erreur getMessagesByCommande:', error);
            return [];
        }
    },
    
    ajouterMessage: async function(message) {
        try {
            const newRef = database.ref('messages').push();
            const newId = newRef.key;
            const newMessage = {
                ...message,
                id: newId,
                timestamp: new Date().toISOString()
            };
            await newRef.set(newMessage);
            return newMessage;
        } catch (error) {
            console.error('Erreur ajouterMessage:', error);
            throw error;
        }
    },
    
    // ============ UTILISATEURS ============
    getUsers: async function() {
        try {
            const snapshot = await database.ref('users').once('value');
            const data = snapshot.val();
            if (!data) {
                await this.initDefaultUsers();
                return this.getUsers();
            }
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } catch (error) {
            console.error('Erreur getUsers:', error);
            return [];
        }
    },
    
    initDefaultUsers: async function() {
        try {
            const users = {
                user_Manda_Nandrianina: {
                    id: 'user_Manda_Nandrianina',
                    username: 'Manda Nandrianina',
                    password: 'MiavakaMiel@15042024',
                    role: 'Manda Nandrianina',
                    name: 'Manda Nandrianina'
                },
                user_papou: {
                    id: 'user_papou',
                    username: 'papou',
                    password: 'papou123',
                    role: 'user',
                    name: 'Papou'
                }
            };
            await database.ref('users').set(users);
            console.log('✅ Utilisateurs par défaut créés');
            console.log('👤 Manda Nandrianina: Manda Nandrianina');
            console.log('🔑 Password: MiavakaMiel@15042024');
        } catch (error) {
            console.error('❌ Erreur initDefaultUsers:', error);
        }
    },
    
    getUserByUsername: async function(username) {
        try {
            const users = await this.getUsers();
            return users.find(u => u.username === username);
        } catch (error) {
            console.error('Erreur getUserByUsername:', error);
            return null;
        }
    },
    
    validateUser: async function(username, password) {
        try {
            const users = await this.getUsers();
            const user = users.find(u => u.username === username);
            
            // Raha tsy misy ny username
            if (!user) {
                return { success: false, error: '❌ Nom d\'utilisateur incorrect' };
            }
            
            // Raha misy ny username fa diso ny mot de passe
            if (user && user.password !== password) {
                return { success: false, error: '❌ Mot de passe incorrect' };
            }
            
            // Raha tsara ny roa
            return { 
                success: true, 
                user: { id: user.id, username: user.username, role: user.role, name: user.name } 
            };
            
        } catch (error) {
            console.error('Erreur validateUser:', error);
            return { success: false, error: '❌ Erreur de connexion au serveur' };
        }
    },
    
    updateUserPassword: async function(username, newPassword) {
        try {
            const user = await this.getUserByUsername(username);
            if (user) {
                await database.ref(`users/${user.id}/password`).set(newPassword);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur updateUserPassword:', error);
            return false;
        }
    },
    
    updateUsername: async function(oldUsername, newUsername) {
        try {
            const user = await this.getUserByUsername(oldUsername);
            if (user) {
                await database.ref(`users/${user.id}/username`).set(newUsername);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur updateUsername:', error);
            return false;
        }
    },
    
    // ============ PARAMÈTRES ============
    getSettings: async function() {
        try {
            const snapshot = await database.ref('settings').once('value');
            const data = snapshot.val();
            if (!data) {
                const defaultSettings = {
                    studioName: 'Studio Graphique',
                    phone: '',
                    address: '',
                    version: '1.0.0'
                };
                await database.ref('settings').set(defaultSettings);
                return defaultSettings;
            }
            return data;
        } catch (error) {
            console.error('Erreur getSettings:', error);
            return { studioName: 'Studio Graphique', phone: '', address: '' };
        }
    },
    
    saveSettings: async function(settings) {
        try {
            await database.ref('settings').update(settings);
            return settings;
        } catch (error) {
            console.error('Erreur saveSettings:', error);
            return null;
        }
    },
    
    // ============ LANGUE ============
    getLang: function() {
        const lang = localStorage.getItem('studio_lang');
        return lang || 'mg';
    },
    
    setLang: function(lang) {
        localStorage.setItem('studio_lang', lang);
    },
    
    // ============ EXPORT / IMPORT ============
    exporterDonnees: async function() {
        try {
            const [commandes, messages, settings] = await Promise.all([
                this.getCommandes(),
                this.getMessages(),
                this.getSettings()
            ]);
            return {
                commandes,
                messages,
                settings,
                date: new Date().toISOString()
            };
        } catch (error) {
            console.error('Erreur exporterDonnees:', error);
            return null;
        }
    },
    
    importerDonnees: async function(data) {
        try {
            if (data.commandes) {
                for (const cmd of data.commandes) {
                    await database.ref(`commandes/${cmd.id}`).set(cmd);
                }
            }
            if (data.messages) {
                for (const msg of data.messages) {
                    await database.ref(`messages/${msg.id}`).set(msg);
                }
            }
            if (data.settings) {
                await this.saveSettings(data.settings);
            }
        } catch (error) {
            console.error('Erreur importerDonnees:', error);
            throw error;
        }
    },
    
    resetDonnees: async function() {
        try {
            await database.ref('commandes').remove();
            await database.ref('messages').remove();
            await this.saveSettings({ studioName: 'Studio Graphique', phone: '', address: '' });
        } catch (error) {
            console.error('Erreur resetDonnees:', error);
        }
    },
    
    // ============ REAL-TIME SYNC ============
    onCommandesChanged: function(callback) {
        database.ref('commandes').on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                callback([]);
                return;
            }
            const commandes = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            callback(commandes);
        });
    },
    
    onMessagesChanged: function(commandeId, callback) {
        database.ref('messages').on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                callback([]);
                return;
            }
            const messages = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .filter(m => m.commandeId === commandeId)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            callback(messages);
        });
    },
    
    off: function(ref) {
        if (ref) {
            database.ref(ref).off();
        } else {
            database.ref().off();
        }
    }
};

window.Storage = Storage;