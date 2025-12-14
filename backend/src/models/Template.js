/**
 * Modèle Template
 * Gestion des modèles de cartes pour l'impression
 */

const db = require('../config/database');

class Template {
  /**
   * Récupérer tous les templates
   */
  static getAll() {
    const stmt = db.prepare(`
      SELECT * FROM templates
      WHERE actif = 1
      ORDER BY nom
    `);
    return stmt.all();
  }

  /**
   * Récupérer un template par ID
   */
  static getById(id) {
    const stmt = db.prepare('SELECT * FROM templates WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Récupérer les templates par type
   */
  static getByType(type) {
    const stmt = db.prepare(`
      SELECT * FROM templates
      WHERE type = ? AND actif = 1
      ORDER BY nom
    `);
    return stmt.all(type);
  }

  /**
   * Créer un nouveau template
   */
  static creer(donnees) {
    const stmt = db.prepare(`
      INSERT INTO templates (
        nom, description, type, largeur_mm, hauteur_mm,
        html_recto, html_verso, css, champs_dynamiques
      ) VALUES (
        @nom, @description, @type, @largeur_mm, @hauteur_mm,
        @html_recto, @html_verso, @css, @champs_dynamiques
      )
    `);

    const result = stmt.run({
      nom: donnees.nom,
      description: donnees.description || null,
      type: donnees.type || 'carte_identite',
      largeur_mm: donnees.largeur_mm || 85.6,
      hauteur_mm: donnees.hauteur_mm || 53.98,
      html_recto: donnees.html_recto,
      html_verso: donnees.html_verso || null,
      css: donnees.css || null,
      champs_dynamiques: donnees.champs_dynamiques
        ? JSON.stringify(donnees.champs_dynamiques)
        : null
    });

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Mettre à jour un template
   */
  static mettreAJour(id, donnees) {
    const champsModifiables = [
      'nom', 'description', 'type', 'largeur_mm', 'hauteur_mm',
      'html_recto', 'html_verso', 'css', 'champs_dynamiques', 'actif'
    ];

    const champsAModifier = [];
    const valeurs = [];

    champsModifiables.forEach(champ => {
      if (donnees[champ] !== undefined) {
        champsAModifier.push(`${champ} = ?`);
        let valeur = donnees[champ];
        if (champ === 'champs_dynamiques' && typeof valeur === 'object') {
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

    const sql = `UPDATE templates SET ${champsAModifier.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...valeurs);

    return this.getById(id);
  }

  /**
   * Supprimer un template (désactivation)
   */
  static supprimer(id) {
    const stmt = db.prepare('UPDATE templates SET actif = 0 WHERE id = ?');
    return stmt.run(id);
  }

  /**
   * Dupliquer un template
   */
  static dupliquer(id) {
    const original = this.getById(id);
    if (!original) return null;

    return this.creer({
      ...original,
      nom: `${original.nom} (copie)`,
      champs_dynamiques: original.champs_dynamiques
        ? JSON.parse(original.champs_dynamiques)
        : null
    });
  }
}

module.exports = Template;
