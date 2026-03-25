// Sound Notification Module - Compatible Mobile
const Sound = {
    audioContext: null,
    isEnabled: true,
    isMobile: false,
    
    init: function() {
        // Jereo raha mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Jereo raha toa ka tian'ny mpampiasa ny son
        const savedSetting = localStorage.getItem('sound_notification');
        this.isEnabled = savedSetting !== null ? savedSetting === 'true' : true;
        
        // Mamorona audio context (milalao son tsy mila fichier)
        try {
            // Mila atao amin'ny interaction ny fanombohana audio amin'ny mobile
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Amin'ny mobile dia tsy maintsy miandry ny interaction voalohany
            if (this.isMobile) {
                this.audioContext.suspend();
                
                // Manomboka ny audioContext rehefa mikasika ny efijery
                const resumeAudio = () => {
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                    document.removeEventListener('touchstart', resumeAudio);
                    document.removeEventListener('click', resumeAudio);
                };
                document.addEventListener('touchstart', resumeAudio);
                document.addEventListener('click', resumeAudio);
            }
        } catch(e) {
            console.log('Web Audio API not supported');
            this.isEnabled = false;
        }
    },
    
    playNotification: function() {
        if (!this.isEnabled || !this.audioContext) return;
        
        // Amin'ny mobile dia mila atao resume aloha
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            const now = this.audioContext.currentTime;
            
            // Son 1: 880 Hz
            const oscillator1 = this.audioContext.createOscillator();
            const gainNode1 = this.audioContext.createGain();
            oscillator1.connect(gainNode1);
            gainNode1.connect(this.audioContext.destination);
            oscillator1.frequency.value = 880;
            gainNode1.gain.value = 0.3;
            oscillator1.start();
            gainNode1.gain.exponentialRampToValueAtTime(0.00001, now + 0.25);
            oscillator1.stop(now + 0.25);
            
            // Son 2: 660 Hz (miandry kely)
            setTimeout(() => {
                if (this.audioContext && this.audioContext.state === 'running') {
                    const oscillator2 = this.audioContext.createOscillator();
                    const gainNode2 = this.audioContext.createGain();
                    oscillator2.connect(gainNode2);
                    gainNode2.connect(this.audioContext.destination);
                    oscillator2.frequency.value = 660;
                    gainNode2.gain.value = 0.2;
                    oscillator2.start();
                    gainNode2.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.25);
                    oscillator2.stop(this.audioContext.currentTime + 0.25);
                }
            }, 120);
            
            // Vibration amin'ny mobile (raha misy)
            if (this.isMobile && 'vibrate' in navigator) {
                navigator.vibrate(200);
            }
        } catch(e) {
            console.log('Erreur play sound:', e);
            // Raha tsy mandeha dia andramo ny audio HTML5
            this.playFallbackSound();
        }
    },
    
    playFallbackSound: function() {
        // Fallback: mampiasa Audio HTML5 (son beep)
        try {
            const audio = new Audio('data:audio/wav;base64,U3RlYW0gaXMgYSBzb3VuZA==');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio fallback failed'));
        } catch(e) {
            console.log('No sound available');
        }
    },
    
    enable: function() {
        this.isEnabled = true;
        localStorage.setItem('sound_notification', 'true');
    },
    
    disable: function() {
        this.isEnabled = false;
        localStorage.setItem('sound_notification', 'false');
    },
    
    toggle: function() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
            this.playNotification(); // Mba hampiseho fa miasa
        }
        return this.isEnabled;
    }
};

window.Sound = Sound;