/**
 * Routes API pour la gestion NFC
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
 * POST /api/nfc/lire
 * Lire une carte NFC
 */
router.post('/lire', async (req, res) => {
  try {
    const { lecteur } = req.body;
    const donnees = await NfcService.lireCarte(lecteur);
    res.json({
      succes: true,
      donnees
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
 * Écrire des données sur une carte NFC
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
      message: result.succes ? 'Données écrites avec succès' : 'Échec de l\'écriture',
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
 * Formater une carte NFC
 */
router.post('/formater', async (req, res) => {
  try {
    const { lecteur } = req.body;
    const result = await NfcService.formaterCarte(lecteur);
    res.json({
      succes: result.succes,
      message: result.succes ? 'Carte formatée avec succès' : 'Échec du formatage',
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
 * Récupérer les types de cartes NFC supportés
 */
router.get('/types-supportes', (req, res) => {
  res.json({
    succes: true,
    donnees: [
      { id: 'MIFARE_CLASSIC_1K', nom: 'MIFARE Classic 1K' },
      { id: 'MIFARE_CLASSIC_4K', nom: 'MIFARE Classic 4K' },
      { id: 'MIFARE_ULTRALIGHT', nom: 'MIFARE Ultralight' },
      { id: 'MIFARE_DESFIRE', nom: 'MIFARE DESFire' },
      { id: 'MIFARE_DESFIRE_EV1', nom: 'MIFARE DESFire EV1' },
      { id: 'MIFARE_DESFIRE_EV2', nom: 'MIFARE DESFire EV2' },
      { id: 'NTAG213', nom: 'NTAG213' },
      { id: 'NTAG215', nom: 'NTAG215' },
      { id: 'NTAG216', nom: 'NTAG216' },
      { id: 'ISO14443A', nom: 'ISO 14443-A' },
      { id: 'ISO14443B', nom: 'ISO 14443-B' },
      { id: 'ISO15693', nom: 'ISO 15693' }
    ]
  });
});

module.exports = router;
