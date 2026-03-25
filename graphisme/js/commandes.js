// Commandes Module - Version Firebase (async/await)
const Commandes = {
    currentCommandeId: null,
    
    init: async function() {
        await this.loadStats();
        await this.loadRecentCommands();
        this.setupLangToggle();
        this.setupStatusUpdate();
        
        // Real-time sync pour les commandes
        Storage.onCommandesChanged(async () => {
            await this.loadStats();
            await this.loadRecentCommands();
        });
    },
    
    loadStats: async function() {
        try {
            const commandes = await Storage.getCommandes();
            const total = commandes.length;
            const enAttente = commandes.filter(c => c.statut === 'en-attente').length;
            const production = commandes.filter(c => c.statut === 'production').length;
            const termine = commandes.filter(c => c.statut === 'termine').length;
            
            const statsGrid = document.getElementById('statsGrid');
            if (statsGrid) {
                statsGrid.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 data-lang="total_commands">Total commandes</h3>
                            <p>${total}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 data-lang="pending_commands">En attente</h3>
                            <p>${enAttente}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2"></polygon>
                                <line x1="12" y1="22" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 data-lang="in_production">En production</h3>
                            <p>${production}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <div class="stat-info">
                            <h3 data-lang="completed">Terminées</h3>
                            <p>${termine}</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erreur loadStats:', error);
        }
    },
    
    loadRecentCommands: async function() {
        try {
            const commandes = await Storage.getCommandes();
            const recent = commandes.slice(-10).reverse();
            const tbody = document.getElementById('commandsTableBody');
            
            if (!tbody) return;
            
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center" data-lang="no_commands">Aucune commande</td></tr>';
                return;
            }
            
            tbody.innerHTML = recent.map(cmd => {
                const date = new Date(cmd.dateCreation);
                const dateStr = date.toLocaleDateString('fr-FR');
                
                let statusClass = '';
                let statusText = '';
                
                switch(cmd.statut) {
                    case 'en-attente':
                        statusClass = 'status-en-attente';
                        statusText = Lang.t('status_en_attente');
                        break;
                    case 'production':
                        statusClass = 'status-production';
                        statusText = Lang.t('status_production');
                        break;
                    case 'termine':
                        statusClass = 'status-termine';
                        statusText = Lang.t('status_termine');
                        break;
                    default:
                        statusClass = 'status-en-attente';
                        statusText = cmd.statut;
                }
                
                return `
                    <tr>
                        <td><strong>${cmd.numero || cmd.id}</strong></td>
                        <td>${cmd.clientName || '-'}</td>
                        <td>${this.getServiceName(cmd.service)}</td>
                        <td>${dateStr}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn-details" onclick="Commandes.showDetails('${cmd.id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Détails
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur loadRecentCommands:', error);
        }
    },
    
    getServiceName: function(service) {
        const services = {
            'cv': Lang.t('service_cv'),
            'invitation-mariage': Lang.t('service_invitation_mariage'),
            'invitation-bapteme': Lang.t('service_invitation_bapteme'),
            'invitation-anniversaire': Lang.t('service_invitation_anniversaire'),
            'logo': Lang.t('service_logo'),
            'affiche': Lang.t('service_affiche')
        };
        return services[service] || service;
    },
    
    showDetails: async function(id) {
        try {
            this.currentCommandeId = id;
            const commande = await Storage.getCommandeById(id);
            if (!commande) return;
            
            const modalBody = document.getElementById('detailsModalBody');
            const modal = document.getElementById('detailsModal');
            
            if (modalBody) {
                const date = new Date(commande.dateCreation);
                const deliveryDate = commande.deliveryDate ? new Date(commande.deliveryDate).toLocaleDateString('fr-FR') : 'Non spécifiée';
                
                modalBody.innerHTML = `
                    <div class="details-section">
                        <div class="details-row">
                            <strong>N° commande:</strong>
                            <span>${commande.numero || commande.id}</span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="client_name">Nom du client:</strong>
                            <span>${commande.clientName || '-'}</span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="client_phone">Téléphone:</strong>
                            <span>${commande.clientPhone || '-'}</span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="service_type">Type de service:</strong>
                            <span>${this.getServiceName(commande.service)}</span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="command_date">Date de commande:</strong>
                            <span>${date.toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="delivery_date">Date de livraison:</strong>
                            <span>${deliveryDate}</span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="status">Statut:</strong>
                            <span>
                                <select id="statusSelect" class="status-select">
                                    <option value="en-attente" ${commande.statut === 'en-attente' ? 'selected' : ''} data-lang="status_en_attente">En attente</option>
                                    <option value="production" ${commande.statut === 'production' ? 'selected' : ''} data-lang="status_production">En production</option>
                                    <option value="termine" ${commande.statut === 'termine' ? 'selected' : ''} data-lang="status_termine">Terminé</option>
                                </select>
                            </span>
                        </div>
                        <div class="details-row">
                            <strong data-lang="notes">Remarques:</strong>
                            <span>${commande.notes || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="form-data-section" style="margin-top: 1.5rem;">
                        <h3>Données du formulaire</h3>
                        <div class="form-data-content">
                            ${this.renderFormData(commande)}
                        </div>
                    </div>
                `;
            }
            
            if (modal) {
                modal.style.display = 'flex';
            }
        } catch (error) {
            console.error('Erreur showDetails:', error);
        }
    },
    
    renderFormData: function(commande) {
        if (!commande.formData) return '<p>Aucune donnée</p>';
        
        const data = commande.formData;
        let html = '<div class="form-data-grid">';
        
        for (const [key, value] of Object.entries(data)) {
            if (value && value !== '') {
                const label = this.getFieldLabel(key);
                html += `
                    <div class="form-data-item">
                        <strong>${label}:</strong>
                        <span>${typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    },
    
    getFieldLabel: function(field) {
        const labels = {
            cv_title: 'Titre du CV',
            cv_style: 'Style',
            cv_color: 'Couleur',
            cv_photo: 'Photo',
            cv_pages: 'Nombre de pages',
            cv_info: 'Informations',
            groom_name: 'Nom du marié',
            bride_name: 'Nom de la mariée',
            event_date: 'Date événement',
            event_time: 'Heure',
            event_location: 'Lieu',
            dress_code: 'Code tenue',
            delivery_type: 'Livraison',
            child_name: 'Nom de l\'enfant',
            father_name: 'Nom du père',
            mother_name: 'Nom de la mère',
            celebrated_name: 'Nom du fêté',
            age: 'Âge',
            theme: 'Thème',
            company_name: 'Nom entreprise',
            business_sector: 'Secteur',
            logo_style: 'Style logo',
            logo_colors: 'Couleurs',
            poster_title: 'Titre affiche',
            poster_type: 'Type',
            dimensions: 'Dimensions',
            content: 'Contenu'
        };
        return labels[field] || field;
    },
    
    setupStatusUpdate: function() {
        const updateBtn = document.getElementById('updateStatusBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                const statusSelect = document.getElementById('statusSelect');
                if (statusSelect && this.currentCommandeId) {
                    const newStatus = statusSelect.value;
                    await Storage.updateCommandeStatut(this.currentCommandeId, newStatus);
                    this.showNotification('Statut mis à jour avec succès', 'success');
                    await this.loadStats();
                    await this.loadRecentCommands();
                    await this.showDetails(this.currentCommandeId);
                }
            });
        }
    },
    
    setupLangToggle: function() {
        const langToggle = document.getElementById('langToggle');
        const langText = document.getElementById('langText');
        
        if (langToggle) {
            langToggle.addEventListener('click', async () => {
                const newLang = Lang.getCurrentLang() === 'mg' ? 'fr' : 'mg';
                Lang.setLanguage(newLang);
                langText.textContent = newLang === 'mg' ? 'Malagasy' : 'Français';
                await this.loadStats();
                await this.loadRecentCommands();
                if (this.currentCommandeId) {
                    await this.showDetails(this.currentCommandeId);
                }
            });
        }
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
    Commandes.currentCommandeId = null;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('commandsTableBody')) {
        await Commandes.init();
    }
});

window.Commandes = Commandes;