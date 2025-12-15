/**
 * Routes API pour la gestion NFC - NTAG 216
 * Compatible avec les lecteurs PC/SC et imprimante Luca 40 KM
 */

const express = require('express');
const router = express.Router();
const NfcService = require('../services/NfcService');

/**
 * GET /api/nfc/status
 * Récupérer le statut du lecteur NFC
 */
router.get('/status', async (req, res) => {
  try {
    const status = await NfcService.getStatus();
    res.json({
      succes: true,
      donnees: status
    });
  } catch (error) {
    console.error('Erreur récupération statut NFC:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération du statut NFC',
      erreur: error.message
    });
  }
});

/**
 * GET /api/nfc/lecteurs
 * Lister les lecteurs NFC disponibles
 */
router.get('/lecteurs', async (req, res) => {
  try {
    const lecteurs = await NfcService.getLecteurs();
    res.json({
      succes: true,
      donnees: lecteurs
    });
  } catch (error) {
    console.error('Erreur récupération lecteurs:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des lecteurs NFC'
    });
  }
});

/**
 * GET /api/nfc/info-carte
 * Récupérer les informations sur le type de carte NTAG 216
 */
router.get('/info-carte', (req, res) => {
  try {
    const info = NfcService.getInfoCarte();
    res.json({
      succes: true,
      donnees: info
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des infos carte',
      erreur: error.message
    });
  }
});

/**
 * POST /api/nfc/lire
 * Lire une carte NFC NTAG 216
 */
router.post('/lire', async (req, res) => {
  try {
    const { lecteur } = req.body;
    const result = await NfcService.lireCarte(lecteur);
    res.json({
      succes: result.succes,
      simule: result.simule,
      donnees: result.donnees,
      message: result.message,
      erreur: result.erreur
    });
  } catch (error) {
    console.error('Erreur lecture NFC:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la lecture de la carte NFC',
      erreur: error.message
    });
  }
});

/**
 * POST /api/nfc/ecrire
 * Écrire des données sur une carte NFC NTAG 216
 */
router.post('/ecrire', async (req, res) => {
  try {
    const { donnees, lecteur } = req.body;

    if (!donnees) {
      return res.status(400).json({
        succes: false,
        message: 'Données à écrire requises'
      });
    }

    const result = await NfcService.encoderCarte(donnees, lecteur);
    res.json({
      succes: result.succes,
      simule: result.simule,
      uid: result.uid,
      type: result.type,
      tailleEcrite: result.tailleEcrite,
      capaciteRestante: result.capaciteRestante,
      message: result.message || (result.succes ? 'Données écrites avec succès' : 'Échec de l\'écriture'),
      erreur: result.erreur
    });
  } catch (error) {
    console.error('Erreur écriture NFC:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de l\'écriture sur la carte NFC',
      erreur: error.message
    });
  }
});

/**
 * POST /api/nfc/formater
 * Formater une carte NFC NTAG 216
 */
router.post('/formater', async (req, res) => {
  try {
    const { lecteur } = req.body;
    const result = await NfcService.formaterCarte(lecteur);
    res.json({
      succes: result.succes,
      simule: result.simule,
      message: result.message || (result.succes ? 'Carte formatée avec succès' : 'Échec du formatage'),
      erreur: result.erreur
    });
  } catch (error) {
    console.error('Erreur formatage NFC:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors du formatage de la carte NFC',
      erreur: error.message
    });
  }
});

/**
 * GET /api/nfc/types-supportes
 * Récupérer les types de cartes NFC supportés (focus NTAG 216)
 */
router.get('/types-supportes', (req, res) => {
  res.json({
    succes: true,
    typeRecommande: {
      id: 'NTAG_216',
      nom: 'NTAG 216',
      description: 'Carte NFC haute capacité recommandée pour l\'impression Luca 40 KM',
      memoire: '888 bytes',
      uid: '7 bytes'
    },
    donnees: [
      { id: 'NTAG_216', nom: 'NTAG 216', memoire: '888 bytes', recommande: true },
      { id: 'NTAG_215', nom: 'NTAG 215', memoire: '504 bytes', recommande: false },
      { id: 'NTAG_213', nom: 'NTAG 213', memoire: '144 bytes', recommande: false },
      { id: 'MIFARE_ULTRALIGHT', nom: 'MIFARE Ultralight', memoire: '48 bytes', recommande: false },
      { id: 'MIFARE_CLASSIC_1K', nom: 'MIFARE Classic 1K', memoire: '1024 bytes', recommande: false },
      { id: 'MIFARE_DESFIRE', nom: 'MIFARE DESFire', memoire: 'Variable', recommande: false }
    ]
  });
});

module.exports = router;
