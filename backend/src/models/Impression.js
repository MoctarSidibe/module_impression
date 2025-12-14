/**
 * Modèle Impression
 * Gestion de l'historique des impressions
 */

const db = require('../config/database');

class Impression {
  /**
   * Récupérer toutes les impressions
   */
  static getAll(limite = 100) {
    const stmt = db.prepare(`
      SELECT
        i.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        t.nom as template_nom
      FROM impressions i
      LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
      LEFT JOIN templates t ON i.template_id = t.id
      ORDER BY i.date_impression DESC
      LIMIT ?
    `);
    return stmt.all(limite);
  }

  /**
   * Récupérer une impression par ID
   */
  static getById(id) {
    const stmt = db.prepare(`
      SELECT
        i.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        t.nom as template_nom
      FROM impressions i
      LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
      LEFT JOIN templates t ON i.template_id = t.id
      WHERE i.id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Récupérer les impressions d'un utilisateur
   */
  static getByUtilisateur(utilisateurId) {
    const stmt = db.prepare(`
      SELECT
        i.*,
        t.nom as template_nom
      FROM impressions i
      LEFT JOIN templates t ON i.template_id = t.id
      WHERE i.utilisateur_id = ?
      ORDER BY i.date_impression DESC
    `);
    return stmt.all(utilisateurId);
  }

  /**
   * Créer une nouvelle impression
   */
  static creer(donnees) {
    const stmt = db.prepare(`
      INSERT INTO impressions (
        utilisateur_id, template_id, statut, nfc_encode,
        nfc_donnees, pdf_chemin, imprimante
      ) VALUES (
        @utilisateur_id, @template_id, @statut, @nfc_encode,
        @nfc_donnees, @pdf_chemin, @imprimante
      )
    `);

    const result = stmt.run({
      utilisateur_id: donnees.utilisateur_id,
      template_id: donnees.template_id,
      statut: donnees.statut || 'en_attente',
      nfc_encode: donnees.nfc_encode ? 1 : 0,
      nfc_donnees: donnees.nfc_donnees
        ? JSON.stringify(donnees.nfc_donnees)
        : null,
      pdf_chemin: donnees.pdf_chemin || null,
      imprimante: donnees.imprimante || 'Luca 40 KM'
    });

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Mettre à jour le statut d'une impression
   */
  static mettreAJourStatut(id, statut, erreur = null) {
    const stmt = db.prepare(`
      UPDATE impressions
      SET statut = ?, erreur = ?
      WHERE id = ?
    `);
    stmt.run(statut, erreur, id);
    return this.getById(id);
  }

  /**
   * Statistiques des impressions
   */
  static getStatistiques() {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as terminees,
        SUM(CASE WHEN statut = 'erreur' THEN 1 ELSE 0 END) as erreurs,
        SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN nfc_encode = 1 THEN 1 ELSE 0 END) as avec_nfc
      FROM impressions
    `);
    return stmt.get();
  }

  /**
   * Impressions du jour
   */
  static getAujourdhui() {
    const stmt = db.prepare(`
      SELECT
        i.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        t.nom as template_nom
      FROM impressions i
      LEFT JOIN utilisateurs u ON i.utilisateur_id = u.id
      LEFT JOIN templates t ON i.template_id = t.id
      WHERE DATE(i.date_impression) = DATE('now')
      ORDER BY i.date_impression DESC
    `);
    return stmt.all();
  }
}

module.exports = Impression;
