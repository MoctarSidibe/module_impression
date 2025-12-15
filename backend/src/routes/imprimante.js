/**
 * Routes API pour la gestion des imprimantes
 * Compatible avec l'imprimante Luca 40 KM Retransfer
 */

const express = require('express');
const router = express.Router();
const PrinterService = require('../services/PrinterService');

/**
 * GET /api/imprimante/status
 * Récupérer le statut du service d'impression
 */
router.get('/status', async (req, res) => {
  try {
    const status = await PrinterService.getStatus();
    res.json({
      succes: true,
      donnees: status
    });
  } catch (error) {
    console.error('Erreur récupération statut imprimante:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération du statut',
      erreur: error.message
    });
  }
});

/**
 * GET /api/imprimante/liste
 * Lister toutes les imprimantes disponibles
 */
router.get('/liste', async (req, res) => {
  try {
    const result = await PrinterService.getImprimantes();
    res.json({
      succes: true,
      donnees: result
    });
  } catch (error) {
    console.error('Erreur liste imprimantes:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des imprimantes',
      erreur: error.message
    });
  }
});

/**
 * GET /api/imprimante/scanner
 * Forcer un nouveau scan des imprimantes
 */
router.get('/scanner', async (req, res) => {
  try {
    const imprimantes = await PrinterService.scannerImprimantes();
    res.json({
      succes: true,
      donnees: {
        imprimantes,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur scan imprimantes:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors du scan des imprimantes',
      erreur: error.message
    });
  }
});

/**
 * POST /api/imprimante/selectionner
 * Sélectionner une imprimante
 */
router.post('/selectionner', (req, res) => {
  try {
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({
        succes: false,
        message: 'Nom de l\'imprimante requis'
      });
    }

    const result = PrinterService.selectionnerImprimante(nom);
    res.json({
      succes: result.succes,
      donnees: result.imprimante,
      erreur: result.erreur
    });
  } catch (error) {
    console.error('Erreur sélection imprimante:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la sélection de l\'imprimante',
      erreur: error.message
    });
  }
});

/**
 * GET /api/imprimante/prete
 * Vérifier si l'imprimante est prête
 */
router.get('/prete', async (req, res) => {
  try {
    const result = await PrinterService.estPrete();
    res.json({
      succes: true,
      donnees: result
    });
  } catch (error) {
    console.error('Erreur vérification imprimante:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la vérification de l\'imprimante',
      erreur: error.message
    });
  }
});

/**
 * GET /api/imprimante/config
 * Récupérer la configuration de l'imprimante Luca 40 KM
 */
router.get('/config', (req, res) => {
  res.json({
    succes: true,
    donnees: PrinterService.getConfig()
  });
});

module.exports = router;
