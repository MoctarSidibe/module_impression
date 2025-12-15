/**
 * Module d'Impression - Serveur Backend
 * Application de gestion d'impression de cartes avec support NFC NTAG 216
 * Compatible avec imprimante Luca 40 KM Retransfer
 */

console.log('📦 Chargement du module index.js...');

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import des routes
const utilisateursRoutes = require('./routes/utilisateurs');
const templatesRoutes = require('./routes/templates');
const impressionRoutes = require('./routes/impression');
const nfcRoutes = require('./routes/nfc');

// Initialisation de l'application Express
console.log('🚀 Initialisation de l\'application Express...');
const app = express();
const PORT = process.env.PORT || 3001;
console.log(`📌 Port configuré: ${PORT}`);

// Middlewares
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

// Route de santé
app.get('/api/sante', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Module d\'impression opérationnel',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    services: {
      nfc: 'NTAG 216',
      imprimante: 'Luca 40 KM Retransfer',
      carte: 'CR80 (85.6mm x 53.98mm)'
    }
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    nom: 'CardPrint Pro API',
    version: '2.1.0',
    description: 'Module d\'impression de cartes avec encodage NFC NTAG 216',
    documentation: '/api/sante'
  });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({
    succes: false,
    message: `Route non trouvée: ${req.method} ${req.path}`
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
║   🖨️  CARDPRINT PRO - SERVEUR DÉMARRÉ                    ║
║                                                           ║
║   Version: 2.1.0                                          ║
║   Port: ${PORT}                                            ║
║   URL: http://0.0.0.0:${PORT}                              ║
║                                                           ║
║   Routes disponibles:                                     ║
║   - GET  /api/sante            - État du serveur          ║
║   - GET  /api/utilisateurs     - Liste des utilisateurs   ║
║   - GET  /api/templates        - Liste des templates      ║
║   - POST /api/impression       - Lancer une impression    ║
║   - GET  /api/nfc/status       - État du lecteur NFC      ║
║   - GET  /api/imprimante/status - État de l'imprimante    ║
║                                                           ║
║   NFC: NTAG 216 (888 bytes)                               ║
║   Imprimante: Luca 40 KM Retransfer                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
} catch (error) {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
  process.exit(1);
}

module.exports = app;
