// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTscsaQJkKkZJKNIC7ECeBd0omKlLZbMg",
    authDomain: "studio-graphique.firebaseapp.com",
    databaseURL: "https://studio-graphique-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "studio-graphique",
    storageBucket: "studio-graphique.firebasestorage.app",
    messagingSenderId: "228589800516",
    appId: "1:228589800516:web:485c31458309bcedf38011",
    measurementId: "G-8H8VLV7KRD"
};

// Initialiser Firebase (version compat)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log('✅ Firebase initialized');
console.log('📁 Database URL:', database.ref().toString());

window.database = database;