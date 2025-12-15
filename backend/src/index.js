/**
 * Module d'Impression - Serveur Backend
 * Application de gestion d'impression de cartes avec support NFC
 * Compatible avec imprimante Luca 40 KM Retransfer
 */

console.log('📦 Chargement du module index.js...');

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import des routes avec gestion d'erreur
let utilisateursRoutes, templatesRoutes, impressionRoutes, nfcRoutes;
try {
  console.log('📥 Chargement route utilisateurs...');
  utilisateursRoutes = require('./routes/utilisateurs');
  console.log('✅ Route utilisateurs chargée');
  
  console.log('📥 Chargement route templates...');
  templatesRoutes = require('./routes/templates');
  console.log('✅ Route templates chargée');
  
  console.log('📥 Chargement route impression...');
  impressionRoutes = require('./routes/impression');
  console.log('✅ Route impression chargée');
  
  console.log('📥 Chargement route nfc...');
  nfcRoutes = require('./routes/nfc');
  console.log('✅ Route nfc chargée');
  
  console.log('✅ Toutes les routes chargées avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Initialisation de l'application Express
console.log('🚀 Initialisation de l\'application Express...');
const app = express();
const PORT = process.env.PORT || 3001;
console.log(`📌 Port configuré: ${PORT}`);

// Middlewares
console.log('⚙️ Configuration des middlewares...');
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
console.log('✅ Middlewares configurés');

// Servir les fichiers statiques (uploads, templates générés)
console.log('📁 Configuration des fichiers statiques...');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Routes API
console.log('🛣️ Configuration des routes API...');
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/impression', impressionRoutes);
app.use('/api/nfc', nfcRoutes);
console.log('✅ Routes API configurées');

// Route de santé
app.get('/api/sante', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Module d\'impression opérationnel',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    succes: false,
    message: 'Erreur serveur interne',
    erreur: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🖨️  MODULE D'IMPRESSION - SERVEUR DÉMARRÉ              ║
║                                                           ║
║   Port: ${PORT}                                            ║
║   URL: http://0.0.0.0:${PORT}                              ║
║                                                           ║
║   Routes disponibles:                                     ║
║   - GET  /api/sante          - État du serveur            ║
║   - GET  /api/utilisateurs   - Liste des utilisateurs     ║
║   - GET  /api/templates      - Liste des templates        ║
║   - POST /api/impression     - Lancer une impression      ║
║   - GET  /api/nfc/status     - État du lecteur NFC        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
} catch (error) {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
  process.exit(1);
}

module.exports = app;
