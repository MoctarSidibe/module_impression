/**
 * Routes API pour la gestion des utilisateurs
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Utilisateur = require('../models/Utilisateur');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration de Multer pour l'upload des photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/photos'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo_${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif/;
    const extname = types.test(path.extname(file.originalname).toLowerCase());
    const mimetype = types.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
    }
  }
});

/**
 * GET /api/utilisateurs
 * Récupérer tous les utilisateurs
 */
router.get('/', (req, res) => {
  try {
    const utilisateurs = Utilisateur.getAll();
    res.json({
      succes: true,
      donnees: utilisateurs,
      total: utilisateurs.length
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

/**
 * GET /api/utilisateurs/recherche
 * Rechercher des utilisateurs
 */
router.get('/recherche', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ succes: true, donnees: [], total: 0 });
    }
    const utilisateurs = Utilisateur.rechercher(q);
    res.json({
      succes: true,
      donnees: utilisateurs,
      total: utilisateurs.length
    });
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la recherche'
    });
  }
});

/**
 * GET /api/utilisateurs/:id
 * Récupérer un utilisateur par ID
 */
router.get('/:id', (req, res) => {
  try {
    const utilisateur = Utilisateur.getById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé'
      });
    }
    res.json({
      succes: true,
      donnees: utilisateur
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

/**
 * POST /api/utilisateurs
 * Créer un nouvel utilisateur
 */
router.post('/',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('email').optional().isEmail().withMessage('Email invalide')
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
      const utilisateur = Utilisateur.creer(req.body);
      res.status(201).json({
        succes: true,
        message: 'Utilisateur créé avec succès',
        donnees: utilisateur
      });
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      res.status(500).json({
        succes: false,
        message: 'Erreur lors de la création de l\'utilisateur'
      });
    }
  }
);

/**
 * POST /api/utilisateurs/:id/photo
 * Uploader une photo pour un utilisateur
 */
router.post('/:id/photo', upload.single('photo'), (req, res) => {
  try {
    const utilisateur = Utilisateur.getById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        succes: false,
        message: 'Aucune photo fournie'
      });
    }

    const photoUrl = `/uploads/photos/${req.file.filename}`;
    const utilisateurMaj = Utilisateur.mettreAJour(req.params.id, { photo_url: photoUrl });

    res.json({
      succes: true,
      message: 'Photo uploadée avec succès',
      donnees: utilisateurMaj
    });
  } catch (error) {
    console.error('Erreur upload photo:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de l\'upload de la photo'
    });
  }
});

/**
 * PUT /api/utilisateurs/:id
 * Mettre à jour un utilisateur
 */
router.put('/:id', (req, res) => {
  try {
    const utilisateur = Utilisateur.getById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const utilisateurMaj = Utilisateur.mettreAJour(req.params.id, req.body);
    res.json({
      succes: true,
      message: 'Utilisateur mis à jour avec succès',
      donnees: utilisateurMaj
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
});

/**
 * DELETE /api/utilisateurs/:id
 * Supprimer un utilisateur
 */
router.delete('/:id', (req, res) => {
  try {
    const utilisateur = Utilisateur.getById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé'
      });
    }

    Utilisateur.supprimer(req.params.id);
    res.json({
      succes: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
});

module.exports = router;
