/**
 * Routes API pour la gestion des impressions
 */

const express = require('express');
const router = express.Router();
const Impression = require('../models/Impression');
const Utilisateur = require('../models/Utilisateur');
const Template = require('../models/Template');
const PdfService = require('../services/PdfService');
const PrintService = require('../services/PrintService');
const NfcService = require('../services/NfcService');

/**
 * GET /api/impression
 * Récupérer l'historique des impressions
 */
router.get('/', (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 100;
    const impressions = Impression.getAll(limite);
    res.json({
      succes: true,
      donnees: impressions,
      total: impressions.length
    });
  } catch (error) {
    console.error('Erreur récupération impressions:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des impressions'
    });
  }
});

/**
 * GET /api/impression/statistiques
 * Récupérer les statistiques d'impression
 */
router.get('/statistiques', (req, res) => {
  try {
    const stats = Impression.getStatistiques();
    const aujourdhui = Impression.getAujourdhui();
    res.json({
      succes: true,
      donnees: {
        ...stats,
        impressions_aujourdhui: aujourdhui.length
      }
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * GET /api/impression/:id
 * Récupérer une impression par ID
 */
router.get('/:id', (req, res) => {
  try {
    const impression = Impression.getById(req.params.id);
    if (!impression) {
      return res.status(404).json({
        succes: false,
        message: 'Impression non trouvée'
      });
    }
    res.json({
      succes: true,
      donnees: impression
    });
  } catch (error) {
    console.error('Erreur récupération impression:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération de l\'impression'
    });
  }
});

/**
 * POST /api/impression
 * Lancer une nouvelle impression
 */
router.post('/', async (req, res) => {
  try {
    const { utilisateur_id, template_id, encoder_nfc, donnees_nfc, imprimante } = req.body;

    // Vérifier l'utilisateur
    const utilisateur = Utilisateur.getById(utilisateur_id);
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le template
    const template = Template.getById(template_id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template non trouvé'
      });
    }

    // Créer l'enregistrement d'impression
    const impression = Impression.creer({
      utilisateur_id,
      template_id,
      statut: 'en_cours',
      nfc_encode: encoder_nfc || false,
      nfc_donnees: donnees_nfc,
      imprimante: imprimante || 'Luca 40 KM'
    });

    // Générer le PDF
    console.log(`🖨️ Génération du PDF pour l'impression #${impression.id}...`);
    const pdfResult = await PdfService.genererPdfCarte(utilisateur, template);

    if (!pdfResult.succes) {
      Impression.mettreAJourStatut(impression.id, 'erreur', pdfResult.erreur);
      return res.status(500).json({
        succes: false,
        message: 'Erreur lors de la génération du PDF',
        erreur: pdfResult.erreur
      });
    }

    // Mettre à jour le chemin du PDF
    Impression.mettreAJour(impression.id, { pdf_chemin: pdfResult.chemin });

    // Encoder NFC si demandé
    if (encoder_nfc) {
      console.log(`📡 Encodage NFC pour l'impression #${impression.id}...`);
      const nfcResult = await NfcService.encoderCarte(donnees_nfc || {
        uid: utilisateur.nfc_uid,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        numero_carte: utilisateur.numero_carte
      });

      if (!nfcResult.succes) {
        console.warn('⚠️ Échec de l\'encodage NFC:', nfcResult.erreur);
      }
    }

    // Lancer l'impression
    console.log(`🖨️ Envoi vers l'imprimante ${imprimante || 'Luca 40 KM'}...`);
    const printResult = await PrintService.imprimer(pdfResult.chemin, {
      imprimante: imprimante || 'Luca 40 KM',
      copies: 1
    });

    if (!printResult.succes) {
      Impression.mettreAJourStatut(impression.id, 'erreur', printResult.erreur);
      return res.status(500).json({
        succes: false,
        message: 'Erreur lors de l\'impression',
        erreur: printResult.erreur,
        pdf_chemin: pdfResult.chemin
      });
    }

    // Marquer comme terminé
    const impressionFinale = Impression.mettreAJourStatut(impression.id, 'termine');

    res.json({
      succes: true,
      message: 'Impression lancée avec succès',
      donnees: impressionFinale,
      pdf_chemin: pdfResult.chemin
    });

  } catch (error) {
    console.error('Erreur impression:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de l\'impression',
      erreur: error.message
    });
  }
});

/**
 * POST /api/impression/apercu
 * Générer un aperçu PDF sans imprimer
 */
router.post('/apercu', async (req, res) => {
  try {
    const { utilisateur_id, template_id } = req.body;

    const utilisateur = Utilisateur.getById(utilisateur_id);
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const template = Template.getById(template_id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template non trouvé'
      });
    }

    const pdfResult = await PdfService.genererPdfCarte(utilisateur, template);

    if (!pdfResult.succes) {
      return res.status(500).json({
        succes: false,
        message: 'Erreur lors de la génération de l\'aperçu',
        erreur: pdfResult.erreur
      });
    }

    res.json({
      succes: true,
      message: 'Aperçu généré avec succès',
      donnees: {
        pdf_chemin: pdfResult.chemin,
        pdf_url: `/uploads/pdf/${pdfResult.nomFichier}`
      }
    });

  } catch (error) {
    console.error('Erreur génération aperçu:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la génération de l\'aperçu',
      erreur: error.message
    });
  }
});

/**
 * POST /api/impression/:id/reimprimer
 * Réimprimer une impression existante
 */
router.post('/:id/reimprimer', async (req, res) => {
  try {
    const impression = Impression.getById(req.params.id);
    if (!impression) {
      return res.status(404).json({
        succes: false,
        message: 'Impression non trouvée'
      });
    }

    if (!impression.pdf_chemin) {
      return res.status(400).json({
        succes: false,
        message: 'Aucun PDF disponible pour cette impression'
      });
    }

    const printResult = await PrintService.imprimer(impression.pdf_chemin, {
      imprimante: impression.imprimante || 'Luca 40 KM',
      copies: 1
    });

    if (!printResult.succes) {
      return res.status(500).json({
        succes: false,
        message: 'Erreur lors de la réimpression',
        erreur: printResult.erreur
      });
    }

    res.json({
      succes: true,
      message: 'Réimpression lancée avec succès'
    });

  } catch (error) {
    console.error('Erreur réimpression:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la réimpression',
      erreur: error.message
    });
  }
});

module.exports = router;
