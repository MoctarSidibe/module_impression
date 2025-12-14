/**
 * Configuration de la base de données SQLite
 * Utilise better-sqlite3 pour des performances optimales
 */

const Database = require('better-sqlite3');
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../../data/module_impression.db');

// Création de la connexion
const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Initialisation des tables
const initDatabase = () => {
  // Table des utilisateurs (personnes à imprimer sur les cartes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_carte TEXT UNIQUE,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      date_naissance TEXT,
      lieu_naissance TEXT,
      adresse TEXT,
      ville TEXT,
      code_postal TEXT,
      pays TEXT DEFAULT 'France',
      email TEXT,
      telephone TEXT,
      photo_url TEXT,
      numero_permis TEXT,
      categorie_permis TEXT,
      date_delivrance TEXT,
      date_expiration TEXT,
      nfc_uid TEXT,
      donnees_supplementaires TEXT,
      date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
      date_modification TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des templates de cartes
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'carte_identite',
      largeur_mm REAL DEFAULT 85.6,
      hauteur_mm REAL DEFAULT 53.98,
      html_recto TEXT NOT NULL,
      html_verso TEXT,
      css TEXT,
      champs_dynamiques TEXT,
      actif INTEGER DEFAULT 1,
      date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
      date_modification TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des impressions (historique)
  db.exec(`
    CREATE TABLE IF NOT EXISTS impressions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utilisateur_id INTEGER,
      template_id INTEGER,
      statut TEXT DEFAULT 'en_attente',
      nfc_encode INTEGER DEFAULT 0,
      nfc_donnees TEXT,
      pdf_chemin TEXT,
      imprimante TEXT,
      erreur TEXT,
      date_impression TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
      FOREIGN KEY (template_id) REFERENCES templates(id)
    )
  `);

  // Table de configuration
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuration (
      cle TEXT PRIMARY KEY,
      valeur TEXT,
      description TEXT
    )
  `);

  // Insérer les configurations par défaut
  const configDefaults = [
    ['imprimante_nom', 'Luca 40 KM', 'Nom de l\'imprimante par défaut'],
    ['nfc_actif', 'true', 'Activer l\'encodage NFC'],
    ['nfc_type', 'MIFARE_DESFIRE', 'Type de puce NFC'],
    ['dpi_impression', '300', 'Résolution d\'impression en DPI'],
    ['format_carte', 'CR80', 'Format de carte (CR80 standard)']
  ];

  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO configuration (cle, valeur, description) VALUES (?, ?, ?)
  `);

  configDefaults.forEach(config => insertConfig.run(...config));

  console.log('✅ Base de données initialisée avec succès');
};

// Initialiser la base de données au chargement du module
try {
  initDatabase();
} catch (error) {
  console.error('❌ Erreur d\'initialisation de la base de données:', error);
}

module.exports = db;
