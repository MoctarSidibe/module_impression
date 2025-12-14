/**
 * Routes API pour la gestion des templates de cartes
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const Handlebars = require('handlebars');

/**
 * GET /api/templates
 * Récupérer tous les templates
 */
router.get('/', (req, res) => {
  try {
    const templates = Template.getAll();
    res.json({
      succes: true,
      donnees: templates,
      total: templates.length
    });
  } catch (error) {
    console.error('Erreur récupération templates:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des templates'
    });
  }
});

/**
 * GET /api/templates/types
 * Récupérer les types de templates disponibles
 */
router.get('/types', (req, res) => {
  res.json({
    succes: true,
    donnees: [
      { id: 'carte_identite', nom: 'Carte d\'identité' },
      { id: 'permis_conduire', nom: 'Permis de conduire' },
      { id: 'badge_employe', nom: 'Badge employé' },
      { id: 'carte_etudiant', nom: 'Carte étudiant' },
      { id: 'carte_membre', nom: 'Carte membre' },
      { id: 'carte_acces', nom: 'Carte d\'accès' },
      { id: 'autre', nom: 'Autre' }
    ]
  });
});

/**
 * GET /api/templates/:id
 * Récupérer un template par ID
 */
router.get('/:id', (req, res) => {
  try {
    const template = Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template non trouvé'
      });
    }
    res.json({
      succes: true,
      donnees: template
    });
  } catch (error) {
    console.error('Erreur récupération template:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération du template'
    });
  }
});

/**
 * POST /api/templates
 * Créer un nouveau template
 */
router.post('/',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('html_recto').notEmpty().withMessage('Le HTML du recto est requis')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        succes: false,
        erreurs: errors.array()
      });
    }

    try {
      const template = Template.creer(req.body);
      res.status(201).json({
        succes: true,
        message: 'Template créé avec succès',
        donnees: template
      });
    } catch (error) {
      console.error('Erreur création template:', error);
      res.status(500).json({
        succes: false,
        message: 'Erreur lors de la création du template'
      });
    }
  }
);

/**
 * PUT /api/templates/:id
 * Mettre à jour un template
 */
router.put('/:id', (req, res) => {
  try {
    const template = Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template non trouvé'
      });
    }

    const templateMaj = Template.mettreAJour(req.params.id, req.body);
    res.json({
      succes: true,
      message: 'Template mis à jour avec succès',
      donnees: templateMaj
    });
  } catch (error) {
    console.error('Erreur mise à jour template:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la mise à jour du template'
    });
  }
});

/**
 * POST /api/templates/:id/dupliquer
 * Dupliquer un template
 */
router.post('/:id/dupliquer', (req, res) => {
  try {
    const template = Template.dupliquer(req.params.id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template original non trouvé'
      });
    }
    res.status(201).json({
      succes: true,
      message: 'Template dupliqué avec succès',
      donnees: template
    });
  } catch (error) {
    console.error('Erreur duplication template:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la duplication du template'
    });
  }
});

/**
 * POST /api/templates/:id/apercu
 * Générer un aperçu du template avec des données
 */
router.post('/:id/apercu', (req, res) => {
  try {
    const template = Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template non trouvé'
      });
    }

    const donnees = req.body.donnees || {};

    // Compiler et rendre le template Handlebars
    const templateRecto = Handlebars.compile(template.html_recto);
    const htmlRecto = templateRecto(donnees);

    let htmlVerso = null;
    if (template.html_verso) {
      const templateVerso = Handlebars.compile(template.html_verso);
      htmlVerso = templateVerso(donnees);
    }

    res.json({
      succes: true,
      donnees: {
        html_recto: htmlRecto,
        html_verso: htmlVerso,
        css: template.css
      }
    });
  } catch (error) {
    console.error('Erreur génération aperçu:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la génération de l\'aperçu'
    });
  }
});

/**
 * DELETE /api/templates/:id
 * Supprimer un template
 */
router.delete('/:id', (req, res) => {
  try {
    const template = Template.getById(req.params.id);
    if (!template) {
      return res.status(404).json({
        succes: false,
        message: 'Template non trouvé'
      });
    }

    Template.supprimer(req.params.id);
    res.json({
      succes: true,
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression template:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la suppression du template'
    });
  }
});

module.exports = router;
