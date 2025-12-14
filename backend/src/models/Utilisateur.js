/**
 * Modèle Utilisateur
 * Gestion des données des personnes pour l'impression de cartes
 */

const db = require('../config/database');

class Utilisateur {
  /**
   * Récupérer tous les utilisateurs
   */
  static getAll() {
    const stmt = db.prepare(`
      SELECT * FROM utilisateurs
      ORDER BY date_modification DESC
    `);
    return stmt.all();
  }

  /**
   * Récupérer un utilisateur par ID
   */
  static getById(id) {
    const stmt = db.prepare('SELECT * FROM utilisateurs WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Récupérer un utilisateur par numéro de carte
   */
  static getByNumeroCarte(numeroCarte) {
    const stmt = db.prepare('SELECT * FROM utilisateurs WHERE numero_carte = ?');
    return stmt.get(numeroCarte);
  }

  /**
   * Rechercher des utilisateurs
   */
  static rechercher(terme) {
    const stmt = db.prepare(`
      SELECT * FROM utilisateurs
      WHERE nom LIKE ? OR prenom LIKE ? OR numero_carte LIKE ? OR email LIKE ?
      ORDER BY nom, prenom
    `);
    const recherche = `%${terme}%`;
    return stmt.all(recherche, recherche, recherche, recherche);
  }

  /**
   * Créer un nouvel utilisateur
   */
  static creer(donnees) {
    const stmt = db.prepare(`
      INSERT INTO utilisateurs (
        numero_carte, nom, prenom, date_naissance, lieu_naissance,
        adresse, ville, code_postal, pays, email, telephone,
        photo_url, numero_permis, categorie_permis,
        date_delivrance, date_expiration, nfc_uid, donnees_supplementaires
      ) VALUES (
        @numero_carte, @nom, @prenom, @date_naissance, @lieu_naissance,
        @adresse, @ville, @code_postal, @pays, @email, @telephone,
        @photo_url, @numero_permis, @categorie_permis,
        @date_delivrance, @date_expiration, @nfc_uid, @donnees_supplementaires
      )
    `);

    const result = stmt.run({
      numero_carte: donnees.numero_carte || null,
      nom: donnees.nom,
      prenom: donnees.prenom,
      date_naissance: donnees.date_naissance || null,
      lieu_naissance: donnees.lieu_naissance || null,
      adresse: donnees.adresse || null,
      ville: donnees.ville || null,
      code_postal: donnees.code_postal || null,
      pays: donnees.pays || 'France',
      email: donnees.email || null,
      telephone: donnees.telephone || null,
      photo_url: donnees.photo_url || null,
      numero_permis: donnees.numero_permis || null,
      categorie_permis: donnees.categorie_permis || null,
      date_delivrance: donnees.date_delivrance || null,
      date_expiration: donnees.date_expiration || null,
      nfc_uid: donnees.nfc_uid || null,
      donnees_supplementaires: donnees.donnees_supplementaires
        ? JSON.stringify(donnees.donnees_supplementaires)
        : null
    });

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Mettre à jour un utilisateur
   */
  static mettreAJour(id, donnees) {
    const champsModifiables = [
      'numero_carte', 'nom', 'prenom', 'date_naissance', 'lieu_naissance',
      'adresse', 'ville', 'code_postal', 'pays', 'email', 'telephone',
      'photo_url', 'numero_permis', 'categorie_permis',
      'date_delivrance', 'date_expiration', 'nfc_uid', 'donnees_supplementaires'
    ];

    const champsAModifier = [];
    const valeurs = [];

    champsModifiables.forEach(champ => {
      if (donnees[champ] !== undefined) {
        champsAModifier.push(`${champ} = ?`);
        let valeur = donnees[champ];
        if (champ === 'donnees_supplementaires' && typeof valeur === 'object') {
          valeur = JSON.stringify(valeur);
        }
        valeurs.push(valeur);
      }
    });

    if (champsAModifier.length === 0) {
      return this.getById(id);
    }

    champsAModifier.push('date_modification = CURRENT_TIMESTAMP');
    valeurs.push(id);

    const sql = `UPDATE utilisateurs SET ${champsAModifier.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...valeurs);

    return this.getById(id);
  }

  /**
   * Supprimer un utilisateur
   */
  static supprimer(id) {
    const stmt = db.prepare('DELETE FROM utilisateurs WHERE id = ?');
    return stmt.run(id);
  }

  /**
   * Compter le nombre d'utilisateurs
   */
  static compter() {
    const stmt = db.prepare('SELECT COUNT(*) as total FROM utilisateurs');
    return stmt.get().total;
  }
}

module.exports = Utilisateur;
