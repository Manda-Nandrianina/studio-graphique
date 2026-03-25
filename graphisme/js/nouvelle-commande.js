// Nouvelle Commande Module - Version Firebase (async/await)
const NouvelleCommande = {
    currentService: null,
    
    init: async function() {
        this.setupEventListeners();
        this.setupLangToggle();
    },
    
    setupEventListeners: function() {
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', (e) => {
                this.currentService = e.target.value;
                this.loadServiceForm();
            });
        }
        
        const form = document.getElementById('commandeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.saveCommande(e));
        }
    },
    
    loadServiceForm: function() {
        const dynamicForm = document.getElementById('dynamicForm');
        if (!dynamicForm) return;
        
        if (!this.currentService) {
            dynamicForm.innerHTML = '';
            return;
        }
        
        switch(this.currentService) {
            case 'cv':
                dynamicForm.innerHTML = this.getCVForm();
                break;
            case 'invitation-mariage':
                dynamicForm.innerHTML = this.getInvitationMariageForm();
                break;
            case 'invitation-bapteme':
                dynamicForm.innerHTML = this.getInvitationBaptemeForm();
                break;
            case 'invitation-anniversaire':
                dynamicForm.innerHTML = this.getInvitationAnniversaireForm();
                break;
            case 'logo':
                dynamicForm.innerHTML = this.getLogoForm();
                break;
            case 'affiche':
                dynamicForm.innerHTML = this.getAfficheForm();
                break;
            default:
                dynamicForm.innerHTML = '';
        }
        
        // Appliquer la langue aux nouveaux champs
        if (window.Lang) {
            Lang.applyLanguage();
        }
    },
    
    getCVForm: function() {
        return `
            <div class="form-section">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span data-lang="cv_title">Détails du CV</span>
                </h3>
                <div class="form-group">
                    <label data-lang="cv_title">Titre du CV</label>
                    <input type="text" id="cv_title" placeholder="Ex: CV Comptable, CV Designer...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="cv_style">Style</label>
                        <select id="cv_style">
                            <option value="moderne" data-lang="cv_style_modern">Moderne</option>
                            <option value="classique" data-lang="cv_style_classic">Classique</option>
                            <option value="creatif" data-lang="cv_style_creative">Créatif</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-lang="cv_color">Couleur principale</label>
                        <input type="color" id="cv_color" value="#e67e22">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="cv_photo">Photo à insérer?</label>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="cv_photo" value="oui"> <span data-lang="cv_yes">Oui</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="cv_photo" value="non" checked> <span data-lang="cv_no">Non</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label data-lang="cv_pages">Nombre de pages</label>
                        <input type="number" id="cv_pages" min="1" value="1">
                    </div>
                </div>
                <div class="form-group">
                    <label data-lang="cv_info">Informations complémentaires</label>
                    <textarea id="cv_info" rows="3" placeholder="Expérience, formation, compétences..."></textarea>
                </div>
            </div>
        `;
    },
    
    getInvitationMariageForm: function() {
        return `
            <div class="form-section">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span data-lang="mariage_info">Informations mariage</span>
                </h3>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="groom_name">Nom du marié</label>
                        <input type="text" id="groom_name">
                    </div>
                    <div class="form-group">
                        <label data-lang="bride_name">Nom de la mariée</label>
                        <input type="text" id="bride_name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="groom_parents">Parents du marié</label>
                        <input type="text" id="groom_parents">
                    </div>
                    <div class="form-group">
                        <label data-lang="bride_parents">Parents de la mariée</label>
                        <input type="text" id="bride_parents">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="event_date">Date de l'événement</label>
                        <input type="date" id="event_date">
                    </div>
                    <div class="form-group">
                        <label data-lang="event_time">Heure</label>
                        <input type="time" id="event_time">
                    </div>
                </div>
                <div class="form-group">
                    <label data-lang="event_location">Lieu</label>
                    <input type="text" id="event_location" placeholder="Église, salle de réception...">
                </div>
                <div class="form-group">
                    <label data-lang="invitation_text">Texte d'invitation</label>
                    <textarea id="invitation_text" rows="2" placeholder="Nous avons l'honneur de vous convier..."></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="dress_code">Code tenue</label>
                        <select id="dress_code">
                            <option value="blanc" data-lang="dress_code_white">Blanc</option>
                            <option value="colorful" data-lang="dress_code_colorful">Coloré</option>
                            <option value="traditionnel" data-lang="dress_code_traditional">Traditionnel</option>
                            <option value="libre" data-lang="dress_code_free">Libre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-lang="delivery_type">Type de livraison</label>
                        <select id="delivery_type">
                            <option value="papier" data-lang="delivery_paper">Papier</option>
                            <option value="numerique" data-lang="delivery_digital">Numérique</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },
    
    getInvitationBaptemeForm: function() {
        return `
            <div class="form-section">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span data-lang="bapteme_info">Informations baptême</span>
                </h3>
                <div class="form-group">
                    <label data-lang="child_name">Nom de l'enfant</label>
                    <input type="text" id="child_name">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="father_name">Nom du père</label>
                        <input type="text" id="father_name">
                    </div>
                    <div class="form-group">
                        <label data-lang="mother_name">Nom de la mère</label>
                        <input type="text" id="mother_name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="godfather_name">Nom du parrain</label>
                        <input type="text" id="godfather_name">
                    </div>
                    <div class="form-group">
                        <label data-lang="godmother_name">Nom de la marraine</label>
                        <input type="text" id="godmother_name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="event_date">Date du baptême</label>
                        <input type="date" id="event_date">
                    </div>
                    <div class="form-group">
                        <label data-lang="event_time">Heure</label>
                        <input type="time" id="event_time">
                    </div>
                </div>
                <div class="form-group">
                    <label data-lang="church_location">Église / Lieu</label>
                    <input type="text" id="church_location">
                </div>
                <div class="form-group">
                    <label data-lang="reception_location">Lieu de réception</label>
                    <input type="text" id="reception_location">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="dress_code">Code tenue</label>
                        <select id="dress_code">
                            <option value="blanc" data-lang="dress_code_white">Blanc</option>
                            <option value="pastel" data-lang="dress_code_pastel">Pastel</option>
                            <option value="libre" data-lang="dress_code_free">Libre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-lang="delivery_type">Type de livraison</label>
                        <select id="delivery_type">
                            <option value="papier" data-lang="delivery_paper">Papier</option>
                            <option value="numerique" data-lang="delivery_digital">Numérique</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },
    
    getInvitationAnniversaireForm: function() {
        return `
            <div class="form-section">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span data-lang="anniversaire_info">Informations anniversaire</span>
                </h3>
                <div class="form-group">
                    <label data-lang="celebrated_name">Nom du fêté(e)</label>
                    <input type="text" id="celebrated_name">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="age">Âge</label>
                        <input type="number" id="age" min="0" max="120">
                    </div>
                    <div class="form-group">
                        <label data-lang="theme">Thème</label>
                        <input type="text" id="theme" placeholder="Super-héros, Hawaïen, Princesse...">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="event_date">Date de la fête</label>
                        <input type="date" id="event_date">
                    </div>
                    <div class="form-group">
                        <label data-lang="event_time">Heure</label>
                        <input type="time" id="event_time">
                    </div>
                </div>
                <div class="form-group">
                    <label data-lang="event_location">Lieu</label>
                    <input type="text" id="event_location">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="dress_code">Code tenue</label>
                        <select id="dress_code">
                            <option value="theme" data-lang="dress_code_theme">Thème</option>
                            <option value="libre" data-lang="dress_code_free">Libre</option>
                            <option value="decontracte" data-lang="dress_code_casual">Décontracté</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-lang="delivery_type">Type de livraison</label>
                        <select id="delivery_type">
                            <option value="papier" data-lang="delivery_paper">Papier</option>
                            <option value="numerique" data-lang="delivery_digital">Numérique</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },
    
    getLogoForm: function() {
        return `
            <div class="form-section">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <span data-lang="logo_info">Informations logo</span>
                </h3>
                <div class="form-group">
                    <label data-lang="company_name">Nom de l'entreprise / Association</label>
                    <input type="text" id="company_name">
                </div>
                <div class="form-group">
                    <label data-lang="business_sector">Secteur d'activité</label>
                    <input type="text" id="business_sector" placeholder="Ex: Communication, Alimentation, Mode...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="logo_style">Style souhaité</label>
                        <select id="logo_style">
                            <option value="moderne">Moderne</option>
                            <option value="classique">Classique</option>
                            <option value="minimaliste">Minimaliste</option>
                            <option value="luxe">Luxe</option>
                            <option value="fun">Fun / Créatif</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-lang="logo_colors">Couleur(s) souhaitée(s)</label>
                        <input type="text" id="logo_colors" placeholder="Ex: Bleu et orange, Vert, Rouge...">
                    </div>
                </div>
                <div class="form-group">
                    <label data-lang="logo_elements">Éléments à inclure</label>
                    <input type="text" id="logo_elements" placeholder="Ex: Initiales, symbole, animal...">
                </div>
                <div class="form-group">
                    <label data-lang="logo_references">Références / Exemples aimés</label>
                    <textarea id="logo_references" rows="2" placeholder="Donnez des liens ou descriptions de logos que vous aimez..."></textarea>
                </div>
                <div class="form-group">
                    <label data-lang="logo_format">Format souhaité</label>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" name="logo_format" value="png"> PNG
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="logo_format" value="svg"> SVG
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="logo_format" value="pdf"> PDF
                        </label>
                    </div>
                </div>
            </div>
        `;
    },
    
    getAfficheForm: function() {
        return `
            <div class="form-section">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    <span data-lang="affiche_info">Informations affiche</span>
                </h3>
                <div class="form-group">
                    <label data-lang="poster_title">Titre de l'affiche</label>
                    <input type="text" id="poster_title" placeholder="Ex: Grande vente, Concert, Événement...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="poster_type">Type</label>
                        <select id="poster_type">
                            <option value="publicite" data-lang="poster_type_pub">Publicité</option>
                            <option value="evenement" data-lang="poster_type_event">Événement</option>
                            <option value="information" data-lang="poster_type_info">Information</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-lang="dimensions">Dimensions</label>
                        <select id="dimensions">
                            <option value="a3">A3 (297 x 420 mm)</option>
                            <option value="a4">A4 (210 x 297 mm)</option>
                            <option value="carre">Carré (500 x 500 mm)</option>
                            <option value="personnalise">Personnalisé</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label data-lang="content">Contenu principal</label>
                    <textarea id="content" rows="3" placeholder="Texte principal, informations à faire apparaître..."></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label data-lang="dominant_color">Couleur dominante</label>
                        <input type="color" id="dominant_color" value="#e67e22">
                    </div>
                    <div class="form-group">
                        <label data-lang="has_images">Images à inclure?</label>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="has_images" value="oui"> Oui
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="has_images" value="non" checked> Non
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    saveCommande: async function(e) {
        e.preventDefault();
        
        try {
            // Récupérer les informations client
            const clientName = document.getElementById('clientName').value;
            if (!clientName) {
                this.showNotification('Veuillez entrer le nom du client', 'error');
                return;
            }
            
            const clientPhone = document.getElementById('clientPhone').value;
            const deliveryDate = document.getElementById('deliveryDate').value;
            const notes = document.getElementById('notes').value;
            const service = this.currentService;
            
            if (!service) {
                this.showNotification('Veuillez sélectionner un service', 'error');
                return;
            }
            
            // Récupérer les données du formulaire dynamique
            const formData = this.getFormData();
            
            // Créer la commande
            const commande = {
                clientName: clientName,
                clientPhone: clientPhone,
                deliveryDate: deliveryDate,
                notes: notes,
                service: service,
                formData: formData
            };
            
            // Sauvegarder
            const saved = await Storage.ajouterCommande(commande);
            
            this.showNotification('Commande enregistrée avec succès! N°: ' + saved.numero, 'success');
            
            // Réinitialiser le formulaire
            document.getElementById('commandeForm').reset();
            document.getElementById('dynamicForm').innerHTML = '';
            document.getElementById('serviceType').value = '';
            this.currentService = null;
            
            // Rediriger après 2 secondes
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Erreur saveCommande:', error);
            this.showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    },
    
    getFormData: function() {
        const formData = {};
        const dynamicForm = document.getElementById('dynamicForm');
        if (!dynamicForm) return formData;
        
        const inputs = dynamicForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const id = input.id;
            if (id && input.type !== 'radio') {
                formData[id] = input.value;
            } else if (input.type === 'radio' && input.checked) {
                formData[input.name] = input.value;
            }
        });
        
        // Gérer les checkbox groups
        const checkboxes = dynamicForm.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            const checkboxValues = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    checkboxValues.push(cb.value);
                }
            });
            if (checkboxValues.length > 0) {
                formData[checkboxes[0].name] = checkboxValues;
            }
        }
        
        return formData;
    },
    
    setupLangToggle: function() {
        const langToggle = document.getElementById('langToggle');
        const langText = document.getElementById('langText');
        
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLang = Lang.getCurrentLang() === 'mg' ? 'fr' : 'mg';
                Lang.setLanguage(newLang);
                langText.textContent = newLang === 'mg' ? 'Malagasy' : 'Français';
                this.loadServiceForm();
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

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('commandeForm')) {
        await NouvelleCommande.init();
    }
});

window.NouvelleCommande = NouvelleCommande;