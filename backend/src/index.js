/**
 * Module d'Impression - Serveur Backend
 * Application de gestion d'impression de cartes avec support NFC
 * Compatible avec imprimante Luca 40 KM Retransfer
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import des routes
const utilisateursRoutes = require('./routes/utilisateurs');
const templatesRoutes = require('./routes/templates');
const impressionRoutes = require('./routes/impression');
const nfcRoutes = require('./routes/nfc');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques (uploads, templates générés)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Routes API
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/impression', impressionRoutes);
app.use('/api/nfc', nfcRoutes);

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
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🖨️  MODULE D'IMPRESSION - SERVEUR DÉMARRÉ              ║
║                                                           ║
║   Port: ${PORT}                                            ║
║   URL: http://localhost:${PORT}                            ║
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

module.exports = app;
